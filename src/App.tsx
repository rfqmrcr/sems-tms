
import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { AuthProvider } from '@/contexts/AuthContext';
import { TrainerProvider } from '@/contexts/TrainerContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { ProtectedTrainerRoute } from '@/components/ProtectedTrainerRoute';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

// Lazy load pages for better performance
const Index = lazy(() => import('@/pages/Index'));
const Home = lazy(() => import('@/pages/Home'));
const About = lazy(() => import('@/pages/About'));
const Courses = lazy(() => import('@/pages/Courses'));
const Contact = lazy(() => import('@/pages/Contact'));
const FAQ = lazy(() => import('@/pages/FAQ'));
const Registration = lazy(() => import('@/pages/Registration'));
const DirectRegistration = lazy(() => import('@/pages/DirectRegistration'));
const CourseRegistration = lazy(() => import('@/pages/CourseRegistration'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const PaymentSuccess = lazy(() => import('@/pages/PaymentSuccess'));
const PaymentFailed = lazy(() => import('@/pages/PaymentFailed'));

// Admin Pages
const AdminLogin = lazy(() => import('@/pages/AdminLogin'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const AdminCourses = lazy(() => import('@/pages/AdminCourses'));
const AdminRegistrations = lazy(() => import('@/pages/AdminRegistrations'));
const AdminTrainees = lazy(() => import('@/pages/AdminTrainees'));
const AdminInvoices = lazy(() => import('@/pages/AdminInvoices'));
const AdminQuotations = lazy(() => import('@/pages/AdminQuotations'));
const AdminAttendance = lazy(() => import('@/pages/AdminAttendance'));
const AdminReports = lazy(() => import('@/pages/AdminReports'));
const AdminPartners = lazy(() => import('@/pages/AdminPartners'));
const AdminPromoCodes = lazy(() => import('@/pages/AdminPromoCodes'));
const AdminEmailLogs = lazy(() => import('@/pages/AdminEmailLogs'));
const AdminGuide = lazy(() => import('@/pages/AdminGuide'));

// Trainer Pages
const TrainerDashboard = lazy(() => import('@/pages/TrainerDashboard'));
const TrainerAttendance = lazy(() => import('@/pages/TrainerAttendance'));
const ChangePassword = lazy(() => import('@/pages/ChangePassword'));


import './App.css';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TrainerProvider>
          <Router>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                <Suspense fallback={
                  <div className="flex items-center justify-center min-h-screen">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                }>
                  <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/home" element={<Home />} />
                <Route path="/about" element={<About />} />
                <Route path="/courses" element={<Courses />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/registration" element={<Registration />} />
                <Route path="/register/:registrationUrl" element={<DirectRegistration />} />
                <Route path="/course/:courseUrl" element={<CourseRegistration />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-failed" element={<PaymentFailed />} />
                
                {/* Admin Routes */}
                <Route path="/admin" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                <Route path="/admin/courses" element={
                  <ProtectedRoute>
                    <AdminCourses />
                  </ProtectedRoute>
                } />
                <Route path="/admin/registrations" element={
                  <ProtectedRoute>
                    <AdminRegistrations />
                  </ProtectedRoute>
                } />
                <Route path="/admin/trainees" element={
                  <ProtectedRoute>
                    <AdminTrainees />
                  </ProtectedRoute>
                } />
                <Route path="/admin/invoices" element={
                  <ProtectedRoute>
                    <AdminInvoices />
                  </ProtectedRoute>
                } />
                <Route path="/admin/quotations" element={
                  <ProtectedRoute>
                    <AdminQuotations />
                  </ProtectedRoute>
                } />
                <Route path="/admin/attendance" element={
                  <ProtectedRoute>
                    <AdminAttendance />
                  </ProtectedRoute>
                } />
                <Route path="/admin/reports" element={
                  <ProtectedRoute>
                    <AdminReports />
                  </ProtectedRoute>
                } />
                <Route path="/admin/partners" element={
                  <ProtectedRoute>
                    <AdminPartners />
                  </ProtectedRoute>
                } />
                <Route path="/admin/promo-codes" element={
                  <ProtectedRoute>
                    <AdminPromoCodes />
                  </ProtectedRoute>
                } />
                <Route path="/admin/email-logs" element={
                  <ProtectedRoute>
                    <AdminEmailLogs />
                  </ProtectedRoute>
                } />
                <Route path="/admin/guide" element={
                  <ProtectedRoute>
                    <AdminGuide />
                  </ProtectedRoute>
                } />
                
                {/* Trainer Routes */}
                <Route path="/change-password" element={<ChangePassword />} />
                <Route path="/trainer/dashboard" element={
                  <ProtectedTrainerRoute>
                    <TrainerDashboard />
                  </ProtectedTrainerRoute>
                } />
                <Route path="/trainer/attendance" element={
                  <ProtectedTrainerRoute>
                    <TrainerAttendance />
                  </ProtectedTrainerRoute>
                } />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
                </Suspense>
            </main>
            <Footer />
          </div>
          <Toaster />
        </Router>
        </TrainerProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
