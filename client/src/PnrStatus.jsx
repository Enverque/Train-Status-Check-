import React, { useState } from 'react';
import './PnrStatus.css';


const PnrStatus = () => {
  const [pnr, setPnr] = useState('');
  const [pnrData, setPnrData] = useState(null);

  const handleChange = (event) => {
    setPnr(event.target.value);
  };

  const handleSubmit = async () => {
    if (pnr) {
      console.log('PNR Search submitted:', pnr);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:8000"}/api/pnr/${pnr}`);
        const response = await res.json();
        console.log('PNR Data:', response);
        setPnrData(response);
      } catch (error) {
        console.error('Error fetching PNR status:', error);
      }
      setPnr("");
    }
  };

  return (
    <div className='pnr-container'>
    </div>
  );
};

export default PnrStatus;