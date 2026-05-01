import main from "../index.js";
import mongoose from "mongoose";
import express from 'express';


import verifyJWT from '../middleware/authMiddleware.js';
const router = express.Router();

router.use(verifyJWT);




















router.post('/roadmap', async (req, res) => {
  try{
    const { formData } = req.body; 

    
    const prompt = `Generate a detailed career roadmap for a student with the following profile:
      Grade: ${formData.grade}
      Interests: ${formData.interests.join(", ")}
      Target Career: ${formData.targetCareer}
      Preferred Subjects: ${formData.preferredSubjects.join(", ")}
      
        give me response with less data  
      Please provide the entire response as a **strict JSON array of roadmap steps**. 
      Each step object in the array MUST have the following keys: id (string), title (string), description (string), timeline (string), courses (string[]), skills (string[]), and type (string, one of: foundation, education, skills, experience, career).
      DO NOT wrap the array in any additional objects like 'careerRoadmap' or 'roadmap'.
      ONLY return the JSON array.`;

      const firstQuestionText = await main(prompt);
      
      res.json({ 
        
        firstQuestionText
      });
 } catch (error) {
    console.error('Error in /api/college/roadmap:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/start', async (req, res) => {
    try {
      const filters = req.body;

const mockColleges = [
  {
    name: "Massachusetts Institute of Technology",
    location: "Cambridge, MA",
    coordinates: [-71.0942, 42.3601],
    ranking: 1,
    fees: 53790,
    students: 11520,
    rating: 4.8,
    type: "Private",
    programs: ["Engineering", "Computer Science", "Physics"],
    facilities: ["Research Labs", "Library", "Sports Complex"],
    hostels: "On-campus housing available",
    scholarships: "Need-based and merit scholarships available",
    notes: "Approximate match for demonstration",
  },
  {
    name: "Stanford University",
    location: "Stanford, CA",
    coordinates: [-122.1697, 37.4419],
    ranking: 2,
    fees: 56169,
    students: 17249,
    rating: 4.7,
    type: "Private",
    programs: ["Business", "Engineering", "Medicine"],
    facilities: ["Innovation Labs", "Medical Center", "Athletic Facilities"],
    hostels: "Guaranteed housing for undergraduates",
    scholarships: "Comprehensive financial aid program",
    notes: "Approximate match for demonstration",
  },
];

 const searchColleges = async (filters) => {
  try {
    const query = `
      List top colleges that mostly match these criteria (allow approximate matches if some filters cannot be fully satisfied):
      Location: ${filters.location || "Any"}
      College Type: ${filters.collegeType || "Any"}
      Courses: ${filters.courses || "Any"}
      Degree Level: ${filters.degreeLevel || "Any"}
      Budget: ${filters.budget || "Any"}
      Ranking: ${filters.ranking || "Any"}
      Exams Accepted: ${filters.examsAccepted || "Any"}

      Return a strict JSON array of colleges with this format:
      {
        "name": "",
        "location": "",
        "coordinates": [lng, lat],
        "ranking": "",
        "fees": "",
        "students": "",
        "rating": "",
        "type": "",
        "programs": [],
        "facilities": [],
        "hostels": "",
        "scholarships": "",
        "notes": "Indicate which filters were approximated"
      }
    `;

    console.log("🔹 Query being sent to Gemini 2.5 Flash:\n", query);


        const response = await main(query);

    const textResponse = response.text || "";
    console.log("🔹 Gemini API response text:\n", textResponse);

    let parsedColleges = [];
    try {

      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedColleges = JSON.parse(jsonMatch[0]);
      } else {
        console.warn("⚠️ Gemini did not return a JSON array, using mock data.");
        parsedColleges = mockColleges;
      }


      parsedColleges = parsedColleges.map((college) => ({
        ...college,
        notes: college.notes || "Approximate match or filters could not be fully satisfied",
      }));

      if (!Array.isArray(parsedColleges)) throw new Error("Parsed response is not an array");
    } catch (err) {
      console.warn("⚠️ Failed to parse Gemini JSON, using mock data.", err);
      parsedColleges = mockColleges;
    }

    return { colleges: parsedColleges, success: true };
  } catch (error) {
    console.error("❌ Error searching colleges:", error);
    return { colleges: mockColleges, success: false, error: error.message };
  }
};
 } catch (error) {
        console.error('Error in /api/interviews/start:', error);
        res.status(500).json({ error: error.message });
    }
});
export default router;