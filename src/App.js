import React, { useState } from 'react';
import './App.css';

import { MessageBox } from './Messages';
import { Login } from './Login/Login';

// import io from "socket.io-client";

// jan (mint): http://10.24.76.198:5001
// nathan: http://10.24.79.110:5001
// jens: http://10.24.76.110:5001

// const socket = io("http://10.24.76.110:5000");

export default function App() {
  const [username, setUserName] = useState();
  // const [loggedIn, setLoggedIn] = useState(false);

  if (!username) {
    return <Login setUserName={setUserName} />
  }

  const getUserName = () => {
    return username;
  }

  return (
    <div className="container">
      <MessageBox getUserName={getUserName}/>
    </div>
  );
}