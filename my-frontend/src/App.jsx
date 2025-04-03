import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import PersonForm from "./components/PersonForm";
import PeopleList from "./components/PersonDataList";
import { fetchPeople, addPerson, updatePerson } from "./service/apiService";
import RetirementCalculator from "./components/RetirementCalculator";
import WeatherApp from "./components/WeatherApp";
import ExpenseTracker from "./components/ExpenseTracker";
import ToDoApp from "./components/ToDoApp";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

function Home({ handleEditPerson, selectedPerson, handleSavePerson }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetchPeople = async () => {
    setLoading(true);
    try {
      const data = await fetchPeople();
      setPeople(data);
    } catch (error) {
      console.error("Error fetching people:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchPeople();
  }, []);

  return (
    <>
      <PeopleList
        people={people}
        loading={loading}
        onEditPerson={handleEditPerson}
      />
      <PersonForm
        selectedPerson={selectedPerson}
        onSavePerson={handleSavePerson}
      />
    </>
  );
}

function App() {
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode === "true";
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  }, [isDarkMode]);

  const handleEditPerson = (person) => {
    setSelectedPerson(person);
  };

  const handleSavePerson = (personData) => {
    if (selectedPerson) {
      updatePerson(selectedPerson.email, personData)
        .then(() => {
          alert("Person updated successfully!");
          setSelectedPerson(null);
        })
        .catch((error) => console.error("Error updating person:", error));
    } else {
      addPerson(personData)
        .then(() => {
          alert("Person added successfully!");
        })
        .catch((error) => console.error("Error adding person:", error));
    }
  };

  const toggleDarkMode = () => {
    setIsDarkMode((prevMode) => {
      const newMode = !prevMode;
      localStorage.setItem("darkMode", newMode);
      return newMode;
    });
  };

  return (
    <Router>
      <div
        className={isDarkMode ? "dark-mode" : ""}
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "20px",
          flexWrap: "wrap",
          padding: "20px"
        }}
      >
        <div style={{ flex: 1, display: "flex", justifyContent: "flex-start" }}>
          <label className="switch">
            <input
              type="checkbox"
              checked={isDarkMode}
              onChange={toggleDarkMode}
            />
            <span className="slider round"></span>
          </label>
          <div className="dropdown">
            <button
              className="menu-button dropdown-toggle"
              type="button"
              id="dropdownMenuButton"
              data-bs-toggle="dropdown"
              aria-expanded="false"
            >
              Apps
            </button>
            <ul className="dropdown-menu" aria-labelledby="dropdownMenuButton">
              <li>
                <Link className="dropdown-item" to="/">
                  CRUD Azure Functions
                </Link>
              </li>
              <div className="dropdown-divider"></div>
              <li>
                <Link className="dropdown-item" to="/retirement-calculator">
                  Retirement Calculator
                </Link>
              </li>
              <div className="dropdown-divider"></div>
              <li>
                <Link className="dropdown-item" to="/weather">
                  Weather Cards
                </Link>
              </li>
              <div className="dropdown-divider"></div>
              <li>
                <Link className="dropdown-item" to="/expense-tracker">
                  Expense Tracker Graph
                </Link>
              </li>
              <div className="dropdown-divider"></div>
              <li>
                <Link className="dropdown-item" to="/todo">
                  ToDo List
                </Link>
              </li>
            </ul>
          </div>
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
          <Route
            path="/retirement-calculator"
            element={<RetirementCalculator />}
          />
          <Route path="/weather" element={<WeatherApp />} />
          <Route path="/expense-tracker" element={<ExpenseTracker />} />
          <Route path="/todo" element={<ToDoApp />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
