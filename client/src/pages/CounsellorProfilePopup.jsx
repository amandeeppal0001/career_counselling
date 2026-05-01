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
      "https://careercounselling-production-725b.up.railway.app/api/users/complete-counsellor-profile",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    }
  } catch (error) {
    console.error("Error saving counsellor profile:", error);
    alert("Error saving profile. Please try again.");
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
                placeholder="City, State (e.g., Mumbai, Maharashtra)"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Phone Number *</label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="+91 9876543210"
              />
            </div>
          </div>
        )

      case 1: 
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Primary Specialization *</label>
              <div className="grid grid-cols-2 gap-3">
                {specializationOptions.map((spec) => (
                  <button
                    key={spec}
                    type="button"
                    onClick={() => handleInputChange("specialization", spec)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.specialization === spec
                        ? "bg-blue-500 text-white border-blue-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50"
                    }`}
                  >
                    {spec}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Years of Experience *</label>
              <input
                type="number"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter years of experience"
                min="0"
                max="50"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Qualifications (Select multiple)</label>
              <div className="grid grid-cols-2 gap-3">
                {qualificationOptions.map((qual) => (
                  <button
                    key={qual}
                    type="button"
                    onClick={() => handleMultiSelect("qualifications", qual)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.qualifications.includes(qual)
                        ? "bg-green-500 text-white border-green-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50"
                    }`}
                  >
                    {qual}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )

      case 2: 
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Areas of Expertise (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {expertiseOptions.map((expertise) => (
                  <button
                    key={expertise}
                    type="button"
                    onClick={() => handleMultiSelect("expertise", expertise)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.expertise.includes(expertise)
                        ? "bg-purple-500 text-white border-purple-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50"
                    }`}
                  >
                    {expertise}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Professional Bio *</label>
              <textarea
                value={formData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Tell students about your background, approach, and how you can help them..."
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Consultation Fee (per session) *</label>
              <input
                type="number"
                value={formData.consultationFee}
                onChange={(e) => handleInputChange("consultationFee", e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter fee in rupees"
                min="0"
              />
            </div>
          </div>
        )

      case 3: 
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">Available Days (Select multiple)</label>
              <div className="grid grid-cols-2 gap-3">
                {dayOptions.map((day) => (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleMultiSelect("availability.days", day)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.availability.days.includes(day)
                        ? "bg-orange-500 text-white border-orange-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50"
                    }`}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Available Time Slots (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {timeSlotOptions.map((slot) => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => handleMultiSelect("availability.timeSlots", slot)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.availability.timeSlots.includes(slot)
                        ? "bg-pink-500 text-white border-pink-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50"
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Languages Spoken (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {languageOptions.map((language) => (
                  <button
                    key={language}
                    type="button"
                    onClick={() => handleMultiSelect("languages", language)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.languages.includes(language)
                        ? "bg-teal-500 text-white border-teal-500 shadow-lg"
                        : "bg-white text-gray-700 border-gray-200 hover:border-teal-300 hover:bg-teal-50"
                    }`}
                  >
                    {language}
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
        return formData.specialization && formData.experience && formData.qualifications.length > 0
      case 2:
        return formData.expertise.length > 0 && formData.bio && formData.consultationFee
      case 3:
        return (
          formData.availability.days.length > 0 &&
          formData.availability.timeSlots.length > 0 &&
          formData.languages.length > 0
        )
      default:
        return false
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Counsellor Profile</h2>
              <p className="text-gray-600">Help students find the right guidance they need</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
            >
              ×
            </button>
          </div>

          {}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              {steps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                      index <= currentStep ? "bg-blue-500 text-white shadow-lg" : "bg-gray-200 text-gray-500"
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded-full transition-all ${
                        index < currentStep ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h3 className="text-lg font-semibold text-gray-900">{steps[currentStep].title}</h3>
              <p className="text-sm text-gray-600">{steps[currentStep].subtitle}</p>
            </div>
          </div>
        </div>

        {}
        <div className="p-8">{renderStepContent()}</div>

        {}
        <div className="p-8 border-t border-gray-200 bg-gray-50 flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 0}
            className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
          >
            Previous
          </button>

          {currentStep === steps.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={!isStepValid()}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Complete Profile
            </button>
          ) : (
            <button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-medium"
            >
              Next Step
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default CounsellorProfilePopup
