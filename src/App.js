import './App.css';

import { MessageBox } from './Messages'
import socketClient from 'socket.io-client';

const SERVER = "http://127.0.0.1:8080";
export default function App() {
  var socket = socketClient(SERVER);
  socket.on('connection', () => {
    console.log(`I'm connected!`);
  })

  return (
    <div className="container">
      <MessageBox />
    </div>
  );
}