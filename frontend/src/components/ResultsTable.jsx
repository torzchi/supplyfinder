import React from "react";

const ResultsTable = ({ results }) => {
  if (!results || results.length === 0) {
    return <p>No results to display</p>;
  }

  return (
    <table border="1" style={{ marginTop: '20px', margin: 'auto' }}>
      <thead>
        <tr>
          {Object.keys(results[0]).map((key) => (
            <th key={key}>{key}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {results.map((row, index) => (
          <tr key={index}>
            {Object.values(row).map((value, idx) => (
              <td key={idx}>{JSON.stringify(value)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default ResultsTable;
