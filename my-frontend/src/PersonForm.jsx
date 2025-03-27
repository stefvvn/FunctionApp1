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
        const personData = [
            {
                FirstName: firstName,
                LastName: lastName,
                Email: email,
                PhoneNumber: phoneNumber,
                Address: address,
                BirthDate: birthDate,
            },
        ];

        try {
            const response = await fetch('http://localhost:7285/api/PersonInsert', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(personData),
            });

            if (!response.ok) {
                throw new Error('Failed to add person');
            }

            const data = await response.text();
            setStatus('Person added successfully!');
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div>
            <h2>Insert Person Data</h2>
            <form onSubmit={handleSubmit}>
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
                    <label>Email:</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
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
            </form>
            <p>{status}</p>
        </div>
    );
};

export default PersonForm;
