import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './TrainSchedule.css';

const TrainSchedule = () => {
  const [trainNo, setTrainNo] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState('');

  const calculateDepartureTime = (arrivalTime, haltDuration) => {
    if (!arrivalTime || arrivalTime === '-' || !haltDuration) return '-';
    
    try {
      const haltMinutes = parseInt(haltDuration.toString().replace(/\D/g, '')) || 0;
      const [hours, minutes] = arrivalTime.split(':').map(Number);
      
      const totalMinutes = hours * 60 + minutes + haltMinutes;
      const depHours = Math.floor(totalMinutes / 60) % 24;
      const depMins = totalMinutes % 60;
      
      return `${String(depHours).padStart(2, '0')}:${String(depMins).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error calculating departure time:", e);
      return '-';
    }
  };

  const fetchTrainData = async () => {
    if (!trainNo || !/^\d{5}$/.test(trainNo)) {
      setError('Please enter a valid 5-digit train number');
      return;
    }

    setLoading(true);
    setError('');
    setLastSearched(trainNo);
    
    try {
      console.log(`Fetching data for train: ${trainNo}`);
      const response = await axios.get(
        `http://localhost:8000/api/train/${trainNo}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      console.log('API Response:', response.data);
      
      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || "No data received from server");
      }
      
      setTrainData(response.data);
    } catch (err) {
      console.error('Fetch Error:', {
        message: err.message,
        response: err.response?.data
      });

      let errorMessage = 'Failed to fetch train data';
      if (err.response) {
        errorMessage = err.response.data?.error || 
                      `Server responded with ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server - is the backend running?';
      }
      
      setError(errorMessage);
      setTrainData(null);
    } finally {
      setLoading(false);
    }
  };

  const parseTiming = (timingStr) => {
    if (!timingStr || timingStr.length < 10) return { arrival: '-', departure: '-' };
    return {
      arrival: timingStr.substring(0, 5) || '-',
      departure: timingStr.substring(5, 10) || '-'
    };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchTrainData();
    }
  };

  return (
    <>
      <Navbar />
      <div className="train-schedule">
        <h1>Train Schedule</h1>

        <div className="train-search">
          <input
            type="number"
            placeholder="Enter 5-digit train number"
            value={trainNo}
            className="train-input"
            onChange={(e) => setTrainNo(e.target.value)}
            onKeyPress={handleKeyPress}
            min="00999"
            max="99999"
          />
          <button 
            onClick={fetchTrainData} 
            disabled={loading || !trainNo || trainNo.length !== 5}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            {error.includes('backend') && (
              <p>Make sure your backend server is running on port 8000</p>
            )}
          </div>
        )}

        {loading && !error && (
          <div className="loading-message">
            Fetching data for train {trainNo}...
          </div>
        )}

        {trainData && trainData.data ? (
          <div className="train-details">
            <div className="train-header">
              <h2>
                {trainData?.train_name || 
                trainData?.data?.train_name || 
                trainData?.data?.[0]?.train_name || 
                `Train ${trainNo}`}
              </h2>
              <div className="train-meta">
                <span>
                  <strong>From:</strong> {trainData.data[0]?.station_name || 'N/A'}
                </span>
                <span>
                  <strong>To:</strong> {trainData.data[trainData.data.length - 1]?.station_name || 'N/A'}
                </span>
                <span>
                  <strong>Status:</strong> {trainData.data[0]?.delay || 'N/A'}
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
                          <span className={`status-badge ${(station.delay || '').toLowerCase().includes('delayed') ? 'delayed' : 'on-time'}`}>
                            {station.delay || 'On Time'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="no-data">
            
            </div>
          )
        )}
      </div>
    </>
  );
};

export default TrainSchedule;