import React, { useState, useRef } from 'react';
import { InputText } from 'primereact/inputtext';
import { Password } from 'primereact/password';
import { Button } from 'primereact/button';
import supabase from '../dbmanager/Supabase';
import CryptoJS from 'crypto-js';
import './Signup.css'; // Import the CSS file here
import { Toast } from 'primereact/toast';
import { useNavigate } from 'react-router-dom';
import Header from '../header/Header';
import logo from '../../assets/logo2.jpg';

        

const Signup = () => {

    const toast = useRef(null);
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [bio, setBio] = useState('');
    const navigate = useNavigate();

    const handleSignUp = async () => {
        // Implementation for sign-up logic goes here
        if (!email || !name || !password || !confirmPassword  || !email.includes("@") || confirmPassword != password) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'Please enter valid details', life: 3000 });
        }

        const { data: userExists, error: userExistsError } = await supabase
            .from('users')
            .select('email')
            .eq('email', email)
            .single(); // Using .single() for simplicity, assuming email uniqueness

        if (userExists) {
            toast.current.show({ severity: 'error', summary: 'Error', detail: 'User already exists', life: 3000 });
        }


        const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000'); // Example static IV
        const key = CryptoJS.enc.Utf8.parse('Areeb'); // Your key as Utf8
        const encryptedOptions = {
            iv: iv,
            mode: CryptoJS.mode.CBC, // CBC mode is commonly used
            padding: CryptoJS.pad.Pkcs7
        };
        const hashedPassword = CryptoJS.AES.encrypt(confirmPassword, key, encryptedOptions).toString();
        const { data, error } = await supabase
            .from('users')
            .insert([
                { email: email, password_hashed: hashedPassword, name: name, bio : bio /* any other fields */ }
            ]);
        
        if (error) console.error('Error signing up:', error.message);

        else {
            toast.current.show({severity : "success", summary : "Great Success!", detail : "User signed up!"})
            window.localStorage.setItem("email", email);
            window.localStorage.setItem("bio", bio);
            window.localStorage.setItem("name", name);
            setTimeout(() => {
                navigate('/login');
            }, 1000); 
        };
    };


    return (
        <>
            <Header/>
            <div className="signup-container">
                <Toast ref={toast}/>
                <img src={logo} alt="Logo" style={{width : "150px", marginBottom : "20px", borderRadius : "12px", height : "150px"}}/>
                <div className="p-fluid" style={{width : "50%"}}>
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText id="Name" value={name} onChange={(e) => setName(e.target.value)} />
                            <label htmlFor="Name">Name</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText id="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <label htmlFor="email">Email</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <Password id="password" value={password} onChange={(e) => setPassword(e.target.value)}  />
                            <label htmlFor="password">Password</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <Password id="confirmPassword" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}  />
                            <label htmlFor="confirmPassword">Confirm Password</label>
                        </span>
                    </div>
                    <div className="p-field">
                        <span className="p-float-label">
                            <InputText id="bio" value={bio} onChange={(e) => setBio(e.target.value)} toggleMask />
                            <label htmlFor="bio">Bio</label>
                        </span>
                    </div>
                    <Button label="Sign Up" onClick={handleSignUp} />
                </div>
            </div>
        </>
        
    );
};

export default Signup;
