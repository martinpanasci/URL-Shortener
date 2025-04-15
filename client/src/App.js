import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";


import Header from "./components/Header";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import Welcome from './components/Welcome';
import ConfirmEmail from './components/ConfirmEmail';
import ResetPassword from "./components/ResetPassword";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <div>
        <Header />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgotPassword" element={<ForgotPassword />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/confirmEmail/:token" element={<ConfirmEmail />} />
          <Route path="/resetPassword/:token" element={<ResetPassword />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
