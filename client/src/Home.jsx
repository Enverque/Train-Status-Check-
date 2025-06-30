import React from 'react';
import './App.css';
import Navbar from './Navbar';
import AboutUs from './AboutUs';
import PnrStatus from './PnrStatus';
import TatkalContent from './TatkalContent';
import Footer from './Footer';


function Home() {
    return <>
    (
        <Navbar />
        <PnrStatus />
        <AboutUs />
        <TatkalContent />
        <Footer />
    )
    </>
}

export default Home;