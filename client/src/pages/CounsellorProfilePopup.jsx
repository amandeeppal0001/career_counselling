"use client"

import { useState } from "react"

const CounsellorProfilePopup = ({ user, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    fullName: "",
    specialization: "",
    experience: "",
    qualifications: [],
    expertise: [],
    location: "",
    phoneNumber: "",
    bio: "",
    consultationFee: "",
    availability: {
      days: [],
      timeSlots: [],
    },
    languages: [],
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const steps = [
    { title: "Personal Information", subtitle: "Tell us about yourself" },
    { title: "Professional Details", subtitle: "Your qualifications and experience" },
    { title: "Expertise & Services", subtitle: "What you specialize in" },
    { title: "Availability & Contact", subtitle: "How students can reach you" },
  ]

  const specializationOptions = [
    "Career Counseling",
    "Academic Guidance",
    "College Admissions",
    "Skill Development",
    "Mental Health",
    "Life Coaching",
  ]
  const qualificationOptions = ["PhD", "Masters", "Bachelors", "Diploma", "Certification", "Professional License"]
  const expertiseOptions = [
    "STEM Careers",
    "Arts & Humanities",
    "Business & Finance",
    "Healthcare",
    "Technology",
    "Education",
    "Social Work",
    "Engineering",
    "Law",
    "Creative Fields",
  ]
  const dayOptions = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const timeSlotOptions = Array.from({ length: 24 }, (_, i) => {
    const start = i.toString().padStart(2, '0');
    const end = ((i + 1) % 24).toString().padStart(2, '0');
    return `${start}:00-${end}:00`;
  });
  const languageOptions = [
    "English",
    "Hindi",
    "Bengali",
    "Tamil",
    "Telugu",
    "Marathi",
    "Gujarati",
    "Kannada",
    "Malayalam",
    "Punjabi",
  ]

  const handleInputChange = (field, value) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }))
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  const handleMultiSelect = (field, option) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".")
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: prev[parent][child].includes(option)
            ? prev[parent][child].filter((item) => item !== option)
            : [...prev[parent][child], option],
        },
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [field]: prev[field].includes(option)
          ? prev[field].filter((item) => item !== option)
          : [...prev[field], option],
      }))
    }
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const payload = {
        userId: user._id,
        ...formData,
        experience: Number(formData.experience),
        consultationFee: Number(formData.consultationFee),
        profileCompleted: true,
      };

      console.log("Counsellor payload:", payload);

      const response = await fetch(
        "https://career-counselling-nr04.onrender.com/api/users/complete-counsellor-profile",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        const profileData = await response.json();
        onComplete(profileData);
      } else {
        const err = await response.json();
        console.error("Failed to save counsellor profile:", err);
        alert("Failed to save profile. Check console for details.");
        setIsSubmitting(false)
      }
    } catch (error) {
      console.error("Error saving counsellor profile:", error);
      alert("Error saving profile. Please try again.");
      setIsSubmitting(false)
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Full Name *</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Location *</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange("location", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="City, State"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your contact number"
              />
            </div>
          </div>
        )

      case 1: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Experience (Years) *</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="e.g. 5"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Qualifications *</label>
              <div className="grid grid-cols-2 gap-2">
                {qualificationOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelect("qualifications", opt)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.qualifications.includes(opt)
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Bio / Professional Summary *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Tell students about your expertise..."
                rows="4"
              />
            </div>
          </div>
        )

      case 2: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Specialization *</label>
              <select
                value={formData.specialization}
                onChange={(e) => handleInputChange("specialization", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Specialization</option>
                {specializationOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Areas of Expertise *</label>
              <div className="grid grid-cols-2 gap-2">
                {expertiseOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelect("expertise", opt)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.expertise.includes(opt)
                        ? "bg-purple-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 3: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Consultation Fee ($/hr) *</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. 50"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">Available Days *</label>
                <button 
                  type="button" 
                  onClick={() => {
                    const allSelected = formData.availability.days.length === dayOptions.length;
                    handleInputChange("availability.days", allSelected ? [] : [...dayOptions]);
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  {formData.availability.days.length === dayOptions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {dayOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelect("availability.days", opt)}
                    className={`px-4 py-2 text-sm rounded-full border-2 transition-all ${
                      formData.availability.days.includes(opt)
                        ? "bg-green-500 text-white border-green-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-sm font-semibold text-gray-700">Available Time Slots *</label>
                <button 
                  type="button" 
                  onClick={() => {
                    const allSelected = formData.availability.timeSlots.length === timeSlotOptions.length;
                    handleInputChange("availability.timeSlots", allSelected ? [] : [...timeSlotOptions]);
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  {formData.availability.timeSlots.length === timeSlotOptions.length ? "Deselect All" : "Select All"}
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {timeSlotOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelect("availability.timeSlots", opt)}
                    className={`p-2 text-xs rounded-lg border-2 transition-all ${
                      formData.availability.timeSlots.includes(opt)
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Languages *</label>
              <div className="flex flex-wrap gap-2">
                {languageOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => handleMultiSelect("languages", opt)}
                    className={`px-3 py-1 text-sm rounded-lg border-2 transition-all ${
                      formData.languages.includes(opt)
                        ? "bg-indigo-500 text-white border-indigo-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.fullName && formData.location && formData.phoneNumber
      case 1:
        return formData.experience && formData.qualifications.length > 0 && formData.bio
      case 2:
        return formData.specialization && formData.expertise.length > 0
      case 3:
        return formData.consultationFee && formData.availability.days.length > 0 && formData.availability.timeSlots.length > 0
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transform transition-all">
        {}
        <div className="p-8 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-purple-50 sticky top-0 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Counsellor Onboarding</h2>
              <p className="text-gray-600">Complete your profile to start helping students</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors p-2">
              ×
            </button>
          </div>

          {}
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4 relative">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 -translate-y-1/2 z-0"></div>
              {steps.map((step, index) => (
                <div key={index} className="relative z-10">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      index <= currentStep ? "bg-blue-600 text-white shadow-lg scale-110" : "bg-white text-gray-400 border-2 border-gray-200"
                    }`}
                  >
                    {index + 1}
                  </div>
                </div>
              ))}
              <div
                className="absolute top-1/2 left-0 h-1 bg-blue-600 -translate-y-1/2 transition-all duration-500 z-0"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              ></div>
            </div>
            <div className="text-center mt-6">
              <h3 className="text-xl font-bold text-gray-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-500">{steps[currentStep].subtitle}</p>
            </div>
          </div>
        </div>

        {}
        <div className="p-8 min-h-[400px]">{renderStepContent()}</div>

        {}
        <div className="p-8 border-t border-gray-100 bg-gray-50 flex justify-between sticky bottom-0">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 bg-white border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold"
          >
            Back
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || !isStepValid()}
              className="px-10 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Saving...
                </span>
              ) : (
                "Finish & Go to Dashboard"
              )}
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-bold shadow-md hover:shadow-lg"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CounsellorProfilePopup
