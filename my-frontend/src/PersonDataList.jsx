import React, { useState } from "react";
import "./PeopleList.css";
const PeopleList = () => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [exportFormat, setExportFormat] = useState("json");

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

  const deletePerson = async (email) => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:7285/api/person/${email}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete person");
      }

      setPeople((prevPeople) => prevPeople.filter((person) => person.email !== email));
      setSearchResults((prevResults) => prevResults.filter((person) => person.email !== email));

      alert("Person deleted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const deletePeople = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch("http://localhost:7285/api/person/clearall", {
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

  const exportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const url = exportFormat === "json" 
        ? "http://localhost:7285/api/person/exportJSON"
        : "http://localhost:7285/api/person/exportCSV";
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to export data");
      }

      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = exportFormat === "json" ? "peopleList.json" : "peopleList.csv";
      link.click();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>People List</h2>

      <div className="controls">
        <div>
          <button className="action-button" onClick={fetchPeople} disabled={loading}>
            {loading ? "Loading..." : "Fetch People"}
          </button>
          <button className="action-button" onClick={deletePeople} disabled={deleting || searchResults.length === 0}>
            {deleting ? "Deleting..." : "Delete List"}
          </button>
        </div>
        <div className="search-container">
          <input
            className="search-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="FirstName/LastName/Email"
          />
          <button className="action-button" onClick={searchPeople} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {searchResults.length > 0 && !loading ? (
        <table className="people-table">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Address</th>
              <th>Date of Birth</th>
              <th>Age</th>
              <th>Action</th>
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
                <td>
                  <button
                    className="delete-button"
                    onClick={() => deletePerson(person.email)}
                    disabled={deleting}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        searchResults.length === 0 && !loading && <p>No results to display</p>
      )}

<div style={{ marginTop: "20px" }}>
        <label htmlFor="exportFormat">Format: </label>
        <select
          id="exportFormat"
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="select-dropdown" // Add the class here
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <button 
         className="action-button"
         onClick={exportData} disabled={loading}>
          {loading ? "Exporting..." : "Export"}
        </button>
      </div>
    </div>
  );
};

export default PeopleList;
