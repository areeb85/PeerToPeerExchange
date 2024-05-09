import React, { createContext, useState, useEffect, useContext } from 'react';
import { fbfunctions } from '../../Firebase-config';
import { httpsCallable } from 'firebase/functions';

const ActiveTimeContext = createContext(0);

export const useActiveTime = () => useContext(ActiveTimeContext);
export default ActiveTimeContext

export const ActiveTimeProvider = ({ children }) => {
    const [activeTime, setActiveTime] = useState(0);
    let intervalId;
    useEffect(() => {
        let intervalId;  // Declare intervalId inside useEffect to ensure it is captured in closure correctly
    
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                intervalId = setInterval(() => {
                    
                    setActiveTime(prevTime => {
                        // console.log("Active Time Updated: ", prevTime + 1);  // This will log every second when tab is visible
                        return prevTime + 1;
                    });
                }, 1000);
            } else {
                clearInterval(intervalId);
            }
        };
    
        // Register the event listener
        document.addEventListener('visibilitychange', handleVisibilityChange);
    
        // Initial check in case the tab is already visible when the component mounts
        handleVisibilityChange();
    
        return () => {
            clearInterval(intervalId);  // Clear on component unmount
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const getBooks = async () => {
        try{
            const functionGet =  httpsCallable(fbfunctions, "getBooks")
            const result = await Promise.resolve(functionGet());
            console.log(result.data);
            return result.data;
        }
         catch (error) {
            console.log("There has been an error");
            
         }
    }

    const getUsers = async () => {
        try
        {
            const functionGet = httpsCallable(fbfunctions, "getUsers");
            const result = await Promise.resolve(functionGet());
            console.log("These are all the users", result.data);
            return result.data

        }
        catch (error) 
        {
            console.log("There has been an error fetching the users");
            return null;
        }
    }



    

    return (
        <ActiveTimeContext.Provider 
            value={{
                activeTime,
                getBooks,
                getUsers
            }}
        >
            {children}
        </ActiveTimeContext.Provider>
    );
};
