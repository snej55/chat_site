import React, { useState } from 'react';
import './App.css';
import io from "socket.io-client";

import { MessageBox } from './Components/Messages';
import { Login } from './Components/Login';

// ip addresses (old):

// jan (mint): http://10.24.76.198:5001
// nathan (new): http://10.24.78.182:5001
// jens: http://10.24.79.53:5001 at *a* port

// !! PLEASE USE localhost:PORT for testing to avoid issues with serverside code
const socket = io("http://localhost:5001");

export default function App() {
  const [username, setUserName] = useState();

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