import { useState,useEffect , Fragment } from "react";
import { useNavigate } from "react-router-dom";
import { Listbox, Transition } from "@headlessui/react";
import { IoMdArrowDropdown } from "react-icons/io";

import Logo from "../../assets/logoix.png";

function Select() {
  const [formData, setFormData] = useState({
    role: "",
    domain: "",
    interviewMode: "",
    location: "", 
  });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://careercounselling-production-725b.up.railway.app/api/interviews/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        throw new Error("Starting of test failed");
      }

      const interviewData = await response.json();
      console.log("Server response:", interviewData);
      console.log("Selected Data:", formData);


      navigate("/interview", { state: { interviewData: interviewData, formData: formData } });

    } catch (error) {
      console.error("Error starting interview:", error);
      alert("Failed to start career guidance session. Please try again.");
    }
  };

  return (
    <div className="relative min-h-screen bg-white ">
      <div className="flex flex-col items-center justify-center min-h-screen px-4 m-20">
        <h2 className="text-3xl font-bold text-gray-700 pb-22">
          Start Your Career Guidance Journey
        </h2>

        <form
          onSubmit={handleSubmit}
          className="w-full max-w-4xl" 
        >
          <div className="flex flex-col gap-10 w-full">

            <div className="flex flex-col form-group"> 
              <label htmlFor="role" className="font-bold text-purple-700">Highest Completed Qualification</label>
              <input
                id="role"
                type="text"
                placeholder="e.g., 10th, 12th, Graduate, Post Graduate"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex flex-col form-group"> 
              <label htmlFor="domain" className="font-bold text-purple-700">Field of Interest</label>
              <input
                id="domain"
                type="text"
                placeholder="e.g., Software Development, Medicine, Teaching, Business"
                value={formData.domain}
                onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

            <div className="flex flex-col form-group">
              <label htmlFor="interviewMode" className="font-bold text-purple-700">Assessment Level</label>
              <select
                id="interviewMode"
                value={formData.interviewMode}
                onChange={(e) => setFormData({ ...formData, interviewMode: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              >
                <option value="">Select Assessment Level</option>
                <option value="easy">Easy - Basic interest assessment</option>
                <option value="medium">Medium - Detailed career exploration</option>
                <option value="hard">Hard - Comprehensive career planning</option>
              </select>
            </div>

            <div className="flex flex-col form-group">
              <label htmlFor="location" className="font-bold text-purple-700">Your Location</label>
              <input
                id="location"
                type="text"
                placeholder="e.g., Delhi, Mumbai, Bangalore, Chennai"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </div>

          </div>

          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-purple-600 text-white px-8 py-3 rounded-full hover:bg-purple-700 transition font-semibold"
            >
              Start Career Assessment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Dropdown({ label, options, value, onChange }) {
  return (
    <div className="w-full relative">
      <Listbox value={value} onChange={onChange}>
        <Listbox.Label className="block text-sm font-medium mb-1">
          {label}
        </Listbox.Label>
        <div className="relative">
          <Listbox.Button className="w-full border border-gray-300 rounded px-3 py-2 bg-white text-left focus:outline-none focus:ring-2 focus:ring-purple-500 flex justify-between items-center">
            <span>{value || `Select ${label}`}</span>
            <IoMdArrowDropdown className="h-5 w-5 text-gray-500" />
          </Listbox.Button>

          <Transition
            as={Fragment}
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >

            <Listbox.Options className="absolute z-50 mt-1 w-full bg-gray-500 border border-gray-300 rounded shadow-lg max-h-60 overflow-auto focus:outline-none">
              {options.map((option, index) => (
                <Listbox.Option
                  key={index}
                  value={option}
                  className={({ active }) =>
                    `cursor-pointer select-none px-4 py-2 ${
                      active ? "bg-purple-100 text-purple-900" : "text-gray-900"
                    }`
                  }
                >
                  {option}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      </Listbox>
    </div>
  );
}

export default Select;




















































































