import React, {useState} from 'react';
import PersonForm from './PersonForm';
import PeopleList from './PersonDataList';

function App() {
  return (
    <div style={styles.container}>
      <PeopleList />
      <PersonForm />
    </div>
  );
}

const styles = {
  container: {
    display: "flex",          // Enables flexbox
    justifyContent: "space-between", // Optional: Add space between items (you can use "space-evenly", "space-around", etc.)
    gap: "20px",              // Optional: Adds space between the components
    flexWrap: "wrap",         // Optional: Allow components to wrap onto a new row on smaller screens
    padding: "20px",
  },
};

export default App;
