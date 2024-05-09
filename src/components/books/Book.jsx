import React, {useState, useEffect, useRef} from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import supabase from '../dbmanager/Supabase';
import './Book.css';
import { useNavigate } from 'react-router-dom';
import { createRequest, updateActiveTime  } from '../backend/functions';
import { useActiveTime }  from '../context/context';
import { Toast } from 'primereact/toast';


function BookCard({ book, onDelete, showDelete, showRequest }) {
  const {activeTime} = useActiveTime();
  const userId = window.localStorage.getItem("user_id");
  const [owner, setOwner] = useState('');
  const [bookId, setBookId] = useState('');
  const [title, setBookTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [year, setYear] = useState('');
  const [summary, setSummary] = useState('');
  const navigate = useNavigate();

  const toast = useRef(null);

  // console.log('Active Time from Context:', activeTime);

  const retrieveUser = async (book_id) => {
    if (!book_id) {
        console.error("No book ID provided");
        return null;
    }
    // First query to fetch the user ID associated with the book
    const { data, error } = await supabase
        .from("books_table")
        .select("user_id")  // Fetch only the necessary column
        .eq("book_id", bookId);
    if (error) {
        console.error("Error fetching user from book:", error.message);
        return null;
    }
    if (data.length === 0) {
        console.error("No book found with the given ID:", bookId);
        return null;
    }
    const user_id = data[0].user_id; // Safely access user_id
    if (!user_id) {
        console.error("No user associated with the book ID:", bookId);
        return null;
    }
    console.log("User ID:", user_id);
    // Second query to fetch user details
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('user_id', user_id);
    if (userError) {
        console.error("Error fetching user details:", userError.message);
        return null;
    }
    return userData;
  }

  useEffect(() => {
    setBookId(book.book_id);
    setBookTitle(book.title);
    setAuthor(book.author);
    setGenre(book.genre);
    setYear(book.year);
    setSummary(book.summary);
  }, [book])

  useEffect(() => {
    const fetchUser = async () => {
      const response = await retrieveUser(bookId)
      if (response) {
        setOwner(response[0].name);
    } else {
        setOwner('Unknown'); // Set a default or placeholder value
    }
    }
    fetchUser()
  }, [bookId, summary])


  const handleDelete = async () => {
    const deleteBookFromSupabase = async (bookId) => {
      const { data, error } = await supabase
        .from('books_table')
        .delete()
        .match({ book_id: bookId });

        const { data: userData, error: fetchError } = await supabase
        .from('users')
        .select('points')
        .eq('user_id', window.localStorage.getItem("user_id"))
        .single();  // Assuming you only get one record back

        if (fetchError) {
            console.error('Error fetching user points:', fetchError);
            throw fetchError;
        }

        // Update points by incrementing them
        const newPoints = userData.points - 1;
        const { data: updatedUserData, error: updateError } = await supabase
            .from('users')
            .update({ points: newPoints })
            .eq('user_id', window.localStorage.getItem("user_id"));
        
        
        if (updateError) {
            console.error('Error updating user points:', updateError);
            throw updateError;
        }
        
        console.log("Reduced points!!");
        // return updatedUserData; // Return the updated user data
  
      if (error) {
        console.error('Failed to delete book from database:', error.message);
        return false; // Indicates failure
      }
      console.log('Book deleted from database');
      return true; // Indicates success
    };
    await updateActiveTime(userId, activeTime)
    deleteBookFromSupabase(bookId);
    onDelete();
  }



  const handleRequestBook = async (bookId) => {
    const userId = window.localStorage.getItem("user_id") // Ensure you are using a method to get the current user's ID;
    if (!userId) {
      console.error('User must be logged in to request a book');
      navigate('/login');
      return;
    }

    try {
      // Assuming createRequest is a function that handles the backend process

      const time = await updateActiveTime(userId, activeTime);
      console.log("time", time);
      const totalTime = activeTime + time.active_time
      const newRequest = await createRequest({bookId, userId, totalTime});
      toast.current.show({severity : "success", summary : "Your request has been queued!", detail : ""})
      if (newRequest) {
        console.log('Request successful:', newRequest);
        // Optionally update UI or give feedback to the user
        
      }
    } catch (error) {
      console.error('Error requesting book:', error);
    }
  };


  const header = (
    <div className="book-card-header">
      
      <span className="book-title">{book.title}</span>
      {showDelete && (
        <Button 
          icon="pi pi-trash" 
          // className="p-button-rounded p-button-danger p-button-outlined"
          style = {{width: "20%"}}
          aria-label="Delete"
          onClick={handleDelete}
          // style={{ marginLeft: 'auto' }}
        />
      )}
      {showRequest && (<Button 
        icon="pi pi-bookmark" 
        className="p-button-help p-button-outlined"
        style={{ width : "20%" }}
        onClick={() => handleRequestBook(bookId)}
        tooltip="Request Book"
      />)}
    </div>
  );
  
  

  const footer = (
    <span>
      Posted by: {owner}
    </span>
  );

  return (
    <>
      <Toast ref={toast} position='top-center'/>
      <Card 
        // title={title} 
        subTitle={`${author} - ${genre} (${year})`} 
        style={{marginTop : "10px", height : "350px", minWidth : "300px"}} 
        header = {header} 
        footer={footer}
      >
          <p className="m-0" style={{ whiteSpace: 'pre-line' }}>{summary}</p>
      </Card>
    </>
    
  );
}

export default BookCard;
