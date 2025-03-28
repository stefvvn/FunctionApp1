import React, { useState } from 'react';
import './PersonForm.css';

const PersonForm = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [status, setStatus] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const personData = {
            FirstName: firstName,
            LastName: lastName,
            Email: email,
            PhoneNumber: phoneNumber,
            Address: address,
            BirthDate: birthDate,
        };
    
        try {
            const getResponse = await fetch(`http://localhost:7285/api/person/search?query=${email}`);
            
            if (getResponse.ok) {
                const patchResponse = await fetch('http://localhost:7285/api/person', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(personData),
                });
    
                if (!patchResponse.ok) {
                    throw new Error('Failed to update person');
                }
    
                setStatus('Person updated successfully!');
            } else if (getResponse.status === 404) {
                const putResponse = await fetch('http://localhost:7285/api/PersonInsert', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify([personData]),
                });
    
                if (!putResponse.ok) {
                    throw new Error('Failed to add person');
                }
    
                setStatus('Person added successfully!');
            } else {
                throw new Error('Unexpected error during search');
            }
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };
    

    const handleDelete = async () => {
        try {
            const deleteResponse = await fetch(`http://localhost:7285/api/person/${email}`, {
                method: 'DELETE',
            });

            if (!deleteResponse.ok) {
                throw new Error('Failed to delete person');
            }

            setStatus('Person deleted successfully!');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setAddress('');
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>Create/Update/Delete Person</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label>Email:</label>
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>First Name:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Last Name:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Phone Number:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Address:</label>
                    <input
                        className="form-input"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div className="form-field">
                    <label>Birth Date:</label>
                    <input
                        className="form-input"
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />
                </div>
                <div className="form-actions">
                    <button className="action-button" type="submit">
                        Submit
                    </button>
                    <button
                        className="action-button delete-button"
                        type="button"
                        onClick={handleDelete}
                    >
                        Delete
                    </button>
                </div>
            </form>
            {status && <p className="status-message">{status}</p>}
        </div>
    );
};

export default PersonForm;
