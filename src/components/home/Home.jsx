import React, {useState, useEffect, useContext} from 'react'
import supabase from '../dbmanager/Supabase'
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import BookCard from '../books/Book';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import Fuse from 'fuse.js';
import Header from '../header/Header';
import ActiveTimeContext from '../context/context';


function Home() {

    const [books, setBooks] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const userId = window.localStorage.getItem("user_id");
    const {getBooks} = useContext(ActiveTimeContext);

    useEffect(() => {
        const fetchData = async () => {
            const response = await getBooks();
            console.log("Inside useEffect", response);
            if (response) {
                setBooks(response)
            }
        }
        fetchData()
    }, [])


    // useEffect(() => {
    //     const fetchBooks = async () => {
    //         let { data: books, error } = await supabase
    //             .from('books_table')
    //             .select('*');
    //         if (error) console.log('Error fetching books:', error);
    //         else setBooks(books);
    //     };

    //     fetchBooks();
    //     console.log("Books on the home page", books)
    // }, []);

    const options = {
        includeScore: true,
        keys: ['title']  // Only include the 'title' key for searching
    };

    const fuse = new Fuse(books, options);

    // Perform the search
    const results = searchQuery.trim() ? fuse.search(searchQuery).map(result => result.item) : books;


    return (
        <>
            <Header onSearchChange={setSearchQuery}/>
            <div 
                className='main-container'
            >
                {results.length > 0 ? (
                    results.map((book) => (
                        book.user_id == userId ? 
                        <BookCard
                            key={book.book_id}
                            book={book}
                            showDelete={false}
                            showRequest = {false}
                        />
                        : 
                        <BookCard
                            key={book.book_id}
                            book={book}
                            showDelete={false}
                            showRequest = {true}
                        />
                    ))
                ) : (
                    <p style={{color: "green"}}>No matching books found.</p>
                )}
            </div>
        </>
        
    )

}

export default Home