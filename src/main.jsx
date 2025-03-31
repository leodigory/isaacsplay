import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import Login from './pages/Login';
import Profiles from './pages/Profiles/Profiles';
import Home from './pages/Home/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/profiles" element={<Profiles />} />
        <Route path="/home" element={<App />} /> {/* Renderiza o App com o Home */}
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);