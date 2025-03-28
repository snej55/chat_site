import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Info.css'
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
            <div className="info-header">Currently connected users: </div>
            <div className="info-user-list">
                {userList.map(i => <div class="info-text-user">
                    <div>{getUserName() === i.username ? <b>{i.username}</b> : i.username}</div>
                </div>)}
            </div>
        </div>
    )
}

InfoPanel.propTypes = {
    getUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired
}