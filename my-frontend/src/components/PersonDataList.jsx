import React, { useState, useEffect } from "react";
import "./PeopleList.css";
import { fetchPeople, deleteAllPeople, deletePerson, searchPeople, exportData } from "../service/apiService.js";

const PeopleList = ({ onEditPerson }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [exportFormat, setExportFormat] = useState("json");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10; 

  const handleFetchPeople = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchPeople();
      setPeople(data);
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePeople = async () => {
    setDeleting(true);
    setError(null);

    try {
      await deleteAllPeople();
      setPeople([]);
      setSearchResults([]);
      alert("People list deleted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeletePerson = async (email) => {
    setDeleting(true);
    setError(null);

    try {
      await deletePerson(email);
      setPeople((prevPeople) => prevPeople.filter((person) => person.email !== email));
      setSearchResults((prevResults) => prevResults.filter((person) => person.email !== email));
      alert("Person deleted successfully!");
    } catch (error) {
      setError(error.message);
    } finally {
      setDeleting(false);
    }
  };

  const handleSearchPeople = async () => {
    if (!searchQuery.trim()) {
      setSearchResults(people);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchPeople(searchQuery);
      setSearchResults(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    setError(null);

    try {
      const blob = await exportData(exportFormat);
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

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPeople = searchResults.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(searchResults.length / itemsPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(prevPage => prevPage + 1);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(prevPage => prevPage - 1);
  };

  useEffect(() => {
    handleFetchPeople();
  }, []);

  return (
    <div>
      <h2>People List</h2>

      <div className="controls">
        <div>
          <button className="action-button" onClick={handleFetchPeople} disabled={loading}>
            {loading ? "Loading..." : "Fetch People"}
          </button>
          <button className="action-button" onClick={handleDeletePeople} disabled={deleting || searchResults.length === 0}>
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
          <button className="action-button" onClick={handleSearchPeople} disabled={loading}>
            {loading ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {error && <p className="error">{error}</p>}

      {currentPeople.length > 0 && !loading ? (
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
            {currentPeople.map((person, index) => (
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
                    className="edit-button"
                    onClick={() => onEditPerson(person)}
                    disabled={loading}
                  >
                    Edit
                  </button>
                  <button
                    className="delete-button"
                    onClick={() => handleDeletePerson(person.email)}
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

      <div className="pagination">
        <button className="edit-button" onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        <span style={{ margin: '5px' }}>
          Page {currentPage} of {totalPages}
        </span>
        <button className="edit-button" onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <label htmlFor="exportFormat">Format: </label>
        <select
          id="exportFormat"
          value={exportFormat}
          onChange={(e) => setExportFormat(e.target.value)}
          className="select-dropdown"
        >
          <option value="json">JSON</option>
          <option value="csv">CSV</option>
        </select>
        <button className="action-button" onClick={handleExportData} disabled={loading}>
          {loading ? "Exporting..." : "Export"}
        </button>
      </div>
    </div>
  );
};

export default PeopleList;
