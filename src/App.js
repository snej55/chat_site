import './App.css';
import { useState } from 'react';

function Page() {
  return (
    <h1 className="Page">Chatbox</h1>
  )
}

function DannyGo() {
  const [count, setCount] = useState(0);

  function handleClick() {
    setCount(count + 1);
  }

  return (
    <button className="DannyGo" onClick={handleClick}>Clicked {count} times</button>
  )
}

export default function App() {
  return (
    <div className="App">
      <Page />
      <DannyGo />
    </div>
  );
}