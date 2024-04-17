import React, { useEffect, useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { InputTextarea } from 'primereact/inputtextarea';
import Header from '../header/Header';
import './userprofile.css'
import BooksContainer from '../books/BooksContainer';
import { Dialog } from 'primereact/dialog';

import { Toast } from 'primereact/toast';
import supabase from '../dbmanager/Supabase';
import { retrieveBooks } from '../dbmanager/Supabase';
import { useNavigate } from 'react-router-dom';
import UserCard from '../users/UserCard';
import '../users/Users.css';
import { useActiveTime } from '../context/context';
import { updateActiveTime } from '../backend/functions';
import Notifications from '../notifications/Notifications';
        

function UserProfile() {
    const toast = useRef(null);
    const {activeTime} = useActiveTime();
    const userId = window.localStorage.getItem("user_id");

    
    const [editMode, setEditMode] = useState(false);
    const [books, setBooks] = useState([{}]);
    const [dialog, setDialog] = useState(false);
    const [title, setTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [year, setYear] = useState('');
    const [summary, setSummary] = useState('')
    const [genre, setGenre] = useState('');
    const [condition, setCondition] = useState('');
    const [points, setPoints] = useState(0);
    const navigate = useNavigate();
    const [user, setUser] = useState({
        name: 'John Doe',
        email: 'john.doe@example.com',
        bio: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
        points : points
    });

    useEffect(() => {
        const fetchPoints = async () => {
            const {data, error} = await supabase.
            from("users")
            .select("points")
            .eq("user_id", window.localStorage.getItem("user_id"))
            .single()
            console.log("Points : ", data);
            setPoints(data.points)
        }
        fetchPoints()
    }, [])


    useEffect(() => {
        setUser({
            name : window.localStorage.getItem("name"),
            email : window.localStorage.getItem("email"),
            bio : window.localStorage.getItem("bio"),
            points : points
        })
    }, [points])

    useEffect(() => {
        const fetchData = async () => {
            console.log("User Id in retrieve books", window.localStorage.getItem("user_id"));
            const userId = window.localStorage.getItem("user_id")
            const books = await retrieveBooks(userId);
            console.log("these are the books", books);
            setBooks(books);
            // return books;
        }
        fetchData()
    }, [])

    if (window.localStorage.getItem("user_id") == null) {
        navigate("/login")
    }

  

    // const handleGenerateSummary = async () => {
    //     const summary = generateBookSummary(book1.title, book1.author);
    //     console.log("This is the summary", summary);
    // }

    const addBook = async () => {
        const data = await updateActiveTime(userId, activeTime);

        if (!title || !author || !genre || !year || !summary) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter valid/complete details', life: 3000 });
            return;
        }
        const exists = false
        if (exists) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Book already exists!', life: 3000 });
                setTitle('');
                setAuthor('');
                setGenre('');
                setYear('');
                setSummary('');
                setDialog(false);
                return;
        }
        else {
            setBooks(books => [
                ...books,
                {
                    title: title,
                    author: author,
                    genre: genre,
                    year: year,
                    postedBy: window.localStorage.getItem("user_id"),
                    summary: summary,
                    condition : condition
                }
            ]);
            try {  
                const { data, error } = await supabase
                    .from('books_table')
                    .insert([
                        { 
                            user_id: window.localStorage.getItem("user_id"), 
                            title: title, 
                            author: author, 
                            genre: genre, 
                            year: year, 
                            summary: summary, 
                            condition: condition
                        }
                    ]);
                console.log("Tihs is the data after inserting book", data);
                
                    // Fetch current points
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
                const newPoints = userData.points + 1;
                const { data: updatedUserData, error: updateError } = await supabase
                    .from('users')
                    .update({ points: newPoints })
                    .eq('user_id', window.localStorage.getItem("user_id"));
                
                
                if (updateError) {
                    console.error('Error updating user points:', updateError);
                    throw updateError;
                }
                
                console.log("Added points!!");
                // return updatedUserData; // Return the updated user data
                
            } catch (error) {
                toast.current.show({ severity: 'error', summary: 'Error', detail: 'Error adding book to database!', life: 3000 });
                console.error('Error processing transaction:', error);
                return null;
            }
        }
    
        setTitle('');
        setAuthor('');
        setGenre('');
        setYear('');
        setSummary('');
        setCondition('');
        setDialog(false);
    }


    // const handleUpdate = () => {
    //     console.log('Updated user details:', user);
    //     setEditMode(false);
    // };

    // const handleEdit = () => {
    //     setEditMode(!editMode); // Toggle the edit mode on and off
    // };

    // const handleChange = (e) => {
    //     const { name, value } = e.target;
    //     setUser(prevState => ({
    //         ...prevState,
    //         [name]: value
    //     }));
    // };

    



    return (
      <>
        <Toast ref={toast}/>
        <Header />

        <div className='user-container'>
            <UserCard user = {user}/>
        </div>

        <>
            <Notifications />
        </>
    
        <div className='collection-and-add-book-container'>
            <p className='my-text-style'>Book Collection</p>
            <Button 
                label = "Add book" 
                style = {{maxWidth : "300px"}} 
                onClick={() => {setDialog(true)} }
            />
            <Dialog header="Add Book" visible={dialog} style={{ width: '50vw' }} onHide={() => setDialog(false)}>
                <span className='p-float-label'>
                    <InputText id="Title" value={title} onChange={(e) => setTitle(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="email">Title</label>   
                </span>
                <span className='p-float-label'>
                    <InputText id="Author" value={author} onChange={(e) => setAuthor(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="Author">Author</label>   
                </span>
                <span className='p-float-label'>
                    <InputText id="Year" value={year} onChange={(e) => setYear(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="Year">Year</label>   
                </span>
                <span className='p-float-label'>
                    <InputText id="Summary" value={summary} onChange={(e) => setSummary(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="Summary">Summary</label>   
                </span>
                <span className='p-float-label'>
                    <InputText id="Genre" value={genre} onChange={(e) => setGenre(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="Genre">Genre</label>   
                </span>
                <span className='p-float-label'>
                    <InputText id="Condition" value={condition} onChange={(e) => setCondition(e.target.value)} style={{marginBottom : "20px"}}/>
                    <label htmlFor="Condition">Condition</label>   
                </span>
                <Button label = "Submit" onClick={addBook} />
                {/* <Button label = "Generate book summary" onClick= {generateBookSummary}/> */}
            </Dialog>
        </div>
    
        <BooksContainer books={books} />
        
      </>
    );
}

export default UserProfile;
