import React, { useState } from 'react';
import CypherForm from './components/CypherForm';
import ResultsTable from './components/ResultsTable';

function App() {
  const [results, setResults] = useState([]); // To store the results from Cypher query

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>Cypher Console</h1>
      <p>Enter your Cypher query below and submit:</p>

      {/* Cypher Form */}
      <CypherForm setResults={setResults} />

      {/* Results Table */}
      <ResultsTable results={results} />
    </div>
  );
}

export default App;
