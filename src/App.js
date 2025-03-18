import './App.css';
import { useState } from 'react';

import { MessageBox } from './Messages'

function Page() {
  return (
    <h1 className="Page">Chatbox</h1>
  )
}

export default function App() {
  return (
    <div className="App">
      <Page />
      <MessageBox />
    </div>
  );
}