import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './Login.css';

const invalid_characters = ["$", "{", "}", " ", ".", "*", "%"];
const max_username_length = 30;
const min_username_length = 2;

export function Login({setUserName, socket}) {
    const [name, setName] = useState('');

    const handleSubmit = e => {
        e.preventDefault(); // this prevents the page from reloading
        if (checkUsername(name)) {
            socket.emit("check_user", name);
            // setUserName(name);
        }
    }

    useEffect(() => {
        // listen for checked_user response from server
        socket.on("checked_username", (response) => {
            if (response.valid) {
                setUserName(name);
            } else {
                alert(response.reason);
                return;
            }
        })

        // clean up
        return () => {
            socket.off("checked_username");
        }
    });

    // basic checks for if username is valid
    // important check are done on server side, not client side
    function checkUsername(username) {
        // check if username is too short or long
        if (username.length < min_username_length) {
            alert(`Sorry, your username must be less than ${max_username_length} characters long, and more than ${min_username_length}. Please try again!`);
            return false;
        } else if (username.length > max_username_length) {
            alert(`Sorry, your username must be less than ${max_username_length} characters long, and more than ${min_username_length}. Please try again!`)
            return false;
        }

        // check if username contains illegal characters
        for (var i = 0; i < invalid_characters.length; ++i) {
            if (username.includes(invalid_characters[i])) {
                alert("Sorry, your username cannot contain any of the following characters: $, {, }, ., *, % or any spaces");
                return false;
            }
        }

        if (username.toLowerCase() === "admin" || username.toLowerCase() === "admln" || username.toLowerCase() === "aomin" || username.toLowerCase() === "a0min") {
            alert("Sorry, this username has been taken!");
            return false;
        }

        return true;
    }

    return (
        // simple form for username input
        <div className="login-wrapper">
            
            <h1 id="h1">Welcome To CIMS</h1>
            
            {/* <h2>Please Enter Your Username</h2> */}
     
            <form onSubmit={handleSubmit}>
                
                <label>
                    {/* <p>Input Username</p> */}
                    <input id="input" type="text" onChange={e => setName(e.target.value)} placeholder='Username' />
                </label>
                
    
                <div>
                    <button id="button" type="submit" >Continue</button>
                </div>
            </form>
            <label>
                {/* Input admin token */}
                <input id="inputAdmin" type ="password"></input>
            </label>
            <p id = 'copyright'>Copyright © 2025 Jens Kromdijk, Nathan Yin, Jan Lukasiak</p>
            <a href="https://github.com/snej55/chat_site" id = 'github'>GitHub</a>
        </div>
    )
}

Login.propTypes = {
    setUserName: PropTypes.func.isRequired,
    socket: PropTypes.any.isRequired
};