import { useState } from 'react';
import './MessageBox.css'

export function MessageBox() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([])
    const [messageID, setMessageID] = useState(0);

    // message = {'content', 'id', 'username'}
    function addMessage() {
        setMessages([
            {'content': message, 'id': messageID},
            ...messages
        ]);
        setMessageID(messageID + 1);
    }

    return (
        <div className="messageBox">
        <h1>Messages:</h1>
        <input value={message} className="messageInput" onChange={e => setMessage(e.target.value)}/>
        <style>
            {/* {1 ? (
                
            ) : (<div></div>)} */}
        </style>
        <button className="messageButton" onClick={addMessage}>Enter</button>
        <ol>
            {messages.map(message => (
                <div className="messageItem" key={message.id}>Content: '{message.content}' (ID: {message.id})</div>
            ))}
        </ol>
        </div>
    );
}