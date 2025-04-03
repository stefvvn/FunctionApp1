import React, { useState } from "react";
import "./ExpenseData.css";

const ExpenseData = ({ onSubmit }) => {
  const [expense, setExpense] = useState({
    bill: "",
    rent: "",
    food: "",
    fuel: "",
    other: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setExpense((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(expense);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Enter Your Expenses</h2>
      <div className="form-field">
        <input
          type="number"
          name="bill"
          value={expense.bill}
          onChange={handleChange}
          placeholder="Bills"
          className="form-input"
        />
      </div>
      <div className="form-field">
        <input
          type="number"
          name="rent"
          value={expense.rent}
          onChange={handleChange}
          placeholder="Rent"
          className="form-input"
        />
      </div>
      <div className="form-field">
        <input
          type="number"
          name="food"
          value={expense.food}
          onChange={handleChange}
          placeholder="Food"
          className="form-input"
        />
      </div>
      <div className="form-field">
        <input
          type="number"
          name="fuel"
          value={expense.fuel}
          onChange={handleChange}
          placeholder="Fuel"
          className="form-input"
        />
      </div>
      <div className="form-field">
        <input
          type="number"
          name="other"
          value={expense.other}
          onChange={handleChange}
          placeholder="Other"
          className="form-input"
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="form-submit">
          Submit
        </button>
      </div>
    </form>
  );
};

export default ExpenseData;
