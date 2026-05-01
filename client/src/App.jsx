

import { Routes, Route } from "react-router-dom";
import { useState } from "react";
import Landing from "./pages/Landing";
import StudentDashboard from "./pages/StudentDashboard";
import CounsellorDashboard from "./pages/CounsellorDashboard";
import ParentDashboard from "./pages/ParentDashboard";
import ExploreColleges from "./pages/ExploreColleges";
import CareerRoadmapPage from "./pages/CareerRoadmapPage";
import Room from "./pages/Room/Room";
import Select from "./pages/Select/Select";
import Summary from "./pages/Summary/Summary";
import ConsultCounsellor from "./pages/ConsultCounsellor";
import BookAppointment from "./pages/BookApointment";
import VideoCall from "./pages/VideoCall";
import Message from "./pages/Message";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Routes>
      <Route path="/" element={<Landing setUser={setUser} />} />
      <Route path="/student-dashboard" element={<StudentDashboard user={user} />} />
      <Route path="/counselor-dashboard" element={<CounsellorDashboard user={user} />} />
      <Route path="/parent-dashboard" element={<ParentDashboard user={user} />} />
      <Route path="/explore-colleges" element={<ExploreColleges user={user} />} />
      <Route path="/explore-colleges" element={<ExploreColleges user={user} />} />
      <Route path="/career-roadmap" element={<CareerRoadmapPage />} />
            <Route path="/interview" element={<Room />} />
        <Route path="/select" element={<Select />} />
                <Route path="/summary" element={<Summary/>} />
<Route path="/consult-counsellor" element={<ConsultCounsellor user={user} />} />
<Route path="/book-appointment/:counsellorId" element={<BookAppointment user={user} />} />
<Route path="/video-call/:roomId" element={<VideoCall />} />
<Route path="/message/:id" element={<Message user={user} />} />

    </Routes>
  );
}

export default App;

