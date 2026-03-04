import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Layout from './components/Layout';

import ChildrenList from './pages/Children/index';
import NewChild from './pages/Children/NewChild';
import ChildDetail from './pages/Children/ChildDetail';

import GoalLibrary from './pages/Goals/GoalLibrary';

import PlansList from './pages/Plans/index';
import PlanBuilder from './pages/Plans/PlanBuilder';
import PlanDetail from './pages/Plans/PlanDetail';
import ProgramPlan from './pages/Plans/ProgramPlan';

import DataCollection from './pages/DataCollection/index';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="children" element={<ChildrenList />} />
            <Route path="children/new" element={<NewChild />} />
            <Route path="children/:id" element={<ChildDetail />} />

            <Route path="goals" element={<GoalLibrary />} />

            <Route path="plans" element={<PlansList />} />
            <Route path="plans/new" element={<PlanBuilder />} />
            <Route path="plans/:id" element={<PlanDetail />} />
            <Route path="plans/:planId/goals/:planGoalId/program" element={<ProgramPlan />} />

            <Route path="data-collection/:planId" element={<DataCollection />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
