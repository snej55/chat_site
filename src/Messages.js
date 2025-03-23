import { useState } from 'react';
import './MessageBox.css'

export function MessageBox() {
    const [messageData, setMessageData] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageID, setMessageID] = useState(0);

    function getTime() {
        var currentDate = new Date();
        var dateTime = currentDate.getHours() + ':' + currentDate.getMinutes();
        return dateTime;
    }

    function addUserMessage() {
        setMessageID(messageID + 1);
        setMessages([
            ...messages,
            {'content': messageData, 'time': getTime(), 'user': 'test-bob', 'uid': messageID}
        ]);
    }

    return (
        <div className="container">
            <div className='message-box'>
                {messages.map(
                    i =><div key={i.uid}>
                            <span className={(i.user === 'test-bob') ? 'user' : 'other'}>{i.content}</span>
                        </div>
                )}
            </div>
            <div className='input-box'>
                <textarea onChange={e => setMessageData(e.target.value)} placeholder='Enter your message here...'></textarea>
                <button className="send-button" onClick={messageData ? addUserMessage : null}>Send</button>
            </div>
        </div>
    )
}