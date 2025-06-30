import React from 'react';
import "./Footer.css";

const Footer = () => {
  return (
    <>
      <div className="footer">
        <div className="mylogo">
          <img src="./img/tatkallogo.png" alt="Tatkal logo" />
          <p>Tatkal.com is official partner of IRCTC to book IRCTC train ticket and railway train enquiry</p>
        </div>

        <div className="book">
          <p className="footer-heading">Book</p>
          <a href="#">IRCTC Ticket</a>
          <a href="#">Flights</a>
          <a href="#">Hotels</a>
        </div>

        <div className="features">
          <p className="footer-heading">Features</p>
          <a href="#">PNR Status</a>
          <a href="#">Train Running Status</a>
          <a href="#">Train Schedule</a>
        </div>

        <div className="aboutTatkal">
          <p className="footer-heading">About Tatkal.com</p>
          <a href="#">Contact us</a>
          <a href="#">Media Kit</a>
          <a href="#">Alliances</a>
        </div>

        <div className="partners">
          <p className="footer-heading">Partners</p>
          <a href="#">Ixigo</a>
          <a href="#">Abhibus</a>
        </div>

        <div className="legal">
          <p className="footer-heading">Legal</p>
          <a href="#">Privacy policy</a>
          <a href="#">Terms & conditions</a>
        </div>

        <div className="apps">
          <p className="footer-heading">Apps</p>
          <a href="#">Tatkaltxt</a>
          <a href="#">Media Kit</a>
          <a href="#">Alliances</a>
        </div>

        <div className="follow">
          <p className="footer-heading">Follow us</p>
          <div className="socialmedia">
            <a href="#"><img src="./img/instagram.jpeg" alt="Instagram" /></a>
            <a href="#"><img src="./img/facebook.jpeg" alt="Facebook" /></a>
            <a href="#"><img src="./img/twitter.png" alt="Twitter" /></a>
          </div>
        </div>
      </div>

      <div className="copyright">
        <p>&copy; 2025 Tatkal.com. All rights reserved.</p>
      </div>
    </>
  );
};

export default Footer;