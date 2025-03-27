import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

export default function InfoPanel({ getUserName, socket }) {
    const [userList, setUserList] = useState([]);

    useEffect(() => {
        socket.on("update_users", (userlist) => {
            setUserList(userlist);
        })
    }, [userList]);

    return (
        <div className="info-container">
            <div className="info-header">Currently connected users: </div>
            <div className="info-user-list">
                {userList.map(i => <div class="info-text-user">
                    <span>{getUserName() === i.username ? <b>{i.username}</b> : i.username}</span>
                </div>)}
            </div>
        </div>
    )
}

InfoPanel.propTypes = {
    getUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired
}