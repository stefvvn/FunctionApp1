import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import PersonForm from './components/PersonForm';
import PeopleList from './components/PersonDataList';
import { fetchPeople, addPerson, updatePerson } from './service/apiService';
import RetirementCalculator from './components/RetirementCalculator';
import './App.css';

// Home Component - This is where we fetch people
function Home({ handleEditPerson, selectedPerson, handleSavePerson }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchPeople = async () => {
    setLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (error) {
      console.error('Error fetching people:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPeople();
  }, []); // Fetch people only when Home component is rendered

  return (
    <>
      <PeopleList people={people} loading={loading} onEditPerson={handleEditPerson} />
      <PersonForm selectedPerson={selectedPerson} onSavePerson={handleSavePerson} />
    </>
  );
}

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
  };

  const handleSavePerson = (personData) => {
    if (selectedPerson) {
      updatePerson(selectedPerson.email, personData)
        .then(() => {
          alert('Person updated successfully!');
          setSelectedPerson(null);
        })
        .catch((error) => console.error('Error updating person:', error));
    } else {
      addPerson(personData)
        .then(() => {
          alert('Person added successfully!');
        })
        .catch((error) => console.error('Error adding person:', error));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem('darkMode', newMode);
      return newMode;
    });

    document.body.classList.toggle('dark-mode', !isDarkMode);
  };

  return (
    <Router>
      <div
        className={isDarkMode ? 'dark-mode' : ''}
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: '20px',
          flexWrap: 'wrap',
          padding: '20px',
        }}
      >
        {/* Dark Mode Switch */}
        <label className="switch">
          <input
            type="checkbox"
            checked={isDarkMode}
            onChange={toggleDarkMode}
          />
          <span className="slider round"></span>
        </label>

        <div style={{ flex: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Link to="/">Home</Link>
          <Link to="/retirement-calculator">Retirement Calculator</Link>
        </div>

        <Routes>
          <Route
            path="/"
            element={
              <Home
                handleEditPerson={handleEditPerson}
                selectedPerson={selectedPerson}
                handleSavePerson={handleSavePerson}
              />
            }
          />
          <Route path="/retirement-calculator" element={<RetirementCalculator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
