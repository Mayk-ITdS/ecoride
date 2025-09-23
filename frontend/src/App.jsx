import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Covoiturages from './pages/Covoiturages'
import VueDetaille from './components/Covoiturages/VueDetaille'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Acceuil from './pages/Acceuil'
import Contact from './pages/Contact'
import Forbidden from './pages/Forbidden'
import MentionsLegales from './pages/MentionsLegales'
import AdminDashboard from './pages/AdminDashboard'
import EmployeeDashboard from './pages/EmployeeDashboard'
import AdminIncidents from './components/AdminDashboard/AdminIncidents'
import AdminEmployees from './components/AdminDashboard/AdminEmployee'
import AdminLayout from './components/AdminDashboard/AdminLayout'
import AdminReviews from './components/AdminDashboard/AdminReviews'
import RequireRole from './components/AdminDashboard/RequireRole'

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/admin"
          element={
            <RequireRole roles={['admin']}>
              <AdminLayout />
            </RequireRole>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="employes" element={<AdminEmployees />} />
          <Route path="reviews" element={<AdminReviews />} />
          <Route path="incidents" element={<AdminIncidents />} />
        </Route>

        <Route path="/" element={<Acceuil />} />
        <Route path="/covoiturages" element={<Covoiturages />} />
        <Route path="/covoiturage/:id" element={<VueDetaille />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/403" element={<Forbidden />} />
        <Route path="/register" element={<Register />} />
        <Route path="/employee" element={<EmployeeDashboard />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/mentions-legales" element={<MentionsLegales />} />
      </Routes>
    </Router>
  )
}

export default App
