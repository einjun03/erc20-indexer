import React from 'react'
import ReactDOM from 'react-dom/client'
import {WalletBalances, Home, Login, Register} from './pages/index.jsx'

import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom';

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/WalletBalances" element={<WalletBalances />} />
      <Route path="/Login" element={<Login />} />
      <Route path="/Register" element={<Register />} />
    </Routes>
  </BrowserRouter>
)