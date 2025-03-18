import { useState } from 'react';

export function MessageBox() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([{}])
    const [messageID, setMessageID] = useState(0);

    function addMessage(e) {
        setMessages([
            ...messages,
            {'content': message, 'id': messageID}
        ]);
        setMessageID(messageID + 1);
    }

    return (
        <div>
        <h1>Messages:</h1>
        <input value={message} onChange={e => setMessage(e.target.value)} />
        <button className="messageButton" onClick={addMessage}>Add {message}</button>
        <ul>
            {messages.map(message => (
                <li key={message}>{message.content} ID: {message.id}</li>
            ))}
        </ul>
        </div>
    )
}