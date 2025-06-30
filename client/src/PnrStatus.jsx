import React, { useState } from 'react';
import { configure, checkPNRStatus } from 'railkit';
import './PnrStatus.css';

// Initialize with your API key from .env
configure(import.meta.env.VITE_RAILKIT_API_KEY);

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
        const response = await checkPNRStatus(pnr);
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