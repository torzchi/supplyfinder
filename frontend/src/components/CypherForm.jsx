import React, { useState } from "react";
import axios from "axios";

const CypherForm = ({ setResults }) => {
  const [query, setQuery] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8080/api/cypher/execute", query, {
        headers: { "Content-Type": "text/plain" },
      });
      setResults(response.data);  // Set the results to the parent component
    } catch (error) {
      console.error("Error executing query:", error);
      setResults([{ error: error.message }]); // Show error in case of failure
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        rows="5"
        cols="50"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter your Cypher query"
      />
      <br />
      <button type="submit">Execute</button>
    </form>
  );
};

export default CypherForm;
