import supabase from "../dbmanager/Supabase";

export async function fetchAndSortRequests(bookId) {
    try {
        // Fetch requests and user stats for a specific book
        const { data: requests, error } = await supabase
            .from('requests_table')
            .select("*")
            .eq('book_id', bookId);

        if (error) throw error;

        console.log("Requests: " , requests);

        // Assume maximum points and active_minutes for normalization
        const maxPoints = Math.max(...requests.map(req => req.requester_points));
        const maxActiveMinutes = Math.max(...requests.map(req => req.requester_active_time));

        // Normalize points and active_minutes, then calculate a combined score
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
        return [];
    }
};

export async function createRequest(data) {
    // console.log("bookid insidde create request", data);

    try {
        // Fetch the latest user stats and book owner data
        const { data: userData, error: userDataError } = await supabase
            .from('users')
            .select('points')
            .eq('user_id', data.userId)
            .single();

        const { data: bookData, error: bookDataError } = await supabase
            .from("books_table")
            .select("user_id") // Assuming 'user_id' is the owner of the book
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

        // If a request already exists, return a message or throw an error
        if (existingRequest != null) {
            console.log('Request already exists:', existingRequest);
            const sortedRequests = await fetchAndSortRequests(data.bookId);
            console.log("These are the sorted requests", sortedRequests);
            return;
        }

        // Insert the new request into the 'requests' table
        const { data: newRequest, error: requestError } = await supabase
            .from('requests_table')
            .insert([{
                book_id: data.bookId,
                requester_id: data.userId,
                requester_points: userData.points,
                owner_id : bookData.user_id,
                request_time : new Date().toISOString(),
                requester_active_time : data.totalTime
            }]);
        if (requestError) throw requestError;

        const sortedRequests = await fetchAndSortRequests(data.bookId);
        const insertableRequest = sortedRequests[0];
        console.log("These are the sorted requests", sortedRequests);

        createOrUpdateNotifications({bookId: insertableRequest.book_id, userId : insertableRequest.owner_id, requestId : insertableRequest.request_id })
        console.log("Updated notifications!");

        return newRequest;
    } catch (error) {
        console.error('Error creating request:', error);
        return null;
    }
}

export const createOrUpdateNotifications = async (data) => {
    // we will need these to check if the notifications already exist in the table
    const bookId = data.bookId;
    const userId = data.userId;
    const requestId = data.requestId;


    try {
        const { data: existing, error: findError } = await supabase
        .from('notifications_table')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .single();  // Use single if you expect only one record
        
        if (existing != null) {
            const { data: updated, error: updateError } = await supabase
            .from('notifications_table')
            .update({request_id : requestId})
            .match({ user_id: userId, book_id: bookId });

            if (updateError) {
                console.error('Error updating data: ', updateError);
                return;
            }
            console.log('Record updated: ', updated);
        } else {
            const { data: inserted, error: insertError } = await supabase
            .from('notifications_table')
            .insert([
                { user_id: userId, book_id: bookId, request_id : requestId }
            ]);

            if (insertError) {
                console.error('Error inserting data: ', insertError);
                return;
            }
            console.log('Record inserted: ', inserted);
        }
        


    } catch (error) {
        console.log("There was an error interacting with the notifications table")
    }
}

/**
 * Updates the active time for a specific user.
 * @param {string} userId The ID of the user whose active time is being updated.
 * @param {number} activeTimeSeconds The additional active time to be added, in seconds.
 */
export const updateActiveTime = async (userId, activeTimeSeconds) => {
    try {
        const { data, error } = await supabase
            .from('users')  // The table name
            .update({ active_time: activeTimeSeconds })  // Assuming 'active_time' is the column name
            .eq('user_id', userId)  // Assuming 'user_id' is the identifier
            .select('active_time')  // Selects only the active_time column to return
            .single();

        if (error) throw error;
        console.log('Updated active time:', data);
        return data;  // Return the updated data
        
    } catch (error) {
        console.error('Error updating active time:', error);
        return null;
    }
};



export const fetchNotifications = async (userId) => {
    try {

        const { data, error } = await supabase
          .from('notifications_table') // Pointing to the 'notifications' table
          .select('*')
          .eq('user_id', userId);

        if (data != null) {
            const fetchBookPromises = data.map(async (notification) => {
                const { data, error } = await supabase
                    .from('books_table')
                    .select('title')
                    .eq('book_id', notification.book_id)
                    .single();
        
                if (error) {
                    console.error('Error fetching book name:', error);
                    return notification; // Return original notification if there's an error
                }
        
                // Augment the notification with the book name
                return {
                    ...notification,
                    bookName: data.title
                };
            });
            return Promise.all(fetchBookPromises);
        }
        else {
            return []
        }

    } catch (error) {

    }
};


export async function approveTransfer(bookId, currentOwnerId, requestId) {
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

        const {error : updateRequestsBookOwnerError} = await supabase
            .from("requests_table")
            .update({owner_id : request.requester_id})
            .eq('book_id', bookId);
        if (updateRequestsBookOwnerError) throw updateRequestsBookOwnerError;

        const updatedRequests = await fetchAndSortRequests(bookId);


        // Check for additional requests
        // const { data: nextRequests, error: nextRequestsError } = await client
        //     .from('requests')
        //     .select('*')
        //     .eq('book_id', bookId)
        //     .order('created_at', { ascending: true })
        //     .limit(1);
        // if (nextRequestsError) throw nextRequestsError;

        // Create a notification for the next user in line if there are further requests
        if (updatedRequests.length > 0) {
            const { error: newNotificationError } = await supabase
                .from('notifications_table')
                .insert({
                    book_id: bookId,
                    request_id: updatedRequests[0].request_id,
                    user_id : request.requester_id
                });
            if (newNotificationError) throw newNotificationError;
        }


        console.log('Ownership transfer and notification handling completed successfully.');
        return true;
    } catch (error) {
        console.error('Error during the transfer process:', error);
        // Optionally, add a rollback transaction here if supported by your DB/backend setup
        return false;
    }
}


