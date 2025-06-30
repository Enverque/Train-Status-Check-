import React from 'react';
import "./Navbar.css";
import { NavLink } from 'react-router-dom';

const Navbar = () => {

  return (
    <div className="navbar">

      <img src="./img/tatkallogo.png" alt="Tatkal logo" />
      <div class="menu-toggle">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
      </div>

      <div className='nav-links'>
        <NavLink to ="/">IRCTC TICKET</NavLink>
        <NavLink to ="/PNR-STATUS">PNR STATUS</NavLink>
        <NavLink to ="/Train-Schedule">TRAIN SCHEDULE</NavLink>
        <NavLink to ="/">RUNNING STATUS</NavLink>
      </div>
    </div>
  );
};

export default Navbar;
