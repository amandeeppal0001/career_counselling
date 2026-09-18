"use client"

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../config";

function Select() {
  const [formData, setFormData] = useState({
    role: "",
    domain: "",
    interviewMode: "medium",
    location: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (!storedUser) {
      navigate("/", { replace: true });
    } else {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.role.trim() || !formData.domain.trim() || !formData.location.trim()) {
      alert("Please fill in all required fields before starting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/interviews/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Failed to initialize career assessment.");
      }

      const interviewData = await response.json();
      navigate("/interview", { 
        state: { 
          interviewData: interviewData, 
          formData: formData,
          user: user
        } 
      });
    } catch (error) {
      console.error("Error starting assessment:", error);
      alert("Failed to start career guidance session. Please ensure backend server is running and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const qualificationSuggestions = ["10th Standard", "12th Standard", "Undergraduate", "Postgraduate", "Diploma"];
  const domainSuggestions = ["Software & AI", "Healthcare & Medicine", "Business & Finance", "Engineering", "Civil Services", "Creative Design"];
  const locationSuggestions = ["Delhi NCR", "Mumbai", "Bangalore", "Pune", "Hyderabad", "Remote / Any"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 via-gray-50 to-gray-100 flex flex-col">
      {/* Top Navigation Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Back & Breadcrumb */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 hover:text-purple-700 hover:bg-purple-50 p-2 rounded-xl transition flex items-center space-x-1.5 text-sm font-medium cursor-pointer"
                title="Go back to previous page"
              >
                <span>←</span>
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center space-x-2">
                <span className="w-8 h-8 bg-gradient-to-tr from-amber-500 to-orange-500 rounded-lg flex items-center justify-center text-white text-base shadow-sm">
                  🤔
                </span>
                <div>
                  <h1 className="text-base sm:text-lg font-bold text-gray-900 leading-tight">
                    Career Assessment Setup
                  </h1>
                  <p className="text-xs text-purple-700 font-medium hidden md:block">
                    Still Confused? We'll help discover your ideal career
                  </p>
                </div>
              </div>
            </div>

            {/* Right: Dashboard and Home Links */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate("/student-dashboard")}
                className="px-3.5 py-1.5 rounded-xl text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition flex items-center space-x-1.5 cursor-pointer shadow-2xs"
              >
                <span>📊</span>
                <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button
                onClick={() => navigate("/")}
                className="px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition flex items-center space-x-1 cursor-pointer"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Hero Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-800 text-xs font-semibold px-3 py-1 rounded-full mb-3 shadow-2xs">
            <span>✨ AI-Powered Career Recommendation Engine</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Find Your Perfect Career Path
          </h2>
          <p className="text-gray-600 text-sm sm:text-base max-w-xl mx-auto mt-2">
            Answer a few quick details about your background. Our interactive advisor will formulate tailored scenario questions and provide a customized career roadmap.
          </p>
        </div>

        {/* Assessment Form Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-200/80 p-6 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-indigo-500 to-amber-500"></div>

          <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-7">
            {/* Field 1: Qualification */}
            <div>
              <label htmlFor="role" className="block text-sm font-bold text-gray-800 mb-1.5">
                🎓 Highest Completed Qualification <span className="text-red-500">*</span>
              </label>
              <input
                id="role"
                type="text"
                placeholder="e.g., 10th Standard, 12th PCM, Bachelor of Arts, B.Tech CSE"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition bg-gray-50/50"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-gray-500 self-center mr-1">Quick pick:</span>
                {qualificationSuggestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: q })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      formData.role === q
                        ? "bg-purple-600 text-white border-purple-600 font-semibold"
                        : "bg-gray-100 hover:bg-purple-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Domain of Interest */}
            <div>
              <label htmlFor="domain" className="block text-sm font-bold text-gray-800 mb-1.5">
                💡 Field of Interest or Passion <span className="text-red-500">*</span>
              </label>
              <input
                id="domain"
                type="text"
                placeholder="e.g., Artificial Intelligence, Clinical Psychology, Digital Marketing, Corporate Law"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition bg-gray-50/50"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-gray-500 self-center mr-1">Popular:</span>
                {domainSuggestions.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setFormData({ ...formData, domain: d })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      formData.domain === d
                        ? "bg-purple-600 text-white border-purple-600 font-semibold"
                        : "bg-gray-100 hover:bg-purple-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Field 3: Assessment Level */}
            <div>
              <label htmlFor="interviewMode" className="block text-sm font-bold text-gray-800 mb-1.5">
                🎯 Assessment Depth / Level <span className="text-red-500">*</span>
              </label>
              <select
                id="interviewMode"
                value={formData.interviewMode}
                onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition bg-gray-50/50 cursor-pointer"
                required
              >
                <option value="easy">Easy — Quick preliminary interest check (Recommended for beginner students)</option>
                <option value="medium">Medium — Balanced situational analysis & career compatibility</option>
                <option value="hard">Hard — In-depth comprehensive career evaluation</option>
              </select>
            </div>

            {/* Field 4: Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-bold text-gray-800 mb-1.5">
                📍 Target Location / City Preference <span className="text-red-500">*</span>
              </label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Delhi NCR, Mumbai, Bangalore, or Remote"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm sm:text-base transition bg-gray-50/50"
                required
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                <span className="text-xs text-gray-500 self-center mr-1">Locations:</span>
                {locationSuggestions.map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setFormData({ ...formData, location: loc })}
                    className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                      formData.location === loc
                        ? "bg-purple-600 text-white border-purple-600 font-semibold"
                        : "bg-gray-100 hover:bg-purple-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    {loc}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => navigate("/student-dashboard")}
                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-100 transition text-center cursor-pointer order-2 sm:order-1"
              >
                ← Return to Dashboard
              </button>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 text-white font-bold text-base shadow-md hover:shadow-lg hover:from-purple-700 hover:to-indigo-700 transition-all transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 cursor-pointer order-1 sm:order-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    <span>Initializing Assessment...</span>
                  </>
                ) : (
                  <>
                    <span>Start Career Assessment</span>
                    <span>→</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}

export default Select;
