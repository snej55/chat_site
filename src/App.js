import React, { useState } from 'react';
import './App.css';

import { MessageBox } from './Messages';
import { Login } from './Login/Login';

export default function App() {
  const [username, setUserName] = useState();

  // if username is undefined,
  // banish them to the login page.
  if (!username) {
    return <Login setUserName={setUserName} />
  }

  const getUserName = () => {
    return username;
  }

  // return actual message box
  return (
    <div className="container">
      <MessageBox getUserName={getUserName}/>
    </div>
  );
}