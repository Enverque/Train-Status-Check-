import React, { useState, useRef } from 'react';
import { useReactToPrint } from "react-to-print";
import Navbar from './Navbar';
import './Pnr_page.css';
import pnrData from "./Pnr_Status.json";

function Pnr_page() {
    const [pnrResult, setPnrResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchPnr, setSearchPnr] = useState('');
    const [expandedView, setExpandedView] = useState(false);
    const [showResultsOnly, setShowResultsOnly] = useState(false); 
    const printRef = useRef();

    const handleSearch = () => {
        if (!searchPnr) return;
        
        setLoading(true);
        setError(null);
        setPnrResult(null);
        setExpandedView(false);
        
        setTimeout(() => {
            try {
                if (!/^\d{10}$/.test(searchPnr)) {
                    throw new Error('Invalid PNR. Please enter a 10-digit number.');
                }
                
                const result = pnrData.find(item => item.PNR_Number === searchPnr);
                
                if (result) {
                    setPnrResult(result);
                    setExpandedView(true);
                    setShowResultsOnly(true); 
                } else {
                    throw new Error('PNR not found. Please check the number and try again.');
                }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        }, 1000);
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && searchPnr.length === 10) {
            handleSearch();
        }
    };

    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    const toggleExpandedView = () => {
        setExpandedView(!expandedView);
    };

    const handlePrint = useReactToPrint({
        content: () => printRef.current,
    });


    return (
        <>
            <Navbar />
            <div className="pnr-container">
                {!showResultsOnly ? (
                    <div className="pnr-search-box">
                        <h1 className="pnr-title">Check Your PNR Status</h1>
                        <p className="pnr-subtitle">Enter your 10-digit PNR number to check current status</p>
                        
                        <div className="input-group">
                            <input
                                type="text"
                                placeholder="Enter 10-digit PNR Number"
                                maxLength="10"
                                value={searchPnr}
                                onChange={(e) => setSearchPnr(e.target.value.replace(/\D/g, ''))}
                                onKeyPress={handleKeyPress}
                                className="pnr-input"
                            />
                            <button 
                                className="search-btn"
                                onClick={handleSearch}
                                disabled={!searchPnr || searchPnr.length !== 10}
                            >
                                <i className="fas fa-search"></i> Check Status
                            </button>
                        </div>
                        
                        {loading && (
                            <div className="loading-overlay">
                                <div className="spinner-container">
                                    <div className="spinner"></div>
                                    <p>Fetching PNR details...</p>
                                </div>
                            </div>
                        )}
                        
                        {error && (
                            <div className="error-message">
                                <i className="fas fa-exclamation-circle"></i>
                                {error}
                            </div>
                        )}
                    </div>
                ) : (
                    // Results section - shown after successful search
                    <div className="pnr-result-container expanded">
                        <div className="result-header">
                            <h2 className="results-title">PNR Status Details</h2>
                        </div>
                        
                        <div className="result-summary" onClick={toggleExpandedView}>
                            <div className="summary-item">
                                <span className="summary-label">PNR:</span>
                                <span className="summary-value">{pnrResult.PNR_Number}</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Train:</span>
                                <span className="summary-value">{pnrResult.Train_Name} ({pnrResult.Train_Number})</span>
                            </div>
                            <div className="summary-item">
                                <span className="summary-label">Journey:</span>
                                <span className="summary-value">{pnrResult.From} → {pnrResult.To}</span>
                            </div>
                            <div className="summary-item status">
                                <span className="summary-label">Current Status:</span>
                                <span className={`summary-value ${pnrResult.Current_Status ? 'confirmed' : 'not-confirmed'}`}>
                                    {pnrResult.Current_Status ? 'Confirmed' : 'Not Confirmed'}
                                </span>
                            </div>
                            <div className="expand-toggle">
                                <i className={`fas fa-chevron-${expandedView ? 'up' : 'down'}`}></i>
                            </div>
                        </div>
                        
                        <div className="detailed-results" ref={printRef}>
                            <div className="result-grid">
                                <div className="result-card">
                                    <h3>Journey Details</h3>
                                    <div className="result-row">
                                        <span className="result-label">Departure Date:</span>
                                        <span className="result-value">{formatDate(pnrResult.Boarding_date)}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">From Station:</span>
                                        <span className="result-value">{pnrResult.From}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">To Station:</span>
                                        <span className="result-value">{pnrResult.To}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Departure Time:</span>
                                        <span className="result-value">19:30</span>
                                    </div>
                                </div>
                                
                                <div className="result-card">
                                    <h3>Booking Information</h3>
                                    <div className="result-row">
                                        <span className="result-label">Booking Status:</span>
                                        <span className={`result-value ${pnrResult.Booking_Status ? 'confirmed' : 'not-confirmed'}`}>
                                            {pnrResult.Booking_Status ? 'Confirmed' : 'Not Confirmed'}
                                        </span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Charting Status:</span>
                                        <span className={`result-value ${pnrResult.Charting_Status === 'Prepared' ? 'prepared' : 'not-prepared'}`}>
                                            {pnrResult.Charting_Status}
                                        </span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Coach Position:</span>
                                        <span className="result-value">{pnrResult.Coach_position}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Seat Number:</span>
                                        <span className="result-value">42</span>
                                    </div>
                                </div>
                                
                                <div className="result-card">
                                    <h3>Fare Details</h3>
                                    <div className="result-row">
                                        <span className="result-label">Total Fare:</span>
                                        <span className="result-value">₹{pnrResult.Fare}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Class:</span>
                                        <span className="result-value">{pnrResult.Class || 'Sleeper'}</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Quota:</span>
                                        <span className="result-value">General</span>
                                    </div>
                                    <div className="result-row">
                                        <span className="result-label">Passengers:</span>
                                        <span className="result-value">2</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="action-buttons">
                                <button className="print-btn" onClick={handlePrint}>
                                    <i className="fas fa-print"></i> Print Ticket
                                </button>
                                <button className="share-btn">
                                    <i className="fas fa-share-alt"></i> Share Details
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Pnr_page;