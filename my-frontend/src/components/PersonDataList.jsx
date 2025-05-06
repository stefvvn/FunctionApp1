import React, { useState, useEffect } from "react";
import "./PeopleList.css";
import {
  fetchPeople,
  deletePerson,
  insertPerson,
  updatePerson,
} from "../service/apiService.js";

const PersonDataList = ({ onEditPerson }) => {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingPerson, setEditingPerson] = useState(null);
  const [form, setForm] = useState({ Name: "", Email: "", Password: "" });

  // Fetch all people
  const handleFetchPeople = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Insert or update person
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingPerson) {
        await updatePerson(editingPerson.Id, form);
      } else {
        await insertPerson(form);
      }
      setForm({ Name: "", Email: "", Password: "" });
      setEditingPerson(null);
      handleFetchPeople();
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete person by email
  const handleDeletePerson = async (email) => {
    setLoading(true);
    setError(null);
    try {
      await deletePerson(email);
      setPeople((prev) => prev.filter((p) => p.Email !== email));
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Edit person
  const handleEditPerson = (person) => {
    setEditingPerson(person);
    setForm({ Name: person.Name, Email: person.Email, Password: "" });
  };

  // Search
  const filteredPeople = people.filter(
    (p) =>
      p.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.Email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    handleFetchPeople();
  }, []);

  return (
    <div>
      <h2>Person Data List</h2>
      <form onSubmit={handleSubmit} className="person-form">
        <input
          type="text"
          placeholder="Name"
          value={form.Name}
          onChange={(e) => setForm({ ...form, Name: e.target.value })}
          required
        />
        <input
          type="email"
          placeholder="Email"
          value={form.Email}
          onChange={(e) => setForm({ ...form, Email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.Password}
          onChange={(e) => setForm({ ...form, Password: e.target.value })}
          required={!editingPerson}
        />
        <button type="submit" className="action-button" disabled={loading}>
          {editingPerson ? "Update" : "Add"}
        </button>
        {editingPerson && (
          <button
            type="button"
            className="action-button"
            onClick={() => {
              setEditingPerson(null);
              setForm({ Name: "", Email: "", Password: "" });
            }}
          >
            Cancel
          </button>
        )}
      </form>

      <div className="search-container">
        <input
          className="search-input"
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Name or Email"
        />
      </div>

      {error && <p className="error">{error}</p>}

      <table className="people-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredPeople.map((person) => (
            <tr key={person.Id}>
              <td>{person.Name}</td>
              <td>{person.Email}</td>
              <td>
                <button
                  className="edit-button"
                  onClick={() => handleEditPerson(person)}
                  disabled={loading}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={() => handleDeletePerson(person.Email)}
                  disabled={loading}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {filteredPeople.length === 0 && !loading && <p>No results to display</p>}
    </div>
  );
};

export default PersonDataList;