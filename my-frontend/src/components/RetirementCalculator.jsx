import React, { useState } from 'react';
import './RetirementCalculator.css';

const serbianPublicHolidays = [
  { date: '01-01', name: 'New Year\'s Day' },
  { date: '02-01', name: 'New Year\'s Day' },
  { date: '15-02', name: 'Statehood Day' },
  { date: '16-02', name: 'Statehood Day' },
  { date: '14-04', name: 'Orthodox Good Friday' },
  { date: '16-04', name: 'Orthodox Easter Sunday' },
  { date: '17-04', name: 'Orthodox Easter Monday' },
  { date: '01-05', name: 'Labor Day' },
  { date: '02-05', name: 'Labor Day' },
  { date: '28-07', name: 'Vidovdan' },
  { date: '29-07', name: 'Vidovdan' },
  { date: '11-11', name: 'Armistice Day' }
];

const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const isSerbianHoliday = (date) => {
  const formattedDate = `${date.getDate().toString().padStart(2, '0')}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
  return serbianPublicHolidays.some(holiday => holiday.date === formattedDate);
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
  const [birthdate, setBirthdate] = useState('');
  const [retirementAge, setRetirementAge] = useState(65);
  const [daysUntilRetirement, setDaysUntilRetirement] = useState(null);

  const calculateDaysUntilRetirement = () => {
    if (!birthdate) {
      alert('Please enter your birthdate!');
      return;
    }

    const birthDateObj = new Date(birthdate);
    const retirementDate = new Date(birthDateObj.setFullYear(birthDateObj.getFullYear() + retirementAge));

    const today = new Date();

    if (retirementDate < today) {
      alert("You are already past your retirement age!");
      return;
    }

    const businessDaysUntilRetirement = calculateBusinessDays(today, retirementDate);

    const yearsUntilRetirement = retirementDate.getFullYear() - today.getFullYear();
    const vacationDays = calculateVacationDays(yearsUntilRetirement);

    const adjustedBusinessDays = businessDaysUntilRetirement - vacationDays;

    setDaysUntilRetirement(adjustedBusinessDays);
  };
  return (
    <div className="form-container">
      <h2>Days Until Retirement (Business Days)</h2>
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
          onChange={(e) => setRetirementAge(e.target.value)}
          className="form-input"
        />
      </div>
      <div className="form-actions">
        <button onClick={calculateDaysUntilRetirement} className='calculate-button'>
          Calculate
        </button>
      </div>

      {daysUntilRetirement !== null && (
        <div className="status-message">
          Business Days Until Retirement: {daysUntilRetirement}
          <br/>
          <br/>
          <span>This number already takes into account 20 business days of PTO per year and Serbian public holidays.</span>
        </div>
      )}
    </div>
  );
};

export default RetirementCalculator;
