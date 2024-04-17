import { Menubar } from 'primereact/menubar';
import React from 'react'
import { InputText } from 'primereact/inputtext'; 
import { Button } from 'primereact/button'; 
import './Header.css'
import { useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo2.jpg'
import { updateActiveTime } from '../backend/functions';
import { useActiveTime } from '../context/context';


function Header({onSearchChange}) {
   const {activeTime} = useActiveTime();
   const navigate = useNavigate();
   const location = useLocation();
   const isAuthPage = location.pathname === '/login' || location.pathname === "/signup" ;
   const isHomePage = location.pathname == "/";
   const isUserProfilePage = location.pathname == "/userprofile"

   
   let items; 

   const userId = localStorage.getItem('user_id');

    // Dynamically set the account items based on user authentication status
    const accountItems = userId ? [
        { label: "My Profile", icon: 'pi pi-fw pi-user', command: async () => await updateAndNavigate('/userprofile') }
    ] : [
        { label: 'Login', icon: 'pi pi-fw pi-sign-in', command: async () => await updateAndNavigate('/login') },
        { label: 'Sign Up', icon: 'pi pi-fw pi-user-plus', command: async () => await updateAndNavigate('/signup') }
    ];
   

   if (isAuthPage) {
      items = [
         { label: 'Home', icon: 'pi pi-fw pi-home', command: async () => await updateAndNavigate('/') },
         { label: 'Users', icon: 'pi pi-fw pi-user', command: async () => await updateAndNavigate('/users') }
      ];
   } 
   else if (isUserProfilePage) {
      items = [
         { label: 'Home', icon: 'pi pi-fw pi-home', command: async () => await updateAndNavigate('/') },
         { label: 'Users', icon: 'pi pi-fw pi-user', command: async () => await updateAndNavigate('/users') },
         {
         label: 'Account',
         icon: 'pi pi-fw pi-cog',
         items: [
            // { label: 'Login', icon: 'pi pi-fw pi-sign-in', command: () => navigate('/login') },
            // { label: 'Sign Up', icon: 'pi pi-fw pi-user-plus', command: () => navigate('/signup') },
            { label: "Log out", icon: "pi pi-sign-out", command : async () => await handleLogout()}
         ]
         }  
      ]
   }
   else {
      items = [
         { label: 'Home', icon: 'pi pi-fw pi-home', command: async () => await updateAndNavigate('/') },
         { label: 'Users', icon: 'pi pi-fw pi-user', command: async () => await updateAndNavigate('/users') },
         {
         label: 'Account',
         icon: 'pi pi-fw pi-cog',
         items: accountItems
         } 
      ]
   }

   const updateAndNavigate = async (page) => {
      const userId = window.localStorage.getItem("user_id");
      await updateActiveTime(userId, activeTime);
      navigate(page);
   }



   
   const handleLogout = async () => {
      localStorage.removeItem("user_id");
      localStorage.removeItem("email");
      localStorage.removeItem("bio");
      localStorage.removeItem("name");
      await updateAndNavigate('/');
   }
 

   return (
      <div className='navbar'>
         <Menubar
            model={items}
            start={
               <>
                  {
                     !isAuthPage &&
                     <img src={logo} alt="Logo" style={{ marginRight: 10, height: '40px', width: "40px", borderRadius: "8px" }} />
                  }
                  {/* {
                     !isAuthPage && !isHomePage ?  <InputText placeholder="Search" type="text" onChange={(e) => {onSearchChange(e.target.value)}}/> : null
                  } */}
               </>
            }
            end={!isAuthPage && !isUserProfilePage && <InputText placeholder="Search" type="text" onChange={(e) => {onSearchChange(e.target.value)}}/>}
         />
      </div>
   )
}

export default Header

