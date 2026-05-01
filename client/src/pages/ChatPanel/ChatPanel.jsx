import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

function ChatPanel() {
  const [messages, setMessages] = useState([]);
  const [sessionId, setSessionId] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [userFormData, setUserFormData] = useState({});
  const location = useLocation();
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);


  useEffect(() => {
    const startData = location.state?.interviewData;
    const formData = location.state?.formData;

    if (startData && startData.sessionId && startData.question && startData.options && formData) {
      const initialMessage = {
        sender: "bot",
        text: startData.question,
        options: startData.options,
        type: "mcq"
      };

      setMessages([initialMessage]);
      setSessionId(startData.sessionId);
      setUserFormData(formData);
    } else {
      console.error("No career guidance data found. Redirecting...");
      navigate("/select");
    }
  }, [location.state, navigate]);


  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);


  const handleSendMessage = async (selectedAnswer) => {
    const userAnswer = selectedAnswer || selectedOption;
    if (!userAnswer || isLoading || !sessionId) return;

    setMessages((prev) => [...prev, { sender: "user", text: userAnswer }]);
    setSelectedOption("");
    setIsLoading(true);

    try {
      const resultResponse= await fetch(
        "https://careercounselling-production-725b.up.railway.app/api/interviews/evaluate",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId, userAnswer }),
        }
      );
      const response = await resultResponse.json();
      if (!resultResponse.ok) throw new Error("Failed to get evaluation.");

      const newBotMessage = {
        sender: "bot",
        text: response.question,
        feedback: response.feedback,
        options:  response.options,
        type: "mcq",
      };

      setMessages((prev) => [...prev, newBotMessage]);
    } catch (error) {
      console.error("Error during evaluation:", error);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Sorry, an error occurred.Please try again.", type: "text" },
      ]);
    } finally {
      setIsLoading(false);
    }
  };


  const handleSubmitInterview = async () => {
    if (!sessionId) {
      console.error("No session ID to submit.");
      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://careercounselling-production-725b.up.railway.app/api/interviews/summary",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ sessionId, location: userFormData.location }),
        }
      );

      if (!response.ok) throw new Error("Failed to fetch summary.");
      const summaryData = await response.json();
      navigate("/summary", { state: { summary: summaryData } });
    } catch (error) {
      console.error("Error submitting career guidance session:", error);
      alert("Could not generate the career guidance report. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex-grow bg-white p-6 ml-20">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Career Guidance Session
      </h1>

      <div
        ref={chatContainerRef}
        className="space-y-6 mb-8 max-h-[calc(100vh-250px)] overflow-y-auto pr-4 pb-10"
      >
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {}
            {msg.sender === "user" && (
              <div className="p-4 rounded-lg max-w-2xl bg-purple-600 text-white">
                <p className="font-semibold">You:</p>
                <p className="mt-1">{msg.text}</p>
              </div>
            )}

            {}
            {msg.sender === "bot" && (
              <div className="p-4 rounded-lg max-w-4xl bg-gray-100 text-gray-800">
                <p className="font-semibold">
                  <span className="font-bold">Career Advisor's Question:</span>
                </p>
                <p className="mt-1 whitespace-pre-wrap text-lg">{msg.text}</p>
                {msg.feedback && (
                  <div className="mt-3 p-3 bg-white/60 rounded-md border border-gray-300">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      <span className="font-bold text-base text-gray-900">Feedback:</span> {msg.feedback}
                    </p>
                  </div>
                )}

                {msg.options && msg.options.length > 0 && msg.type === "mcq" && (
                  <div className="mt-6">
                    <p className="text-sm font-medium text-gray-600 mb-4">
                      Select your answer:
                    </p>
                    <div className="space-y-3">
                      {msg.options.map((option, idx) => (
                        <label 
                          key={idx}
                          className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors"
                        >
                          <input
                            type="radio"
                            name={`question-${index}`}
                            value={option}
                            checked={selectedOption === option}
                            onChange={(e) => setSelectedOption(e.target.value)}
                            className="mt-1 h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300"
                            disabled={isLoading}
                          />
                          <span className="text-gray-800 text-left leading-relaxed">
                            {option}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={() => handleSendMessage(selectedOption)}
                        disabled={!selectedOption || isLoading}
                        className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        Submit Answer
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="p-4 rounded-lg bg-gray-100 text-gray-500">
              Career Advisor is analyzing...
            </div>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-20 right-0 bg-white p-6 shadow-top border-t border-gray-200">
        <div className="flex justify-center mt-4">
          <button
            className="px-6 py-2 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition disabled:bg-gray-400"
            onClick={handleSubmitInterview}
            disabled={isLoading}
          >
            Complete Career Assessment
          </button>
        </div>
      </div>
    </main>
  );
}

export default ChatPanel;











