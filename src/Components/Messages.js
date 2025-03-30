import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getTime } from '../utils';
import './Messages.css';

export function MessageBox({getUserName, socket, encryptMessage, decryptMessage}) {
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
        socket.on("message", (mes) => {
            console.log(`Recieved encrypted message: ${mes.content}`)
            const message = {message: {content: decryptMessage(mes.content), time: mes.time, user: mes.user, uid: mes.uid}, id: mes.length}
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
        
        // !! DO NOT REMOVE THIS COMMENT
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [messages]);

    function generateMessage() {
        return {content: encryptMessage(messageData), time: getTime(), user: getUserName(), uid: messageID};
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
        // <body>
            <div className="chat-container">
                <div className="chat-header">{getUserName()} in ChatBox v0.2.0</div>

                <div className='message-box'>
                    <p className="watermark" id="wm1">
                        {/* Invisable watermark math stuff prevents moving out of the screen*/}
                        {getUserName().repeat(Math.floor(70 / getUserName().length))}
                    </p>
                    {messages.map(
                        i =><div key={i.id} class={(i.message.user === getUserName()) ? 'message user' : ((i.message.user.toLowerCase() === 'admin') ? 'message admin' : 'message other')}>
                                <div>
                                    <div className='bubble'>{i.message.content}</div>
                                    {(i.message.user !== getUserName()) ? <div className='message-info'>{i.message.user} at {i.message.time}</div> : <div className='message-info'></div>}
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
                    <div className="characters-left">{messageData.length}/500</div>
                </div>
            </div>
        // </body>
    )
}

// for getUserName() hook
MessageBox.propTypes = {
    getUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired,
    encryptMessage: PropTypes.func.isRequired,
    decryptMessage: PropTypes.func.isRequired
}