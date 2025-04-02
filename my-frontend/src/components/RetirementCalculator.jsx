import React, { useState } from "react";
import "./RetirementCalculator.css";
import { serbianPublicHolidays } from "../service/holidays.js";

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isSerbianHoliday = (date) => {
  const formattedDate = `${date.getDate().toString().padStart(2, "0")}-${(
    date.getMonth() + 1
  )
    .toString()
    .padStart(2, "0")}`;
  return serbianPublicHolidays.some(
    (holiday) => holiday.date === formattedDate
  );
};

const calculateBusinessDays = (startDate, endDate) => {
  let totalBusinessDays = 0;
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    if (!isWeekend(currentDate) && !isSerbianHoliday(currentDate)) {
      totalBusinessDays++;
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return totalBusinessDays;
};

const calculateVacationDays = (yearsUntilRetirement) => {
  return yearsUntilRetirement * 20;
};

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
    const retirementDate = new Date(
      birthDateObj.setFullYear(birthDateObj.getFullYear() + retirementAge)
    );

    const today = new Date();

    if (retirementDate < today) {
      alert("You are already past your retirement age!");
      return;
    }

    const businessDaysUntilRetirement = calculateBusinessDays(
      today,
      retirementDate
    );

    const totalDaysUntilRetirement = Math.floor(
      (retirementDate - today) / (1000 * 60 * 60 * 24)
    );

    const yearsUntilRetirement =
      retirementDate.getFullYear() - today.getFullYear();
    const vacationDays = calculateVacationDays(yearsUntilRetirement);

    const adjustedBusinessDays = businessDaysUntilRetirement - vacationDays;

    const retirementDateFormatted = retirementDate.toLocaleDateString();

    setDaysUntilRetirement({
      adjustedBusinessDays,
      totalDaysUntilRetirement,
      retirementDateFormatted,
    });
  };

  return (
    <div className="form-container">
      <h2>Retirement Calculator</h2>
      <div className="form-field">
        <label>Birthdate:</label>
        <input
          type="date"
          value={birthdate}
          onChange={(e) => setBirthdate(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-field">
        <label>Retirement Age:</label>
        <input
          type="number"
          value={retirementAge}
          onChange={(e) => setRetirementAge(Number(e.target.value))}
          className="form-input"
          min="18"
        />
      </div>
      <div className="form-actions">
        <button
          onClick={calculateDaysUntilRetirement}
          className="calculate-button"
        >
          Calculate
        </button>
      </div>

      {daysUntilRetirement !== null && (
        <div className="status-message">
          <p>
            Business Days Until Retirement:{" "}
            {daysUntilRetirement.adjustedBusinessDays}
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
            <strong>{daysUntilRetirement.retirementDateFormatted}</strong>,
            which is{" "}
            <strong>{daysUntilRetirement.totalDaysUntilRetirement}</strong> days
            from now.
          </p>
        </div>
      )}
    </div>
  );
};

export default RetirementCalculator;
