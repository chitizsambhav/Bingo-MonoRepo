import React, { useState, useEffect } from "react";
import Navbar from "../navbar/Navbar";
import { Outlet } from "react-router-dom";
import Footer from "../footer/Footer";
import './layout.css'
export default function Layout() {

  return (
    <>
    <div className="bingo__Layout-container">
        <div className="bingo__Layout-header">
            <Navbar />
        </div>
        <div className="bingo__Layout-outlet">
            <Outlet />
        </div>
        <div className="bingo__Layout-footer">
            <Footer />
        </div>
    </div>
    
    </>
  );
}
