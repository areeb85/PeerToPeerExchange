import logo from './logo.svg';
import Login from './components/login/Login'
import Signup from './components/signup/Signup';
import Userprofile from './components/userprofile/Userprofile';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from './components/header/Header';
import './App.css';
import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css'; 
import 'primeicons/primeicons.css'; 
import Home from './components/home/Home';
import Users from './components/users/Users';
import { ActiveTimeProvider } from './components/context/context';
import BookCard from './components/books/Book';
import BooksContainer from './components/books/BooksContainer';


function App() {
  
  return (
    <>
      <ActiveTimeProvider>
        <Router>
          <Routes>
            <Route path = '/signup' element = {<Signup/>}/>
            <Route path='/login' element={<Login/>}/>
            <Route path='/' element={<Home/>}/>
            <Route path='/userprofile' element={<Userprofile/>}/>
            <Route path = '/users' element = {<Users/>}/>
            <Route path = '/books' element = {<BookCard />}/>
            <Route path = '/bookscontainer' element = {<BooksContainer/>}/>
          </Routes>
        </Router>
      </ActiveTimeProvider>
    </>
  )
}

export default App;
