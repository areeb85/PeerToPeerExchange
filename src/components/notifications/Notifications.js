import React, {useState, useEffect} from 'react'
import { fetchNotifications } from '../backend/functions';
import './Notifications.css';
import { approveTransfer } from '../backend/functions';

function Notifications() {


    const [notifications, setNotifications] = useState([]);
    const userId = window.localStorage.getItem("user_id");


    useEffect(() => {
        const fetchData = async () => {
            const response = await fetchNotifications(userId);
            console.log("These are the notifications, ", notifications)
            setNotifications(response);
        }
        fetchData();
    }, [])

    const handleApproval = async (bookId, currentOwnerId, requestId) => {
        const response = await approveTransfer(bookId, currentOwnerId, requestId);
        console.log("Approval response", response);
        alert("Request Approved!")
    };


    return (
        <div className="user-card">
            <h2>Notifications</h2>
            {notifications.length > 0 ? (
                notifications.map((notification) => (
                    <>

                        <p>
                            You are in possession of <span style={{fontWeight : "bold"}}>{notification.bookName}</span>  and have been requested to pass it on.
                            Please approve this request once you are done reading.
                        </p>
                        <div className="actions">
                            <button onClick={() => 
                                handleApproval(notification.book_id, notification.user_id,  notification.request_id)}
                            >
                                    Approve
                            </button>
                        </div>
                    </>
                    
                ))
            ) : (
                <p>No new notifications.</p>
        )}
        </div>
    )
}

export default Notifications