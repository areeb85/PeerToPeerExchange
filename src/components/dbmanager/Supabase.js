
import { createClient } from '@supabase/supabase-js'
const supabaseUrl = 'https://utjvyryisziuefsfdceq.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV0anZ5cnlpc3ppdWVmc2ZkY2VxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI4MjAxMzAsImV4cCI6MjAyODM5NjEzMH0.bCQvw3B4VLVkNNOThMd2eLLAkcKDhgHF41ufcWtRfLw'
const supabase = createClient(supabaseUrl, supabaseKey)


export const insertBook = async ({ title, author, genre, year, postedBy }) => {
    try {
        const { data, error } = await supabase
            .from('books')
            .insert([
                { title, author, genre, year, postedBy }
            ]);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error adding book:', error);
        return null;
    }
};

export const retrieveBooks = async (userId) => {
    try {
        console.log("This is the user id", userId)
        const {data, error} = await supabase.
        from("books_table")
        .select("*")
        .eq("user_id", userId)
        return data;
    }
    catch (error) {
        console.log(error);
    }
}


export default supabase