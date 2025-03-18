import { useState } from 'react';

export function MessageBox() {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([{}])

    return (
        <div>
        <h1>Messages:</h1>
        <input className="inputBox" onChange={e => {
            setMessage(e.target.value);
        }}>Enter your message</input>
        
        <button className="messageButton" onClick={
            setMessages([
                ...messages,
                {'name': message}
            ])
        }></button>
        </div>
    )
}