import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

import { getTime } from '../utils';
import './Messages.css';

export function MessageBox({getUserName, socket, encryptMessage, decryptMessage}) {
    const [messageData, setMessageData] = useState('');
    const [messages, setMessages] = useState([]);
    const [messageID, setMessageID] = useState(0);
    const [firstConnection, setFirstConnection] = useState(false);
    const [replyMessage, setReplyMessage] = useState(null);

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
            let message = {message: {content: decryptMessage(mes.content), time: mes.time, user: mes.user, uid: mes.uid}, id: messages.length, reply: mes.reply ? mes.reply : null}
            if (message.reply) {
                message.reply.content = decryptMessage(message.reply.content);
            }
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
        var rep = replyMessage;
        if (rep) {
            rep.message.content = encryptMessage(rep.message.content);
            if (rep.reply) {
                rep.reply = null;
            }
        }
        clearReply()
        return {content: encryptMessage(messageData), time: getTime(), user: getUserName(), uid: messageID, reply: rep ? rep.message : null};
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

    function getMessageClass(i) {
        if (i.message.user.toLowerCase() === 'admin') {
            return 'message admin';
        } else {
            return (i.message.user === getUserName()) ? 'message user' : 'message other';
        }
    }

    function parseMessage(i) {
        if (i.message.user.toLowerCase() === 'admin') {
            return i.message.content.split(' ').map(
                word => (word.charAt(0) === '/' ? <b><i>{word}</i> </b> : (word.charAt(0) === '@' ? <b><i>{word}</i> </b> : word + ' '))
            );
        }
        return i.message.content;
    }

    function clearReply() {
        setReplyMessage(null);
    }

    return (
        <div className="chat-container">
            {getUserName() === "ADMIN" && <div className="chat-header-admin">{getUserName()} in ChatBox Release v1.0.0</div>}
            {getUserName() !== "ADMIN" && <div className="chat-header">{getUserName()} in ChatBox Release v1.0.0</div>}
            <div className='message-box'>
                <p className="watermark" id="wm1">
                    {/* Invisable watermark math stuff prevents moving out of the screen*/}
                    {getUserName().repeat(Math.floor(70 / getUserName().length))}
                </p>
                {messages.map(
                    i =><div key={i.id} class={getMessageClass(i)}>
                            <div>
                                <div className='bubble'>
                                    {i.reply && <div className={(i.message.user.toLowerCase() === 'admin') ? "message-reply-admin" : (i.message.user === getUserName() ? "message-reply-user" : "message-reply-other")}><b>{i.reply.user}</b>: {i.reply.content}</div>}
                                    <div>{parseMessage(i)}</div>
                                    {i.message.user === getUserName() ? null : <button class="button-extra" onClick={() => {setReplyMessage(JSON.parse(JSON.stringify(i)))}}>reply</button>}
                                </div>
                                {(i.message.user !== getUserName()) ? <div className='message-info'>{i.message.user} at {i.message.time}</div> : <div className='message-info'></div>}
                            </div>
                        </div>
                )}
                {/* dummy div to automatically scroll to bottom */}
                <div style={{ float:"left", clear: "both" }} id="messageEnd">
                </div>
            </div>

            {replyMessage && <div className="reply-preview-container">
                <button className="reply-remove-button" onClick={clearReply}>x</button>
                <div className="reply-preview-header">Replying to <b>@{replyMessage.message.user}</b> at {replyMessage.message.time}:</div>
                <div className="reply-preview">
                    {replyMessage.message.content}
                </div>
            </div>}
            
            <div className='input-box'>
                <textarea maxlength="500" className='message-text' onChange={e => setMessageData(e.target.value)} placeholder='Enter your message here...' onKeyDown={e => (e.key === 'Enter' ? addUserMessage() : null)}></textarea>
                <button className="send-button" onClick={addUserMessage}>Send</button>
                
            </div>
            
            <div className="info-panel">
                <div className="characters-left">{messageData.length}/500</div>
            </div>
        </div>
    )
}

// for getUserName() hook
MessageBox.propTypes = {
    getUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired,
    encryptMessage: PropTypes.func.isRequired,
    decryptMessage: PropTypes.func.isRequired
}