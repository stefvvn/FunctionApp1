import React, { useState, useEffect } from 'react';
import './PersonForm.css';
import { searchPerson, updatePerson, addPerson, deletePerson } from '../service/apiService.js';

const PersonForm = ({ selectedPerson, onSavePerson }) => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [address, setAddress] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [status, setStatus] = useState('');

    // If a person is selected for editing, populate the form with their data
    useEffect(() => {
        if (selectedPerson) {
            setFirstName(selectedPerson.firstName);
            setLastName(selectedPerson.lastName);
            setEmail(selectedPerson.email);
            setPhoneNumber(selectedPerson.phoneNumber);
            setAddress(selectedPerson.address);
            
            // Make sure the birthDate is in the correct format for <input type="date" />
            const formattedBirthDate = selectedPerson.birthDate 
                ? new Date(selectedPerson.birthDate).toISOString().split('T')[0] // Converts to 'yyyy-mm-dd' format
                : '';
            setBirthDate(formattedBirthDate);
        }
    }, [selectedPerson]);

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
            if (selectedPerson) {
                // If editing, update the person
                await updatePerson(personData);
                setStatus('Person updated successfully!');
            } else {
                // If not editing, add a new person
                await addPerson(personData);
                setStatus('Person added successfully!');
            }

            onSavePerson(); // Callback to inform parent (App) that data has been saved
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    const handleDelete = async () => {
        try {
            await deletePerson(email);
            setStatus('Person deleted successfully!');
            setEmail('');
            setFirstName('');
            setLastName('');
            setPhoneNumber('');
            setAddress('');
            setBirthDate('');
        } catch (error) {
            setStatus('Error: ' + error.message);
        }
    };

    return (
        <div className="form-container">
            <h2>{selectedPerson ? 'Edit Person' : 'Create/Update/Delete Person'}</h2>
            <form onSubmit={handleSubmit}>
                <div className="form-field">
                    <label>Email:</label>
                    <input
                        className="form-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={selectedPerson !== null} // Disable email input while editing
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
                        {selectedPerson ? 'Update' : 'Submit'}
                    </button>
                    {selectedPerson && (
                        <button
                            className="action-button delete-button"
                            type="button"
                            onClick={handleDelete}
                        >
                            Delete
                        </button>
                    )}
                </div>
            </form>
            {status && <p className="status-message">{status}</p>}
        </div>
    );
};

export default PersonForm;
