import React, { useState } from 'react';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
const ProfileCompletionPopup = ({ user, onComplete, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const navigator = useNavigate();
  const [formData, setFormData] = useState({
    grade: '',
    stream: '',
    interests: [],
    strongSubjects: [],
    age: '',
    location: '',
    careerGoals: '',
    hobbies: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const steps = [
    { title: 'Academic Information', subtitle: 'Tell us about your current studies' },
    { title: 'Personal Details', subtitle: 'Basic information about you' },
    { title: 'Interests & Subjects', subtitle: 'What excites you the most?' },
    { title: 'Goals & Hobbies', subtitle: 'Your aspirations and activities' }
  ];

  const gradeOptions = ['10th', '11th', '12th', 'Graduate', 'Post Graduate'];
  const streamOptions = ['Science', 'Commerce', 'Arts', 'Engineering', 'Medical', 'Other'];
  const interestOptions = ['Technology', 'Medicine', 'Business', 'Arts', 'Sports', 'Music', 'Writing', 'Teaching', 'Research', 'Social Work'];
  const subjectOptions = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography', 'Economics', 'Computer Science', 'Psychology'];
  const hobbyOptions = ['Reading', 'Sports', 'Music', 'Dancing', 'Painting', 'Coding', 'Gaming', 'Traveling', 'Photography', 'Cooking'];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleMultiSelect = (field, option) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(option)
        ? prev[field].filter(item => item !== option)
        : [...prev[field], option]
    }));
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
     console.log("User in profile popup:", user);
     console.log("formdata", formData);

const response = await axios.patch(
    'https://career-counselling-nr04.onrender.com/api/users/completeProfile',
    {
        ...formData,
        profileCompleted: true,
    },
    {
        withCredentials: true,
        headers: {
            "Content-Type": "application/json",
        },
    }
);
      console.log(response);

   if (response.status === 200) {
        const profileData = response.data.data;
        onComplete(profileData);
        navigator('/student-dashboard'); 
      } else {
        console.log(formData);
        alert('Failed to save profile. Please try again.');
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Error saving profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Current Grade/Level *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {gradeOptions.map(grade => (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleInputChange('grade', grade)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.grade === grade
                        ? 'bg-blue-500 text-white border-blue-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Stream *
              </label>
              <div className="grid grid-cols-2 gap-3">
                {streamOptions.map(stream => (
                  <button
                    key={stream}
                    type="button"
                    onClick={() => handleInputChange('stream', stream)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.stream === stream
                        ? 'bg-green-500 text-white border-green-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    {stream}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 1: 
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Age *
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Enter your age"
                min="13"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Location *
              </label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="City, State (e.g., Mumbai, Maharashtra)"
              />
            </div>
          </div>
        );

      case 2: 
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                What are your interests? (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {interestOptions.map(interest => (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => handleMultiSelect('interests', interest)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.interests.includes(interest)
                        ? 'bg-purple-500 text-white border-purple-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    {interest}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                Which subjects are you strongest in? (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {subjectOptions.map(subject => (
                  <button
                    key={subject}
                    type="button"
                    onClick={() => handleMultiSelect('strongSubjects', subject)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.strongSubjects.includes(subject)
                        ? 'bg-orange-500 text-white border-orange-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3: 
        return (
          <div className="space-y-8">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                What are your career goals?
              </label>
              <textarea
                value={formData.careerGoals}
                onChange={(e) => handleInputChange('careerGoals', e.target.value)}
                className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="Describe your career aspirations, dream job, or what you want to achieve..."
                rows="4"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4">
                What are your hobbies? (Select multiple)
              </label>
              <div className="grid grid-cols-2 gap-3">
                {hobbyOptions.map(hobby => (
                  <button
                    key={hobby}
                    type="button"
                    onClick={() => handleMultiSelect('hobbies', hobby)}
                    className={`p-3 text-sm rounded-xl border-2 transition-all ${
                      formData.hobbies.includes(hobby)
                        ? 'bg-pink-500 text-white border-pink-500 shadow-lg'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    {hobby}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.grade && formData.stream;
      case 1:
        return formData.age && formData.location;
      case 2:
        return true; 
      case 3:
        return true; 
      default:
        return false;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {}
        <div className="p-8 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h2>
              <p className="text-gray-600">Help us personalize your career journey</p>
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
                      index <= currentStep
                        ? 'bg-blue-500 text-white shadow-lg'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {index + 1}
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded-full transition-all ${
                        index < currentStep ? 'bg-blue-500' : 'bg-gray-200'
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
        <div className="p-8">
          {renderStepContent()}
        </div>

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
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Saving Profile..." : "Complete Profile"}
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
  );
};

export default ProfileCompletionPopup;