import React, { useState } from "react";

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPeople = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:7285/api/PersonGetList"); // Replace with your actual Azure Function URL
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      console.log(data); // Log to check the structure of the response
      setPeople(data); // Assuming data is an array of people
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>People List</h2>
      <button onClick={fetchPeople} disabled={loading}>
        {loading ? "Loading..." : "Fetch People"}
      </button>

      {error && <p>Error: {error}</p>}

      {people.length > 0 && !loading ? (
        <table border="1" style={{ width: "100%", marginTop: "20px", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Date of Birth</th>
              <th>Age</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person, index) => (
              <tr key={index}>
                <td>{person.firstName}</td>
                <td>{person.lastName}</td>
                <td>{person.email}</td>
                <td>{person.phoneNumber}</td>
                <td>{person.address}</td>
                <td>{new Date(person.birthDate).toLocaleDateString()}</td>
                <td>{person.age}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        people.length === 0 && !loading && <p>No people to display</p>
      )}
    </div>
  );
};



export default PeopleList;
