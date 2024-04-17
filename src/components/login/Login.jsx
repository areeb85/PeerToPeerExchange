import React, { useState, useEffect, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import  supabase  from '../dbmanager/Supabase'; 
import { Toast } from 'primereact/toast';
import CryptoJS from "react-native-crypto-js";
import { useNavigate } from 'react-router-dom';
import Signup from '../signup/Signup';
import './Login.css'
import logo from '../../assets/logo2.jpg';

import Header from '../header/Header';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [hashedPassword, setHashedPassword] = useState('')
    const toast = useRef(null);
    const navigate = useNavigate();

    if (window.localStorage.getItem("user_id") != null)
    {
        navigate('/userprofile');
    }


    useEffect(() => {
        const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000'); // Example static IV
        const key = CryptoJS.enc.Utf8.parse('Areeb'); // Your key as Utf8
        const encryptedOptions = {
            iv: iv,
            mode: CryptoJS.mode.CBC, // CBC mode is commonly used
            padding: CryptoJS.pad.Pkcs7
        };
        const newPassord = CryptoJS.AES.encrypt(password, key, encryptedOptions).toString();
        const newPassword2 = CryptoJS.AES.encrypt(password, key, encryptedOptions).toString();

        console.log("This is the new password", newPassord);
        console.log("This is the newPAssword 2", newPassword2);
        setHashedPassword(newPassord);
    }, [password]) 




    const handleLogin = async () => {
        // Implement your login logic here, possibly using Supabase
        try {
            // Assuming you have a secure endpoint/method to verify the email and hashed password
            console.log("Is it coming here ?")
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .eq('password_hashed', hashedPassword)
                // .single();
            console.log("this is the data", data);
    
            if (error) throw error;
    
            if (data.length >= 1) {
                toast.current.show({ severity: 'success', summary: 'Success', detail: 'Login successful.', life: 3000 });
                localStorage.setItem("bio", data[0]["bio"]);
                localStorage.setItem("email", data[0]["email"]);
                localStorage.setItem("name", data[0]["name"]);
                localStorage.setItem("user_id", data[0]["user_id"]);
                setTimeout(() => {
                    navigate("/userprofile")
                }, 1000)
                // Handle successful login
            } else {
                toast.current.show({ severity: 'error', summary: 'Login Failed', detail: 'Invalid credentials.', life: 3000 });
            }
        } catch (error) {
            console.error('Login error:', error.message);
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Login failed. Please try again later.', life: 3000 });
        }
    };

    const switchToSignUp = () => {
        navigate("/signup");
    }





    return (
        <>
            <Header/>
            <div className="login-container">
                <img src={logo} alt="Logo" style={{width : "150px", marginBottom : "20px", borderRadius : "12px", height : "150px"}}/>
                <Toast ref={toast} position='top-center'/>
                
                <div style={{width : "50%"}}>
                    <div>
                        <span className="p-float-label p-field">
                            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="email">Email</label>
                        </span>
                    </div>
                    <div >
                        <span className="p-float-label">
                            <InputText id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                            <label htmlFor="password">Password</label>
                        </span>
                    </div>
                    <Button label="Login" onClick={handleLogin} />
                </div>
                <p 
                    style={{color : "green"}}
                >
                    Dont have an account? 
                    <span 
                        style={{color: "blue", cursor : "pointer"}}
                        onClick={switchToSignUp}
                    >
                        Sign up instead
                    </span>
                </p>
            </div>
        </>
        
    );
};

export default LoginPage;
