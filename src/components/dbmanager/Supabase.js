
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

console.log(supabaseUrl);
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