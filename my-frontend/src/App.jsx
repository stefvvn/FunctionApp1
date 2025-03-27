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
    display: "flex",
    justifyContent: "space-between",
    gap: "20px",
    flexWrap: "wrap",
    padding: "20px",
  },
};

export default App;
