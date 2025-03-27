import React, { useState, useEffect } from 'react';
import './App.css';
import io from "socket.io-client";

import { MessageBox } from './Messages';
import { Login } from './Login/Login';

// ip addresses (old):

// jan (mint): http://10.24.76.198:5001
// nathan (new): http://10.24.78.182:5001
// jens: http://10.24.76.110:5001 or 10.24.79.53 at *a* port

// !! PLEASE USE localhost:PORT for testing to avoid issues with serverside code
const socket = io("http://localhost:5001");

export default function App() {
  const [username, setUserName] = useState();

  socket.on("server_reload", (_) => {
    setUserName('');
  })

  // if username is undefined,
  // banish them to the login page.
  if (!username) {
    return <Login setUserName={setUserName} socket={socket} />
  }

  const getUserName = () => {
    return username;
  }

  // return actual message box
  return (
    <div className="container">
      <MessageBox getUserName={getUserName} socket={socket} />
    </div>
  );
}