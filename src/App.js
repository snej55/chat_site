import './App.css';

import { MessageBox } from './Messages'

function Page() {
  return (
    <h1 className="Page">Chatbox</h1>
  )
}

export default function App() {
  return (
    <div className="container">
      <Page />
      <MessageBox />
    </div>
  );
}