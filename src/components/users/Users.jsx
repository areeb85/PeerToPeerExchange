import React, {useState, useEffect} from 'react'
import supabase from '../dbmanager/Supabase';
import Header from '../header/Header';
import UserCard from './UserCard';
import Fuse from 'fuse.js';

function Users() {
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    let { data: usersData, error } = await supabase
        .from('users')
        .select('*');
    if (error) {
        console.error('Error fetching users:', error);
    } else {
        setUsers(usersData);
        console.log("These are the users", users)
    }
  }
  const options = {
    includeScore: true,
    keys: ['name']  // Only include the 'title' key for searching
  };

  const fuse = new Fuse(users, options);

    // Perform the search
  const results = searchQuery.trim() ? fuse.search(searchQuery).map(result => result.item) : users;
  console.log("These are the results on home page", results);



  return (
    <>
      <Header onSearchChange={setSearchQuery}/>
      <div className="users-container">
              {results.length > 0 ? (
                results.map((user) => (
                    <UserCard key={user.user_id} user={user} />
                ))
              ) 
              : 
              (
                <p>No users found.</p>
              )}
      </div>
    </>
    
  )

}

export default Users