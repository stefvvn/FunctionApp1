import React, { useState } from "react";

const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  const fetchPeople = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:7285/api/PersonGetList");
      if (!response.ok) {
        throw new Error("Failed to fetch data");
      }

      const data = await response.json();
      console.log(data);
      setPeople(data);
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const deletePeople = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:7285/api/clearall", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete data");
      }

      setPeople([]);
      setSearchResults([]);
      alert("People list deleted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const searchPeople = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(people);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:7285/api/person/search?query=${encodeURIComponent(searchQuery)}`);
      if (!response.ok) {
        throw new Error("Failed to search data");
      }

      const data = await response.json();
      console.log(data);
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
    <h2>People List</h2>

    <div style={{ display: "flex", marginBottom: "20px", gap: "10px" }}>
      <div>
        <button onClick={fetchPeople} disabled={loading}>
          {loading ? "Loading..." : "Fetch People"}
        </button>
        <button onClick={deletePeople} disabled={deleting || searchResults.length === 0}>
          {deleting ? "Deleting..." : "Delete People List"}
        </button>
      </div>
      <div style={{ marginLeft: "auto" }}>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="FirstName/LastName/Email"
          style={{ marginRight: "10px" }}
        />
        <button onClick={searchPeople} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </button>
      </div>
    </div>
      {error && <p>Error: {error}</p>}

      {searchResults.length > 0 && !loading ? (
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
            {searchResults.map((person, index) => (
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
        searchResults.length === 0 && !loading && <p>No results to display</p>
      )}
    </div>
  );
};

export default PeopleList;
