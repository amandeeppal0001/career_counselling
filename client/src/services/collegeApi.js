import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: import.meta.env.VITE_GEMINI_KEY, 
});

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

export const searchColleges = async (filters) => {
  try {
    const query = `
      List top colleges in India that mostly match these criteria (allow approximate matches if some filters cannot be fully satisfied):
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

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: query,
      temperature: 0.7,
      topP: 0.95,
      topK: 40,
      maxOutputTokens: 1500,
    });

    const textResponse = response.text || "";
    console.log("🔹 Gemini API response text:\n", textResponse);

    let parsedColleges = [];
    try {

      const jsonMatch = textResponse.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        parsedColleges = JSON.parse(jsonMatch[0]);
      } else {
        console.warn("⚠️ Gemini did not return a JSON array, using given data.");
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
