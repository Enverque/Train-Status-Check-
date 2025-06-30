import React, { useState } from 'react';
import './PnrStatus.css';

const PnrStatus = () => {
  const [pnr, setPnr] = useState('');

  const handleChange = (event) => {
    setPnr(event.target.value);
  };

  const handleSubmit = () => {
    if (pnr) {
      console.log('PNR Search submitted:', pnr);
      setPnr("");
    }
  };

  return (
    <div className='pnr-container'>
      <div className="pnr-input-container">
        <input 
          type="text" 
          className="pnr-input" 
          placeholder="Please Enter Your PNR Number" 
          value={pnr} 
          onChange={handleChange}
        />
        <button className="pnr-button" onClick={handleSubmit}>
          <span className="button-text">Search</span>
          <span className="button-icon">→</span>
        </button>
      </div>
    </div>
  );
};

export default PnrStatus;