import React from "react";
import "../App.css"

const ResultsTable = ({ results }) => {
    if (!results || results.length === 0) {
        return <p style={{ textAlign: "center" }}>No results to display</p>;
    }

    return (
        <div className="results-table-container">
            <h2>Query Results</h2>
            <table>
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
        </div>
    );
};

export default ResultsTable;
