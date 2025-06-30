import React from "react";
import "./TatkalContent.css";

const TatkalContent = () => {
  return <>

      <div className='About_tatkal'>
          <div className='middle_content'>
              <div className="tatkal">
                <h3>Know More With Tatkal -</h3>
            </div>

            <div className="tatkal_content">
              <div className="irctc_tkt">
                <a href="#">
                  <img src="./img/Running_status.jpeg" alt="Train" />
                  <p>IRCTC Ticket</p>
                </a>
              </div>
              <hr className="vertical-separator" />
              <div className="PNR_Status">
                <a href="#">
                  <img src="./img/PNR_status.png" alt="PNR Status" />
                  <p>PNR Status</p>
                </a>
              </div>
              <hr className="vertical-separator" />
              <div className="Running_Status">
                <a href="#">
                  <img src="./img/Running_status.jpeg" alt="Train" />
                  <p>Running Status</p>
                </a>
              </div>
              <hr className="vertical-separator" />
              <div className="Train_Schedule">
                <a href="#">
                  <img src="./img/Train_schedule.jpg" alt="Schedule" />
                  <p>Train Schedule</p>
                </a>
              </div>
            </div>
          </div>
      </div>
    
  </>
};

export default TatkalContent;
