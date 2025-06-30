import React, { useState } from 'react';
import axios from 'axios';
import Navbar from './navbar';
import './TrainSchedule.css';

const TrainSchedule = () => {
  const [trainNo, setTrainNo] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Function to calculate departure time (arrival + halt)
  const calculateDepartureTime = (arrivalTime, haltDuration) => {
    if (!arrivalTime || arrivalTime === '-' || !haltDuration) return '-';
    
    try {
      // Extract minutes from halt duration (handles "2", "2 min", etc.)
      const haltMinutes = parseInt(haltDuration.toString().replace(/\D/g, ''));
      if (isNaN(haltMinutes)) return '-';

      // Parse arrival time (HH:MM)
      const [hours, minutes] = arrivalTime.split(':').map(Number);
      
      // Calculate total minutes
      const totalMinutes = hours * 60 + minutes + haltMinutes;
      
      // Convert back to HH:MM format
      const depHours = Math.floor(totalMinutes / 60) % 24;
      const depMins = totalMinutes % 60;
      
      return `${String(depHours).padStart(2, '0')}:${String(depMins).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error calculating departure time:", e);
      return '-';
    }
  };

  const fetchTrainData = async () => {
    if (!trainNo) {
      setError('Please enter a train number');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const backendUrl = process.env.NODE_ENV === 'development' 
        ? 'http://localhost:8000/api/train' 
        : '/api/train';
      
      const response = await axios.get(`${backendUrl}/${trainNo}`);
      setTrainData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch train data');
      setTrainData(null);
    } finally {
      setLoading(false);
    }
  };

  const parseTiming = (timingStr) => {
    if (!timingStr || timingStr.length !== 10) return { arrival: '-', departure: '-' };
    return {
      arrival: timingStr.substring(0, 5),
      departure: timingStr.substring(5, 10)
    };
  };

  return (
    <>
      <Navbar />
      <div className="train-schedule">
        <h1>Train Schedule</h1>

        <div className="train-search">
          <input
            type="number"
            placeholder="Enter train no."
            value={trainNo}
            className="train-input"
            onChange={(e) => setTrainNo(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && fetchTrainData()}
          />
          <button onClick={fetchTrainData} disabled={loading}>
            {loading ? (
              <>
                <span className="spinner"></span> Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {trainData && trainData.data && (
          <div className="train-details">
            <div className="train-header">
              <h2>
                {trainData.data[0].train_name} ({trainNo})
              </h2>
              <div className="train-meta">
                <span>
                  <strong>From:</strong> {trainData.data[0].station_name}
                </span>
                <span>
                  <strong>To:</strong> {trainData.data[trainData.data.length - 1].station_name}
                </span>
                <span>
                  <strong>Status:</strong> {trainData.data[0].delay}
                </span>
              </div>
            </div>

            <div className="station-list-container">
              <table className="station-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Station</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Halt</th>
                    <th>Platform</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainData.data.map((station, index) => {
                    const timing = parseTiming(station.timing);
                    const calculatedDeparture = calculateDepartureTime(timing.arrival, station.halt);
                    
                    return (
                      <tr 
                        key={index} 
                        className={station.is_current_station ? 'current-station' : ''}
                      >
                        <td>{index + 1}</td>
                        <td>
                          {station.station_name}
                          {station.is_current_station && (
                            <span className="current-badge">Current</span>
                          )}
                        </td>
                        <td>{timing.arrival}</td>
                        <td>{calculatedDeparture}</td>
                        <td>{station.halt}</td>
                        <td>{station.platform}</td>
                        <td>{station.distance}</td>
                        <td>
                          <span className={`status-badge ${(station.delay || '').toLowerCase()}`}>
                            {station.delay}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default TrainSchedule;