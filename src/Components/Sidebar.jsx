import React from "react";
import "../styles/Sidebar.css";

function Sidebar({ setCurrentView }) {
  return (
    <div className="sidebar">
      <div className="logo">
        <img src="src/assets/bgames_icon.png" alt="Logo" />
      </div>
      <button className="button" onClick={() => setCurrentView("reddit")}>
        Reddit Data
      </button>
      <button className="button" onClick={() => setCurrentView("steam")}>
        Steam Data
      </button>
      <button className="button" onClick={() => setCurrentView("overflow")}>
        StackOverflow Data
      </button>
    </div>
  );
}

export default Sidebar;

