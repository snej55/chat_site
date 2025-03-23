import React, { useState } from 'react';
import PropTypes from 'prop-types';

export function Login({setUserName}) {
    const [name, setName] = useState();

    const handleSubmit = e => {
        e.preventDefault();
        setUserName(name);
    }

    return (
        <div className="login-wrapper">
            <h1>Please log in</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    <p>Username</p>
                    <input type="text" onChange={e => setName(e.target.value)}/>
                </label>
                <div>
                    <button type="submit">Submit</button>
                </div>
            </form>
        </div>
    )
}

Login.propTypes = {
    setUserName: PropTypes.func.isRequired
};