"use client"

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function Summary() {
  const [summaryData, setSummaryData] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem("user")) {
      navigate("/", { replace: true });
      return;
    }

    const data = location.state?.summary;
    if (data) {
      setSummaryData(data);
      try {
        localStorage.setItem("latestCareerSummary", JSON.stringify(data));
      } catch (err) {
        console.warn("Could not cache summary to localStorage:", err);
      }
    } else {
      // Check cached summary in case of page reload
      const cached = localStorage.getItem("latestCareerSummary");
      if (cached) {
        try {
          setSummaryData(JSON.parse(cached));
          return;
        } catch {
          // invalid cache, fallback to redirect
        }
      }
      console.log("No summary data found, redirecting.");
      navigate('/select');
    }
  }, [location.state, navigate]);

  const handlePrint = () => {
    window.print();
  };

  if (!summaryData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
        <h1 className="text-xl font-bold text-gray-800">Generating your personalized career report...</h1>
        <p className="text-sm text-gray-500 mt-2">Analyzing your assessment responses.</p>
        <button
          onClick={() => navigate("/student-dashboard")}
          className="mt-6 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-xl text-sm font-medium transition cursor-pointer"
        >
          ← Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/50 via-gray-50 to-gray-100 flex flex-col">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Left: Back to Dashboard & Title */}
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate("/student-dashboard")}
                className="text-gray-700 hover:text-purple-700 hover:bg-purple-50 px-3 py-1.5 rounded-xl transition flex items-center space-x-1.5 text-sm font-bold border border-gray-200 hover:border-purple-300 cursor-pointer shadow-2xs"
              >
                <span>←</span>
                <span>Dashboard</span>
              </button>
              <div className="h-5 w-px bg-gray-200 hidden sm:block"></div>
              <div className="flex items-center space-x-2">
                <span className="text-xl">🎓</span>
                <span className="font-bold text-gray-900 text-sm sm:text-base">
                  Assessment Report
                </span>
                <span className="hidden md:inline text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                  ✓ Analysis Complete
                </span>
              </div>
            </div>

            {/* Right: Quick actions */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button
                onClick={() => navigate("/select")}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition flex items-center space-x-1 cursor-pointer"
                title="Retake assessment for another domain"
              >
                <span>🔄</span>
                <span className="hidden sm:inline">Retake</span>
              </button>

              <button
                onClick={handlePrint}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition flex items-center space-x-1 cursor-pointer"
                title="Print or save as PDF"
              >
                <span>🖨️</span>
                <span className="hidden sm:inline">Print / Save</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition flex items-center space-x-1 cursor-pointer"
                title="Go to platform homepage"
              >
                <span>🏠</span>
                <span className="hidden sm:inline">Home</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Report Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
        {/* Celebratory Hero Header */}
        <div className="bg-gradient-to-r from-purple-700 via-indigo-700 to-purple-800 text-white rounded-3xl p-8 sm:p-10 shadow-xl relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
            <span className="text-9xl">🌟</span>
          </div>

          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur text-white text-xs font-semibold px-3.5 py-1 rounded-full mb-4">
              <span>🎉 Assessment Completed Successfully</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Your Personalized Career Blueprint
            </h1>
            <p className="text-purple-100 text-sm sm:text-base mt-2.5 leading-relaxed">
              Based on your educational qualifications, interests, and responses, here are your recommended courses, industry outlook, target colleges, and career pathways.
            </p>
          </div>
        </div>

        {/* Card 1: Recommended Courses */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 bg-purple-100 text-purple-700 rounded-xl flex items-center justify-center text-xl font-bold">
              🎓
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Recommended Courses & Degrees</h2>
              <p className="text-xs text-gray-500">Curated academic pathways aligning with your interests</p>
            </div>
          </div>

          {summaryData['course names'] && summaryData['course names'].length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {summaryData['course names'].map((course, index) => (
                <div
                  key={index}
                  className="bg-purple-50/70 hover:bg-purple-100/80 border border-purple-200/80 rounded-2xl p-4 transition duration-200 flex items-start space-x-3"
                >
                  <span className="text-purple-600 font-bold text-sm bg-purple-200/60 rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">
                    {index + 1}
                  </span>
                  <span className="text-gray-800 font-semibold text-sm leading-snug">
                    {course}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">No specific courses listed.</p>
          )}
        </div>

        {/* Card 2 & 3: Scope & Potential Job Roles */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Career Scope */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center text-xl font-bold">
                  📈
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Career Scope & Industry Trends</h3>
                  <p className="text-xs text-gray-500">Market demand & future growth prospects</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {summaryData['career scope'] || "Comprehensive growth opportunities exist in this field with continuous advancements and high market requirement."}
              </p>
            </div>
          </div>

          {/* Job Roles */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-xl flex items-center justify-center text-xl font-bold">
                  💼
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Potential Job Roles & Occupations</h3>
                  <p className="text-xs text-gray-500">Roles you can pursue after qualification</p>
                </div>
              </div>
              <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {summaryData['jobs in related career'] || "Diverse professional positions spanning industry leaders, specialized consulting, and research roles."}
              </p>
            </div>
          </div>
        </div>

        {/* Card 4: Suggested Colleges */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center text-xl font-bold">
                🏫
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Suggested Colleges & Universities</h2>
                <p className="text-xs text-gray-500">Institutions fitting your location and target discipline</p>
              </div>
            </div>

            <button
              onClick={() => navigate("/explore-colleges")}
              className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-xs sm:text-sm rounded-xl transition border border-indigo-200 flex items-center space-x-1.5 self-start sm:self-auto cursor-pointer"
            >
              <span>Explore All Colleges Map</span>
              <span>→</span>
            </button>
          </div>

          {summaryData.suggestedColleges && summaryData.suggestedColleges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {summaryData.suggestedColleges.map((college, index) => (
                <div
                  key={index}
                  className="bg-amber-50/50 hover:bg-amber-50 border border-amber-200/80 rounded-2xl p-4 transition flex items-start space-x-3"
                >
                  <span className="text-amber-700 text-base">🏛️</span>
                  <span className="text-gray-800 font-medium text-sm leading-snug">
                    {college}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm italic">Top recognized regional and national colleges available via college exploration.</p>
          )}
        </div>

        {/* Card 5: Selection Criteria & Pathways */}
        {summaryData.suggestedCollegesSelectionCriteria && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center text-xl font-bold">
                ✨
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Selection Criteria & Admission Pathways</h2>
                <p className="text-xs text-gray-500">Eligibility, entrance examinations, and strategic roadmap</p>
              </div>
            </div>
            <div className="bg-rose-50/50 rounded-2xl p-5 border border-rose-100">
              <p className="text-gray-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                {summaryData.suggestedCollegesSelectionCriteria}
              </p>
            </div>
          </div>
        )}

        {/* Next Steps Action Hub */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-purple-100 print:hidden">
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            🚀 Where would you like to go next?
          </h3>
          <p className="text-xs text-gray-500 mb-6">
            Take immediate action on your recommendations with our integrated guidance tools.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Action 1: Dashboard */}
            <button
              onClick={() => navigate("/student-dashboard")}
              className="p-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-semibold text-sm transition text-left flex flex-col justify-between shadow-md hover:shadow-lg cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                <div className="text-2xl mb-2">📊</div>
                <div className="font-bold text-base">Student Dashboard</div>
                <div className="text-purple-200 text-xs mt-1 font-normal">Return to your personal career dashboard</div>
              </div>
              <div className="text-xs font-bold mt-4 underline">Open Dashboard →</div>
            </button>

            {/* Action 2: Explore Colleges */}
            <button
              onClick={() => navigate("/explore-colleges")}
              className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 text-gray-900 font-semibold text-sm transition text-left flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                <div className="text-2xl mb-2">🏫</div>
                <div className="font-bold text-base text-blue-900">Explore Colleges</div>
                <div className="text-gray-600 text-xs mt-1 font-normal">Browse rankings, locations, and interactive maps</div>
              </div>
              <div className="text-xs font-bold text-blue-700 mt-4">Search Colleges →</div>
            </button>

            {/* Action 3: Consult Counsellor */}
            <button
              onClick={() => navigate("/consult-counsellor")}
              className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-amber-200 text-gray-900 font-semibold text-sm transition text-left flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                <div className="text-2xl mb-2">👨‍🏫</div>
                <div className="font-bold text-base text-amber-900">Consult Counsellor</div>
                <div className="text-gray-600 text-xs mt-1 font-normal">Schedule a 1-on-1 session with an expert</div>
              </div>
              <div className="text-xs font-bold text-amber-700 mt-4">Book Session →</div>
            </button>

            {/* Action 4: Retake Assessment */}
            <button
              onClick={() => navigate("/select")}
              className="p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-900 font-semibold text-sm transition text-left flex flex-col justify-between shadow-xs hover:shadow-md cursor-pointer transform hover:-translate-y-0.5"
            >
              <div>
                <div className="text-2xl mb-2">🔄</div>
                <div className="font-bold text-base text-gray-900">Retake Assessment</div>
                <div className="text-gray-600 text-xs mt-1 font-normal">Explore a different field of interest or qualification</div>
              </div>
              <div className="text-xs font-bold text-purple-700 mt-4">New Assessment →</div>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Summary;
