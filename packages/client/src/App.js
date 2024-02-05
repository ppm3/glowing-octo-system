// App.js
import React from "react";
import PhotoTable from "./PhotoTable";

const App = () => {
  return (
    <div className="container">
      <header className="header">
        <h1 id="mainTitle">Photo Gallery</h1>
      </header>
      <br />
      <PhotoTable />
      <br />
      <footer className="footer">
        <p>PPM3</p>
      </footer>
    </div>
  );
};

export default App;
