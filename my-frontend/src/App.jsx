import React, { useState, useEffect } from 'react';
import PersonForm from './components/PersonForm';
import PeopleList from './components/PersonDataList';
import { fetchPeople, addPerson, updatePerson } from './service/apiService';

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);

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
  }, []);

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
  };

  const handleSavePerson = (personData) => {
    if (selectedPerson) {
      updatePerson(selectedPerson.email, personData)
        .then(() => {
          alert('Person updated successfully!');
          handleFetchPeople();
          setSelectedPerson(null);
        })
        .catch((error) => console.error('Error updating person:', error));
    } else {
      addPerson(personData)
        .then(() => {
          alert('Person added successfully!');
          handleFetchPeople();
        })
        .catch((error) => console.error('Error adding person:', error));
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', flexWrap: 'wrap', padding: '20px' }}>
      <PeopleList people={people} loading={loading} onEditPerson={handleEditPerson} />
      <PersonForm selectedPerson={selectedPerson} onSavePerson={handleSavePerson} />
    </div>
  );
}

export default App;
