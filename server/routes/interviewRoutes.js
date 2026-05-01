import mongoose from "mongoose";
import express from 'express';
import verifyJWT from '../middleware/authMiddleware.js';
import InterviewSession from '../models/InterviewSession.js';
import main from '../index.js'
const router = express.Router();





router.use(verifyJWT);


router.post('/start', async (req, res) => {
    try {
        const { role, domain, interviewMode, location } = req.body;


        const userId = req.user._id; 

        const prompt = `You are an expert career counselor for students who have just completed their ${role} studies (e.g., 10th , 12th grade, or graduation  ), specializing in career guidance for the ${domain} field.
Your task is to present the user with a multiple-choice question to assess their interests, skills, or aptitude. The difficulty should be set to ${interviewMode}.

CRITICAL INSTRUCTIONS:
- Respond ONLY with a valid JSON object
- Do NOT use markdown formatting or code blocks
- Do NOT add any text before or after the JSON
- Do NOT use backticks or any other formatting

Your response must be exactly in this format:
{"question": "Your question here", "options": ["Option A", "Option B", "Option C", "Option D"]}

Example of correct format:
{"question": "What interests you most about technology?", "options": ["Creating websites and apps", "Analyzing data and solving problems", "Designing user interfaces", "Managing tech projects"]}`;

        const firstQuestionText = await main(prompt);


        let cleanedResponse = firstQuestionText.trim();


        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanedResponse.startsWith('```')) {
            cleanedResponse = cleanedResponse.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }


        let questionData;
        try {
            questionData = JSON.parse(cleanedResponse);
        } catch (parseError) {
            console.error('Failed to parse AI response as JSON:', cleanedResponse);
            throw new Error('AI response is not valid JSON format');
        }


        if (!questionData.question || !questionData.options || !Array.isArray(questionData.options)) {
            throw new Error('AI response does not have required question and options structure');
        }

        const newSession = new InterviewSession({
            user: userId,
            role,
            domain,
            interviewMode,
            location,
            history: [{ sender: 'ai', text: cleanedResponse }]
        });
        await newSession.save();
        console.log( "question=> "+questionData.question);
          console.log( "options=> "+questionData.options);

        res.json({ 
            question: questionData.question,
            options:questionData.options, 
            sessionId: newSession._id, 
            location: newSession.location
        });

    } catch (error) {
        console.error('Error in /api/interviews/start:', error);
        res.status(500).json({ error: error.message });
    }
});




































router.post('/evaluate', async (req, res) => {
  try {

     const { sessionId, userAnswer } = req.body;

     if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ error: 'Invalid sessionId format' });
    }
    const session = await InterviewSession.findById(sessionId);
    if (!session) {
        return res.status(404).json({ error: 'Interview session not found.' });
    }

     session.history.push({ sender: 'user', text: userAnswer });



    const historyText = session.history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');
    const prompt = `
  You are a career counselor continuing to assess a student based on their previous answers.
  The entire session history so far is:
  ---
  ${historyText}
  ---
  The student just answered the last question. Based on their last answer, generate a new multiple-choice question to further gauge their aptitude for the ${session.domain} field.

  You MUST provide your response as a valid JSON object with the following structure:
  {
    "question": "The new question to ask.",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "feedback": "A brief, constructive comment on the student's last choice."
  }

  Do not add any other text outside of the JSON object.
`;

    const responseText = await main(prompt);

    const cleanedJsonString = responseText.replace(/```json\n|```/g, '').trim();
    const result = JSON.parse(cleanedJsonString);

    session.history.push({ sender: 'ai', text: result.question });
    await session.save();
    res.json(result);




  } catch (error) {
    console.error('Error in /api/evaluate:', error);
    res.status(500).json({ error: 'Failed to parse AI response or internal server error.' });
  }
});




router.post('/summary', async (req, res) => {
    try {

          const { sessionId,location } = req.body;

        const session = await InterviewSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({ error: 'Interview session not found.' });
        }

         const historyText = session.history.map(msg => `${msg.sender}: ${msg.text}`).join('\n');


        const prompt = `
            You are an expert career coach providing a final career to choose based on mock interview.
            The candidate completed his  ${session.role} .
            Here is the complete transcript of the interview:
            ---
            ${historyText}
            ---
            Based on the entire transcript, generate a comprehensive final report for the candidate.
            The report should be encouraging and constructive.
            You MUST provide your response as a valid JSON object with the following structure:
            {
              "course names ": " suggest 3-5 course names for the specific choosed career based on candidate quiz and interest.",
              "career scope": provide career sc"opes for the specific choosed career.,
              "jobs in related career": "A paragraph highlighting the jobs which a candidate will get after persuing that career.",
              "suggestedColleges": "suggest best colleges around 5-7 near candidates location ${location} , give most preference to government colleges."
              "suggestedCollegesSelectionCriteria": "suggest selection criteria for the above suggested colleges. & make sure that never add "Always check the official website of each college for the most current and detailed admission criteria and application processes." or similar meaning sentences in the response. Note that if student selected that it completes 10th class & domain = software- development than you have to show both part like you also show that you can do 12th and after that b.tech and also show that you can do diploma or certifications."
            }

            Do not add any text outside of this JSON object.
        `;

        const responseText = await main(prompt);
        const cleanedJsonString = responseText.replace(/```json\n|```/g, '').trim();
        const summary = JSON.parse(cleanedJsonString);

        res.json(summary);

    } catch (error) {
        console.error('Error in /api/summary:', error);
        res.status(500).json({ error: 'Failed to generate summary report.' });
    }
});























































export default router;