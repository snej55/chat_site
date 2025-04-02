import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Info.css'

let announcementData = ''; 

fetch('/announcement.txt') // read public/announcement.txt
    .then((res) => res.text())
    .then((data) => {
        announcementData = data; // store it 
        console.log('Announcement Loaded:', announcementData);
    })
    .catch((err) => console.error('Error fetching announcement:', err));

export {announcementData};

export function InfoPanel({ getUserName, socket }) {
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        socket.on("update_users", (userlist) => {
            setUserList(userlist);
        })

        // !! DO NOT REMOVE THIS COMMENT
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userList]);

    return (
        <div className="info-container">
            <div className="info-header"><b>Currently connected users: </b></div>
            <div className="info-user-list">
                {userList.map(i => <div class={getUserName() === i.username ? "info-text-user" : "info-text-other"}>
                    <div>{getUserName() === i.username ? <b>{i.username}</b> : i.username}</div>
                </div>)}
            </div>
            <div className='announcement-container'>
                <div className = "announcement-header"><b>Announcements</b></div>
                <div className='announcement-content'>{announcementData}</div>
            </div>
        </div>
    )
}

InfoPanel.propTypes = {
    getUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired
}