import { useState, useEffect } from 'react';
import io from "socket.io-client";
import PropTypes from 'prop-types';

import { getTime } from './utils';
import './MessageBox.css';

// addresses:

// jan (mint): http://10.24.76.198:5001
// nathan (new): http://10.24.78.182:5001
// jens: http://10.24.76.110:5001 or 10.24.79.53 at *a* port

// !! PLEASE USE localhost:PORT for testing to avoid issues with serverside code
const socket = io("http://localhost:5000");

export function MessageBox({getUserName}) {
    const [messageData, setMessageData] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageID, setMessageID] = useState(0);
    const [firstConnection, setFirstConnection] = useState(false);

    // check if this is the first time we connected
    if (!firstConnection) {
        setFirstConnection(true);
        socket.emit("new_user", getUserName());
    }
  
    const scrollToBottom = () => {
        document.getElementById("messageEnd").scrollIntoView({ behavior: "smooth" });
    }

    useEffect(() => {
        // listen for incoming messages
        socket.on("message", (message) => {
            setMessages([
                ...messages,
                message
            ]);
            scrollToBottom();
        });

        // clean up
        return () => {
            socket.off("message");
        };
    }, [messages]);

    function generateMessage() {
        return {content: messageData, time: getTime(), user: getUserName(), uid: messageID};
    }

    function addUserMessage() {
        if (messageData.trim() !== "") {
            setMessageID(messageID + 1);
            const message = generateMessage();

            // send message to server
            socket.emit("message", message);

            // clear textarea
            document.getElementsByClassName('message-text')[0].value = '';
            setMessageData('');

            scrollToBottom();
        }
    }

    return (
        <div className="chat-container">
            <div className="chat-header">{getUserName()} in ChatBox v0.1.1</div>
            <div className='message-box'>
                {messages.map(
                    i =><div key={i.uid} class={(i.user === getUserName()) ? 'message user' : 'message other'}>
                            <div>
                                <div className='bubble'>{i.content}</div>
                                {(i.user !== getUserName()) ? <div className='message-info'>{i.user} at {i.time}</div> : <div className='message-info'></div>}
                            </div>
                        </div>
                )}
                {/* dummy div to automatically scroll to bottom */}
                <div style={{ float:"left", clear: "both" }} id="messageEnd">
                </div>
            </div>
            <div className='input-box'>
                <textarea maxlength="500" className='message-text' onChange={e => setMessageData(e.target.value)} placeholder='Enter your message here...' onKeyDown={e => (e.key === 'Enter' ? addUserMessage() : null)}></textarea>
                <button className="send-button" onClick={addUserMessage}>Send</button>
            </div>
            <div className="info-panel">
                <span className="characters-left">{messageData.length}/500</span>
            </div>
        </div>
    )
}

// for getUserName() hook
MessageBox.propTypes = {
    getUserName: PropTypes.func.isRequired
}