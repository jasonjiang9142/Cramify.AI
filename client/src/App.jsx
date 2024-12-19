import React from 'react';
import Landing from './routes/Landing';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Mapping from './routes/Mapping';
import MoreInfo from './routes/moreinfo';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mapping" element={<Mapping />} />
        <Route path="/mapping/:id" element={<MoreInfo />} />

      </Routes>
    </BrowserRouter>
  );
}


export default App;