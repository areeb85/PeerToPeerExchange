import React, { createContext, useState, useEffect, useContext } from 'react';

const ActiveTimeContext = createContext(0);

export const useActiveTime = () => useContext(ActiveTimeContext);

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
    

    return (
        <ActiveTimeContext.Provider value={{activeTime}}>
            {children}
        </ActiveTimeContext.Provider>
    );
};
