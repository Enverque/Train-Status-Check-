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
    </div>
  );
};

export default PnrStatus;