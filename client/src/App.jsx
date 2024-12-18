import React from 'react';
import Landing from './routes/landing';
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import Mapping from './routes/mapping';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/mapping" element={<Mapping />} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;