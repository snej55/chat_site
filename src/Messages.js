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
        if (messageData) {
            setMessageID(messageID + 1);
            setMessages([
                ...messages,
                {'content': messageData, 'time': getTime(), 'user': 'test-bob', 'uid': messageID}
            ]);
            document.getElementsByClassName('message-text')[0].value = '';
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-header">ChatBox v0.1.0</div>
            <div className='message-box'>
                {messages.map(
                    i =><div key={i.uid} class={(i.user === 'test-bob') ? 'message user' : 'message other'}>
                            <span className='bubble'>{i.content}</span>
                        </div>
                )}
            </div>
            <div className='input-box'>
                <textarea className='message-text' onChange={e => setMessageData(e.target.value)} placeholder='Enter your message here...' onKeyDown={e => (e.key === 'Enter' ? addUserMessage() : null)}></textarea>
                <button className="send-button" onClick={addUserMessage}>Send</button>
            </div>
        </div>
    )
}