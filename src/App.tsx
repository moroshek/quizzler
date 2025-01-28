import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Brain } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 to-purple-100">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <Brain className="h-12 w-12 text-indigo-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">History Quizzler</h1>
            <p className="text-lg text-gray-600">Challenge your historical knowledge!</p>
          </header>

          <Routes>
            <Route path="/" element={
              <div className="flex justify-center">
                <AuthForm />
              </div>
            } />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
