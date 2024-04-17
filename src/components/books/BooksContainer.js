import React, {useState, useEffect} from 'react';
import BookCard from './Book';
import './Book.css'

export default function BooksContainer(props) {

  
  const [books, setBooks] = useState(props.books);

  useEffect(() => {
    setBooks(props.books)
  }, [props.books])

  const handleDeleteBook = (bookId) => {
    const updatedBooks = books.filter(book => book.book_id !== bookId);
    setBooks(updatedBooks); // Update the state, triggering a re-render
  }

  
  return (
    <div className='container'>
      {books.map((book, index) => (
        <BookCard
          key={book.book_id} 
          book={book} 
          onDelete = {() => {handleDeleteBook(book.book_id)}}
          showDelete = {true}
          showRequest = {false}
        />
      ))}
    </div>
  );
}