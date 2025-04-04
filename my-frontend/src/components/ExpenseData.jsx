import React, { useState } from "react";
import "./ExpenseData.css";

const ExpenseData = ({ onSubmit }) => {
  const [fields, setFields] = useState([{ label: "", value: "" }]);
  const [income, setIncome] = useState("");

  const handleChange = (index, e) => {
    const { name, value } = e.target;
    const newFields = [...fields];
    newFields[index][name] = value;
    setFields(newFields);
  };

  const handleIncomeChange = (e) => {
    setIncome(e.target.value);
  };

  const handleAddField = () => {
    setFields([...fields, { label: "", value: "" }]);
  };

  const handleRemoveField = (index) => {
    const newFields = fields.filter((_, i) => i !== index);
    setFields(newFields);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const expensesTotal = fields.reduce((sum, field) => sum + (parseFloat(field.value) || 0), 0);
    const leftover = parseFloat(income || 0) - expensesTotal;
    onSubmit(fields, income, leftover);
  };

  return (
    <form onSubmit={handleSubmit} className="expense-form">
      <h2>Enter Your Expenses</h2>
      
      {fields.map((field, index) => (
        <div key={index} className="form-field">
          <input
            type="text"
            name="label"
            value={field.label}
            onChange={(e) => handleChange(index, e)}
            placeholder="Category Label"
            className="form-input"
          />
          <input
            type="number"
            name="value"
            value={field.value}
            onChange={(e) => handleChange(index, e)}
            placeholder="Amount"
            className="form-input"
          />
          <button
            type="button"
            className="remove-field"
            onClick={() => handleRemoveField(index)}
          >
            Remove
          </button>
        </div>
      ))}
      
      <div className="form-field">
        <input
          type="number"
          name="income"
          value={income}
          onChange={handleIncomeChange}
          placeholder="Income"
          className="form-input"
        />
      </div>

      <div className="form-actions">
        <button type="button" className="add-field" onClick={handleAddField}>
          Add Another Category
        </button>
        <button type="submit" className="form-submit">
          Submit
        </button>
      </div>
    </form>
  );
};

export default ExpenseData;
