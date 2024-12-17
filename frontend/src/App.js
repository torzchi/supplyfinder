import React, { useState } from 'react';
import CypherForm from './components/CypherForm';
import ResultsTable from './components/ResultsTable';
import "./App.css";

function App() {
  const [results, setResults] = useState([]);

  return (
      <div>
          <h1>Neo4j Cypher Query Console</h1>
          <CypherForm setResults={setResults} />
          <ResultsTable results={results} />
      </div>
  );
}

export default App;