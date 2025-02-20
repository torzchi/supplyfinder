import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CypherForm from "./components/CypherForm";
import ResultsTable from "./components/ResultsTable";
import GeminiChat from "./components/GeminiChat";
import "./App.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <h2>Sidebar</h2>
      <ul>
        <li><a href="/">Cypher Console</a></li>
        <li><a href="/chat">Gemini Chat</a></li>
      </ul>
    </div>
  );
}

function App() {
  const [results, setResults] = useState([]);

  return (
    <Router>
      <div className="app-container">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main content area */}
        <div className="content">
          <Routes>
            <Route 
              path="/" 
              element={
                <div>
                  <h1>Neo4j Cypher Query Console</h1>
                  <CypherForm setResults={setResults} />
                  <ResultsTable results={results} />
                </div>
              }
            />
            <Route path="/chat" element={<GeminiChat />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
