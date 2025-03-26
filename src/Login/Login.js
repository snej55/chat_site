import React, { useState } from 'react';
import PropTypes from 'prop-types';
import './Login.css';
export function Login({setUserName}) {
    const [name, setName] = useState();

    const handleSubmit = e => {
        e.preventDefault();
        setUserName(name);
    }

    return (
        <div className="login-wrapper">
            
            <h1>Welcome to CIMS</h1>
            <h2>Please Login</h2>
     
            <form onSubmit={handleSubmit}>
                
                <label>
                    {/* <p>Input Username</p> */}
                    <input type="text" onChange={e => setName(e.target.value)} placeholder='Username' />
                </label>
                <p></p>{/* Don't remove, everything breaks without this, IDK why but it does */}
                <label>
                    {/* <p>Input Passkey</p> */}
                    {/* <input type="password" onChange={e => setName(e.target.value)} placeholder='Password'/> */}
                </label>
                <div>
                    <button type="submit">Continue</button>
                </div>
            </form>
        </div>

    )
}

Login.propTypes = {
    setUserName: PropTypes.func.isRequired
};