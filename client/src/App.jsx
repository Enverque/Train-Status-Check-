import React from 'react'; 
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Pnr_page from "./Pnr_page";
import Home from "./Home";
import TrainSchedule from "./Train_schedule";


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element = {<Home />} />
        <Route exact path="/PNR-STATUS" element={<Pnr_page />} />
        <Route exact path="/Train-Schedule" element={<TrainSchedule />} />
      </Routes>
    </Router>
  );
}

export default App;
