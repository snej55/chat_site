import { useState, useEffect } from 'react';
import './MessageBox.css';
import io from "socket.io-client";

import PropTypes from 'prop-types';

// const socket = io("http://10.24.79.110:5001");
const socket = io("http://10.24.79.194:5001");

export function MessageBox({getUserName}) {
    const [messageData, setMessageData] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageID, setMessageID] = useState(0);

    useEffect(() => {
        // list for incoming messages
        socket.on("message", (message) => {
            setMessages([
                ...messages,
                message
            ]);
        });

        return () => {
            socket.off("message");
        };
    }, [messages]);

    function getTime() {
        var currentDate = new Date();
        var dateTime = currentDate.getHours() + ':' + (currentDate.getMinutes() < 10 ? '0' : '') + currentDate.getMinutes() + ':' + (currentDate.getSeconds() < 10 ? '0' : '') + currentDate.getSeconds();
        return dateTime;
    }

    function addUserMessage() {
        if (messageData.trim() !== "") {
            setMessageID(messageID + 1);
            const message = {content: messageData, time: getTime(), user: getUserName(), uid: messageID};
            socket.emit("message", message);
            document.getElementsByClassName('message-text')[0].value = '';
            setMessageData('');
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-header">{getUserName()} in ChatBox v0.1.1</div>
            <div className='message-box'>
                {messages.map(
                    i =><div key={i.uid} class={(i.user === getUserName()) ? 'message user' : 'message other'}>
                            <div>
                                <span className='bubble'>{i.content}</span>
                                {(i.user !== getUserName()) ? <div className='message-info'>{i.user} at {i.time}</div> : <div className='message-info'></div>}
                            </div>
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

MessageBox.propTypes = {
    getUserName: PropTypes.func.isRequired
}