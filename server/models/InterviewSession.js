import mongoose from 'mongoose';


const messageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'ai'] 
  },
  text: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});


const interviewSessionSchema = new mongoose.Schema({
    user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User', 
  },
  role: {
    type: String,
    required: true
  },
  domain: {
    type: String,
    required: true
  },
  interviewMode: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    default: Date.now
  },

  history: [messageSchema] 
});

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);

export default InterviewSession;