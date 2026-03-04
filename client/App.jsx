import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ErrorAnalysis from './pages/ErrorAnalysis';
import TraceViewer from './pages/TraceViewer';
import Settings from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/errors" element={<ErrorAnalysis />} />
        <Route path="/traces" element={<TraceViewer />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
