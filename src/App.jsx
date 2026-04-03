import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'
import './worker.css'
import './customer.css'
import './admin.css'
import './additions.css'
import './phase8.css'
import './phase9.css'
import './phase10.css'
import './auth-additions.css'


import LandingPage      from './pages/LandingPage'
import Login            from './pages/auth/Login'
import Register         from './pages/auth/Register'
import ProtectedRoute   from './components/ProtectedRoute'
import useAuthStore     from './store/authStore'

// Worker
import WorkerDashboard from './pages/worker/WorkerDashboard'
import WorkerRequests  from './pages/worker/WorkerRequests'
import WorkerActiveJob from './pages/worker/WorkerActiveJob'
import WorkerHistory   from './pages/worker/WorkerHistory'
import WorkerProfile   from './pages/worker/WorkerProfile'
import WorkerEarnings  from './pages/worker/WorkerEarnings'

// Customer
import CustomerDashboard    from './pages/customer/CustomerDashboard'
import CustomerSearch       from './pages/customer/CustomerSearch'
import WorkerProfilePage    from './pages/customer/WorkerProfilePage'
import SendRequest          from './pages/customer/SendRequest'
import CustomerRequests     from './pages/customer/CustomerRequests'
import CustomerActiveJob    from './pages/customer/CustomerActiveJob'
import CustomerProfile      from './pages/customer/CustomerProfile'
import CustomerOrderHistory from './pages/customer/CustomerOrderHistory'
import PaymentPage          from './pages/customer/PaymentPage'

// Admin
import AdminOverview    from './pages/admin/AdminOverview'
import AdminAnalytics   from './pages/admin/AdminAnalytics'
import AdminWorkers     from './pages/admin/AdminWorkers'
import AdminCustomers   from './pages/admin/AdminCustomers'
import AdminJobs        from './pages/admin/AdminJobs'
import AdminDisputes    from './pages/admin/AdminDisputes'
import AdminSettings    from './pages/admin/AdminSettings'
import AdminWithdrawals from './pages/admin/AdminWithdrawals'

const W  = ({ children }) => <ProtectedRoute allowedRoles={['WORKER']}>{children}</ProtectedRoute>
const Cu = ({ children }) => <ProtectedRoute allowedRoles={['CUSTOMER']}>{children}</ProtectedRoute>
const Ad = ({ children }) => <ProtectedRoute allowedRoles={['ADMIN']}>{children}</ProtectedRoute>

export default function App() {
  const { isAuthenticated, user } = useAuthStore()

  const dashRedirect = isAuthenticated
    ? user?.role === 'WORKER'  ? '/worker/dashboard'
    : user?.role === 'ADMIN'   ? '/admin'
    : '/customer/home'
    : null

  return (
    <BrowserRouter>
      <Routes>
        {/* Public landing page */}
        <Route path="/" element={
          isAuthenticated ? <Navigate to={dashRedirect} /> : <LandingPage />
        } />

        {/* Auth */}
        <Route path="/login"    element={isAuthenticated ? <Navigate to={dashRedirect} /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={dashRedirect} /> : <Register />} />

        {/* Worker */}
        <Route path="/worker/dashboard" element={<W><WorkerDashboard /></W>} />
        <Route path="/worker/requests"  element={<W><WorkerRequests /></W>} />
        <Route path="/worker/active"    element={<W><WorkerActiveJob /></W>} />
        <Route path="/worker/history"   element={<W><WorkerHistory /></W>} />
        <Route path="/worker/profile"   element={<W><WorkerProfile /></W>} />
        <Route path="/worker/earnings"  element={<W><WorkerEarnings /></W>} />

        {/* Customer */}
        <Route path="/customer/home"           element={<Cu><CustomerDashboard /></Cu>} />
        <Route path="/customer/search"         element={<Cu><CustomerSearch /></Cu>} />
        <Route path="/customer/worker/:id"     element={<Cu><WorkerProfilePage /></Cu>} />
        <Route path="/customer/request/:id"    element={<Cu><SendRequest /></Cu>} />
        <Route path="/customer/requests"       element={<Cu><CustomerRequests /></Cu>} />
        <Route path="/customer/active"         element={<Cu><CustomerActiveJob /></Cu>} />
        <Route path="/customer/profile"        element={<Cu><CustomerProfile /></Cu>} />
        <Route path="/customer/orders"         element={<Cu><CustomerOrderHistory /></Cu>} />
        <Route path="/customer/payment/:jobId" element={<Cu><PaymentPage /></Cu>} />

        {/* Admin */}
        <Route path="/admin"             element={<Ad><AdminOverview /></Ad>} />
        <Route path="/admin/analytics"   element={<Ad><AdminAnalytics /></Ad>} />
        <Route path="/admin/workers"     element={<Ad><AdminWorkers /></Ad>} />
        <Route path="/admin/customers"   element={<Ad><AdminCustomers /></Ad>} />
        <Route path="/admin/jobs"        element={<Ad><AdminJobs /></Ad>} />
        <Route path="/admin/withdrawals" element={<Ad><AdminWithdrawals /></Ad>} />
        <Route path="/admin/disputes"    element={<Ad><AdminDisputes /></Ad>} />
        <Route path="/admin/settings"    element={<Ad><AdminSettings /></Ad>} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}