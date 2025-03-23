import { useState } from 'react';
import './MessageBox.css'

export function MessageBox() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([])
    const [messageID, setMessageID] = useState(0);

    // message = {'content', 'id', 'username'}
    function addMessage() {
        setMessages([
            ...messages,
            {'content': message, 'id': messageID}
        ]);
        setMessageID(messageID + 1);
    }

    return (
        <div className="messageBox">
        <h1>Messages:</h1>
        <ol>
            {messages.map(message => (
                <div className="messageItem" key={message.id}>Content: '{message.content}' (ID: {message.id})</div>
            ))}
        </ol>
        <input value={message} className="messageInput" onChange={e => setMessage(e.target.value)}/>
        <button className="messageButton"  onClick={message ? addMessage : null}>Enter</button>
        </div>
    );
}