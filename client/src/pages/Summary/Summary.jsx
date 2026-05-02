

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Fragment } from 'react';
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
    } else {

      console.log("No summary data found, redirecting.");
      navigate('/select');
    }
  }, [location.state, navigate]);


  if (!summaryData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <h1 className="text-2xl font-bold text-gray-700">Generating your personalized report...</h1>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 mt-3 p-8">
            <div className="w-full max-w-5xl bg-white shadow-xl rounded-lg p-10 mt-14">
                <h1 className="text-4xl font-bold text-center text-purple-700 mb-2">Your Personalized Career Report</h1>
                <p className="text-lg text-gray-600 text-center mb-10">Based on your interests and qualifications.</p>

                {}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Recommended Courses 🎓</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {summaryData['course names']?.map((course, index) => (
                            <li key={index} className="pl-4">{course}</li>
                        ))}
                    </ul>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
                    {}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Career Scope 📈</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summaryData['career scope']}</p>
                    </div>

                    {}
                    <div>
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Potential Job Roles 💼</h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summaryData['jobs in related career']}</p>
                    </div>
                </div>

                {}
                <div className="mb-10">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Suggested Colleges in Your Area 🏫</h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-700">
                        {summaryData.suggestedColleges?.map((college, index) => (
                            <li key={index} className="pl-4">{college}</li>
                        ))}
                    </ul>
                </div>

                {}
                <div>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-4">Selection Criteria & Pathways ✨</h2>
                    <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{summaryData.suggestedCollegesSelectionCriteria}</p>
                </div>
            </div>
        </div>
  );
}

export default Summary;








