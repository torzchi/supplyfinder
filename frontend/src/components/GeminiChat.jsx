import React, { useState } from "react";
import axios from "axios";
import "../App.css"

const GeminiChat = () => {
  const [prompt, setPrompt] = useState("");  // User input prompt
  const [responses, setResponses] = useState([]);  // List of responses
  const [loading, setLoading] = useState(false);  // Loading state
  const [error, setError] = useState("");  // Error state

  // Handles generating AI response
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt!"); // If no prompt entered
      return;
    }

    setLoading(true);  // Show loading indicator
    setError("");      // Clear previous error

    try {
      // Send API request with the prompt
      const res = await axios.get("http://localhost:8080/generate", {
        params: { prompt }, // Sending the prompt to the backend
      });

      setResponses((prevResponses) => [
        ...prevResponses,
        { type: "user", text: prompt },
        { type: "ai", text: res.data },
      ]); // Store the conversation in the state
    } catch (err) {
      // Handle error if API call fails
      setError("Failed to fetch response. Please try again.");
    } finally {
      setLoading(false); // Stop loading once done
    }

    setPrompt(""); // Clear the prompt field after submitting
  };

  return (
    <div className="layout-container">
      {/* Sidebar */}
      

      {/* Content Area */}
      <div className="content-area">
        {/* Chat Window */}
        <div className="chat-window">
          {/* Responses: Left side (AI messages) and Right side (User messages) */}
          <div className="w-full flex flex-col-reverse">
            {responses.map((response, index) => (
              <div
                key={index}
                className={`message ${response.type === "user" ? "user" : "ai"}`}
              >
                <div className="message-bubble">
                  {response.text}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Input area at the bottom */}
        <div className="input-container">
          {/* Text Input as Search Bar */}
          <input
            className="input-field"
            type="text"
            placeholder="Type your message..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)} // Update prompt on input change
          />

          {/* Send button */}
          <button
            className="send-btn"
            onClick={handleGenerate}
            disabled={loading}
          >
            {loading ? "Generating..." : "Send"}
          </button>
        </div>

        {/* Error message */}
        {error && <p className="error-message">{error}</p>}
      </div>
    </div>
  );
};

export default GeminiChat;
