import React, { useState } from "react";
import "./RetirementCalculator.css";
import { serbianPublicHolidays } from "../service/holidays.js";

const formatDate = (date) => {
  return `${date.getDate().toString().padStart(2, "0")}-${(date.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
};

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isSerbianHoliday = (date) => {
  const formattedDate = formatDate(date);
  return serbianPublicHolidays.some(
    (holiday) => holiday.date === formattedDate
  );
};

const calculateBusinessDays = (startDate, endDate) => {
  let totalBusinessDays = 0;

  for (
    let currentDate = new Date(startDate);
    currentDate <= endDate;
    currentDate.setDate(currentDate.getDate() + 1)
  ) {
    if (!isWeekend(currentDate) && !isSerbianHoliday(currentDate)) {
      totalBusinessDays++;
    }
  }

  return totalBusinessDays;
};

const calculateVacationDays = (yearsUntilRetirement, vacationDaysPerYear = 20) => {
  return yearsUntilRetirement * vacationDaysPerYear;
};

const InputField = ({ label, type, value, onChange, ...props }) => (
  <div className="form-field">
    <label>{label}:</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="form-input"
      {...props}
    />
  </div>
);

const RetirementResults = ({ daysUntilRetirement }) => (
  <div className="status-message">
    <p>
      Business Days Until Retirement: {daysUntilRetirement.adjustedBusinessDays}
      <br />
      <span>
        This number already takes into account: <br />
        Weekends
        <br />
        Serbian public holidays
        <br />
        20 business days of PTO per year
      </span>
    </p>
    <p>
      You're eligible for retirement on{" "}
      <strong>{daysUntilRetirement.retirementDateFormatted}</strong>, which is{" "}
      <strong>{daysUntilRetirement.totalDaysUntilRetirement}</strong> days from
      now.
    </p>
  </div>
);

const RetirementCalculator = () => {
  const [birthdate, setBirthdate] = useState("");
  const [retirementAge, setRetirementAge] = useState(65);
  const [daysUntilRetirement, setDaysUntilRetirement] = useState(null);

  const calculateDaysUntilRetirement = () => {
    if (!birthdate) {
      alert("Please enter your birthdate!");
      return;
    }

    const birthDateObj = new Date(birthdate);
    const today = new Date();

    if (birthDateObj > today) {
      alert("Birthdate cannot be in the future!");
      return;
    }

    if (retirementAge < 18 || retirementAge > 100) {
      alert("Retirement age must be between 18 and 100!");
      return;
    }

    const retirementDate = new Date(
      birthDateObj.setFullYear(birthDateObj.getFullYear() + retirementAge)
    );

    if (retirementDate < today) {
      alert("You are already past your retirement age!");
      return;
    }

    const businessDaysUntilRetirement = calculateBusinessDays(today, retirementDate);
    const totalDaysUntilRetirement = Math.floor(
      (retirementDate - today) / (1000 * 60 * 60 * 24)
    );

    const yearsUntilRetirement = retirementDate.getFullYear() - today.getFullYear();
    const vacationDays = calculateVacationDays(yearsUntilRetirement);

    setDaysUntilRetirement({
      adjustedBusinessDays: businessDaysUntilRetirement - vacationDays,
      totalDaysUntilRetirement,
      retirementDateFormatted: retirementDate.toLocaleDateString(),
    });
  };

  return (
    <div className="form-container">
      <h2>Retirement Calculator</h2>
      <InputField
        label="Birthdate"
        type="date"
        value={birthdate}
        onChange={(e) => setBirthdate(e.target.value)}
      />
      <InputField
        label="Retirement Age"
        type="number"
        value={retirementAge}
        onChange={(e) => setRetirementAge(Number(e.target.value))}
        min="18"
      />
      <div className="form-actions">
        <button
          onClick={calculateDaysUntilRetirement}
          className="calculate-button"
        >
          Calculate
        </button>
      </div>

      {daysUntilRetirement !== null && (
        <RetirementResults daysUntilRetirement={daysUntilRetirement} />
      )}
    </div>
  );
};

export default RetirementCalculator;
