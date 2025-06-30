import React from 'react';
import PnrStatus from "./PnrStatus";
import Navbar from "./navbar";
import './Pnr_page.css';


function Pnr_page() {
    return <>
        <Navbar />
        <PnrStatus />

        <div className="details">
                <div className="train_name">
                    <p><strong>Train no.</strong></p>
                    <input type="text" name="train_no"/>
                </div>
                <div className="DOJ">
                    <p><strong>DOJ</strong></p>
                    <input type="date" name="DOJ"/>
                </div>
                <div className="Booking_Status">
                    <p><strong>Booking Status:</strong></p>
                    <input type="text" name="Booking_Status"/>
                </div>
                <div className="Current_Status">
                    <p><strong>Current Status:</strong></p>
                    <input type="text" name="Current_Status"/>
                </div>
                <div className="Chart_Prepared">
                    <p><strong>Chart Prepared:</strong></p>
                    <input type="text" name="Chart_Prepared"/>
                </div>
        </div>
    </>
}

export default Pnr_page;