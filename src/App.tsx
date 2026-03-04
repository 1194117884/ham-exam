// src/App.tsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { HamExamProvider } from "./contexts/HamExamContext";
import Navbar from "./components/layout/Navbar";
import Home from "./components/Home";
import Practice from "./components/Practice";
import Exam from "./components/Exam";
import WrongBook from "./components/WrongBook";

const AppContent = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="container mx-auto py-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/wrong-book" element={<WrongBook />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <HamExamProvider>
      <Router>
        <AppContent />
      </Router>
    </HamExamProvider>
  );
};

export default App;
