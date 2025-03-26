import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import AuthGuard from './components/AuthGuard';
import Login from './pages/Login';
import Hubs from './pages/Hubs';
import Dashboard from './pages/Dashboard';
import GetStarted from './pages/GetStarted';
import Goals from './pages/Goals';
import Contracts from './pages/Contracts';
import ImpactMaps from './pages/ImpactMaps';
import Workflows from './pages/Workflows';
import Solutions from './pages/Solutions';
import Stakeholders from './pages/Stakeholders';
import Analytics from './pages/Analytics';
import AuditLog from './pages/AuditLog';
import Settings from './pages/Settings';

export default function App() {
  return (
    <Router>
      <AuthGuard>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="*" element={
            <Layout>
              <Routes>
                <Route path="/hubs" element={<Hubs />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/get-started" element={<GetStarted />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/maps" element={<ImpactMaps />} />
                <Route path="/workflows" element={<Workflows />} />
                <Route path="/solutions" element={<Solutions />} />
                <Route path="/stakeholders" element={<Stakeholders />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/audit-log" element={<AuditLog />} />
                <Route path="/settings" element={<Settings />} />
              </Routes>
            </Layout>
          } />
        </Routes>
      </AuthGuard>
    </Router>
  )
}
