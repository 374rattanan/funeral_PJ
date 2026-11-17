import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import ImagePreviewModal from './components/ImagePreviewModal';

// Layouts
import CustomerLayout from './components/CustomerLayout';
import AdminLayout from './components/AdminLayout';
import DepartmentLayout from './components/DepartmentLayout';

// Customer Portal Pages
import HomePage from './pages/customer/HomePage';
import PackagesPage from './pages/customer/PackagesPage';
import PackageDetailPage from './pages/customer/PackageDetailPage';
import PortfolioPage from './pages/customer/PortfolioPage';
import BookingPage from './pages/customer/BookingPage';
import BookingSuccessPage from './pages/customer/BookingSuccessPage';
import CheckStatusPage from './pages/customer/CheckStatusPage';

// Admin Portal Pages
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCustomersPage from './pages/admin/AdminCustomersPage';
import AdminRequestDetailPage from './pages/admin/AdminRequestDetailPage';
import AdminPackagesPage from './pages/admin/AdminPackagesPage';
import AdminLocationsPage from './pages/admin/AdminLocationsPage';
import AdminStaffPage from './pages/admin/AdminStaffPage';
import AdminAssignmentsPage from './pages/admin/AdminAssignmentsPage';
import {
  AdminHistoryPage,
  AdminSchedulePage,
  AdminPaymentsPage,
  AdminReportsPage
} from './pages/admin/AdminSchedulePaymentsReports';

// Department Portal Pages
import {
  DepartmentDashboardPage,
  DepartmentAssignmentsPage,
  DepartmentHistoryPage
} from './pages/department/DepartmentPortalPages';

export default function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <BrowserRouter>
          <ImagePreviewModal />
          <Routes>
            {/* 1. ฝั่งลูกค้า (Customer Portal - Public) */}
            <Route path="/" element={<CustomerLayout />}>
              <Route index element={<HomePage />} />
              <Route path="packages" element={<PackagesPage />} />
              <Route path="packages/:id" element={<PackageDetailPage />} />
              <Route path="portfolio" element={<PortfolioPage />} />
              <Route path="booking" element={<BookingPage />} />
              <Route path="booking/success" element={<BookingSuccessPage />} />
              <Route path="check-status" element={<CheckStatusPage />} />
            </Route>

            {/* 2. ฝั่งแอดมิน (Admin Portal - /admin/*) */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="customers" element={<AdminCustomersPage />} />
              <Route path="requests/:id" element={<AdminRequestDetailPage />} />
              <Route path="packages" element={<AdminPackagesPage />} />
              <Route path="locations" element={<AdminLocationsPage />} />
              <Route path="staff" element={<AdminStaffPage />} />
              <Route path="assignments" element={<AdminAssignmentsPage />} />
              <Route path="assignments/:id" element={<AdminAssignmentsPage />} />
              <Route path="schedule" element={<AdminSchedulePage />} />
              <Route path="payments" element={<AdminPaymentsPage />} />
              <Route path="history" element={<AdminHistoryPage />} />
              <Route path="reports" element={<AdminReportsPage />} />
            </Route>

            {/* 3. ฝั่งแผนกปฏิบัติงาน (Department Portal - /department/*) */}
            <Route path="/department" element={<DepartmentLayout />}>
              <Route index element={<DepartmentDashboardPage />} />
              <Route path="assignments" element={<DepartmentAssignmentsPage />} />
              <Route path="history" element={<DepartmentHistoryPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </AuthProvider>
  );
}
