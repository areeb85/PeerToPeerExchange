import React from 'react'
import './Users.css'; 

function UserCard({user}) {
    return (
    
        <div className="user-card">
            <h2>{user.name}</h2>
            <p>Email: {user.email}</p>
            <p>Bio : {user.bio}</p>
            <p>Points : {user.points}</p>
        </div>
    );
}

export default UserCard