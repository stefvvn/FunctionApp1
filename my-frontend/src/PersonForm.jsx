import React, { useState } from 'react';

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
            } else {
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
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Create Person/Update By Email</h2>
            <form onSubmit={handleSubmit}>
            <div>
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>
                <div>
                    <label>First Name:</label>
                    <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Last Name:</label>
                    <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </div>
                <div>
                    <label>Phone Number:</label>
                    <input
                        type="text"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                    />
                </div>
                <div>
                    <label>Birth Date:</label>
                    <input
                        type="date"
                        value={birthDate}
                        onChange={(e) => setBirthDate(e.target.value)}
                    />
                </div>
                <button type="submit">Submit</button>
                <button type="button" onClick={handleDelete}>Delete</button>
            </form>
            <p>{status}</p>
        </div>
    );
};

export default PersonForm;
