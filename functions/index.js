/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const functions = require('firebase-functions');
const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const { createClient } = require('@supabase/supabase-js');

const cors = require('cors')({ origin: true }); 
const admin = require("firebase-admin");
const { onCall } = require('firebase-functions/v2/https');
admin.initializeApp();

// console.log("URL", process.env.SUPABASE_URL)

const supabase = createClient("https://utjvyryisziuefsfdceq.supabase.co", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0anZ5cnlpc3ppdWVmc2ZkY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4MjAxMzAsImV4cCI6MjAyODM5NjEzMH0.bCQvw3B4VLVkNNOThMd2eLLAkcKDhgHF41ufcWtRfLw");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onCall((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});


exports.fetchAndSortRequests = onCall(async (request, response) => {
    // Check for GET request and required parameters
    // if (request.method !== 'GET') {
    //     return response.status(405).send('Method Not Allowed');
    // }
    if (!request.data.bookId) {
        return response.status(400).send('Book ID is required');
    }
    const bookId = request.data.bookId;
    console.log("This is the book Id", bookId);


    try {
        // Fetch requests and user stats for a specific book
        const { data: requests, error } = await supabase
            .from('requests_table')
            .select("*")
            .eq('book_id', bookId);

        if (error) throw error;

        console.log("Requests: ", requests);

        // Calculate max points and active minutes for normalization
        const maxPoints = Math.max(...requests.map(req => req.requester_points));
        const maxActiveMinutes = Math.max(...requests.map(req => req.requester_active_time));

        // Normalize and calculate a priority score
        requests.forEach(req => {
            const normalizedPoints = (req.requester_points / maxPoints) || 0; // Avoid division by zero
            const normalizedActiveMinutes = (req.requester_active_time / maxActiveMinutes) || 0;
            req.priorityScore = normalizedPoints + normalizedActiveMinutes; // Simple additive model for priority
        });

        // Sort requests based on the calculated priority score, highest first
        requests.sort((a, b) => b.priorityScore - a.priorityScore);

        return requests;
    } catch (error) {
        console.error('Failed to fetch and sort requests:', error);
        // response.status(500).send('Failed to fetch and sort requests');
    }
});

exports.createRequest = onCall( async (req, res) => {
    // if (req.method !== 'POST') {
    //     return res.status(405).send('Method Not Allowed');
    // }

    const data = req.data;

    try {
        // Fetch the latest user stats and book owner data
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('points')
            .eq('user_id', data.userId)
            .single();

        const { data: bookData, error: bookDataError } = await supabase
            .from("books_table")
            .select("user_id")
            .eq("book_id", data.bookId)
            .single();

        // Handle possible errors
        if (userDataError) throw userDataError;
        if (bookDataError) throw bookDataError;

        const { data: existingRequest, error: existingRequestError } = await supabase
            .from('requests_table')
            .select('*')
            .eq('book_id', data.bookId)
            .eq('requester_id', data.userId)
            .single();

        // If a request already exists
        if (existingRequest) {
            return null;
        }

        // Insert the new request into the 'requests' table
        const { data: newRequest, error: requestError } = await supabase
            .from('requests_table')
            .insert([{
                book_id: data.bookId,
                requester_id: data.userId,
                requester_points: userData.points,
                owner_id: bookData.user_id,
                request_time: new Date().toISOString(),
                requester_active_time: data.totalTime
            }]);

        if (requestError) throw requestError;

        // Call sorting function (assuming fetchAndSortRequests is adapted for Firebase and deployed)
        // This would typically be a separate function or included logic, not a call to another HTTP function.
        // const sortedRequests = await fetchAndSortRequests(data.bookId); // This is pseudo-code for demonstration.

        // Return the new request details
        return data
        // res.status(201).send(newRequest);
    } catch (error) {
        console.error('Error creating request:', error);
        // res.status(500).send('Internal Server Error'); 
    }
});


exports.createOrUpdateNotifications = onCall(async (req, res) => {
    // if (req.method !== 'POST') {
    //     return res.status(405).send('Method Not Allowed');
    // }

    const { bookId, userId, requestId } = req.data;

    try {
        const { data: existing, error: findError } = await supabase
            .from('notifications_table')
            .select('*')
            .eq('user_id', userId)
            .eq('book_id', bookId)
            .single();  // Use single if you expect only one record

        if (findError) {
            throw findError;
        }

        if (existing) {
            const { data: updated, error: updateError } = await supabase
                .from('notifications_table')
                .update({ request_id: requestId })
                .match({ user_id: userId, book_id: bookId });

            if (updateError) {
                throw updateError;
            }
            res.status(200).send({ message: 'Record updated', updated });
        } else {
            const { data: inserted, error: insertError } = await supabase
                .from('notifications_table')
                .insert([
                    { user_id: userId, book_id: bookId, request_id: requestId }
                ]);

            if (insertError) {
                throw insertError;
            }
            // res.status(201).send({ message: 'Record inserted', inserted });
        }
    } catch (error) {
        console.error('Error interacting with the notifications table:', error);
        // res.status(500).send({ error: 'Failed to create or update notification', details: error });
    }
});

exports.updateActiveTime = onCall(async (req, res) => {
    // if (req.method !== 'POST') {
    //     return res.status(405).send('Method Not Allowed');
    // }

    // Extract user ID and active time from the request body
    const { userId, activeTimeSeconds } = req.data;
    if (!userId || activeTimeSeconds == null) {
        // return res.status(400).send('Missing parameters');
    }

    try {
        const { data, error } = await supabase
            .from('users')
            .update({ active_time: activeTimeSeconds })
            .eq('user_id', userId)
            .select('active_time')
            .single();

        if (error) {
            throw error;
        }

        console.log('Updated active time:', data);
        return data;
    } catch (error) {
        console.error('Error updating active time:', error);
        // res.status(500).send({ error: 'Failed to update active time', details: error.message });
    }
});


exports.approveTransfer = onCall(async (req, res) => {
    // if (req.method !== 'POST') {
    //     return res.status(405).send('Method Not Allowed');
    // }

    const { bookId, currentOwnerId, requestId } = req.data;
    if (!bookId || !currentOwnerId || !requestId) {
        // return res.status(400).send('Missing parameters');
    }

    try {
        // Remove the notification
        const { error: notificationError } = await supabase
            .from('notifications_table')
            .delete()
            .match({ book_id: bookId, user_id: currentOwnerId });
        if (notificationError) throw notificationError;

        // Find the request to be approved
        const { data: request, error: requestError } = await supabase
            .from('requests_table')
            .select('*')
            .eq('request_id', requestId)
            .single();
        if (requestError) throw requestError;

        // Remove the request
        const { error: deleteRequestError } = await supabase
            .from('requests_table')
            .delete()
            .match({ request_id: requestId });
        if (deleteRequestError) throw deleteRequestError;

        // Update the book's owner
        const { error: updateBookError } = await supabase
            .from('books_table')
            .update({ user_id: request.requester_id })
            .eq('book_id', bookId);
        if (updateBookError) throw updateBookError;

        // Update remaining requests with the new owner id
        const { error: updateRequestsBookOwnerError } = await supabase
            .from("requests_table")
            .update({ owner_id: request.requester_id })
            .eq('book_id', bookId);
        if (updateRequestsBookOwnerError) throw updateRequestsBookOwnerError;

        // Optionally re-sort and manage requests after changes
        // This might involve complex logic and additional function calls

        // Response with success message
        // res.status(200).send('Ownership transfer and notification handling completed successfully.');
    } catch (error) {
        console.error('Error during the transfer process:', error);
        // res.status(500).send({ error: 'Failed to complete the transfer process', details: error.message });
    }
});


exports.getBooks = onCall(async (request, context) => {
    try {
        const {data: bookData, error: requestError} = await supabase
        .from("books_table")
        .select("*");
       
        if (bookData) {
            return bookData;
        }
    }
    catch (error) {
        console.log("There has been an error in fetching the books");
        return null;
    }
});


exports.getUsers = onCall(async (request, context) => {
    try {

        const {data : userData, error: requestError} = await supabase
        .from("users")
        .select("*");
        if (userData) {
            return userData;
        }

    }
    catch (error) {

        console.log("There has been an error fetching the list of users")
        return null;
        
    }
})