import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'

// Customer
import CustomerInsuranceList from './pages/customer/InsuranceList.jsx'
import RepairRequest from './pages/customer/RepairRequest.jsx'

// Repair Shop
import RepairShopDashboard from './pages/repairshop/Dashboard.jsx'
import LmsGuide from './pages/repairshop/LmsGuide.jsx'

// Admin
import AdminDashboard from './pages/admin/Dashboard.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      {/* 고객 */}
      <Route path="/customer/insurances" element={<CustomerInsuranceList />} />
      <Route path="/customer/repair-request" element={<RepairRequest />} />

      {/* 수리점 */}
      <Route path="/repairshop" element={<RepairShopDashboard />} />
      <Route path="/repairshop/lms" element={<LmsGuide />} />

      {/* 관리자 */}
      <Route path="/admin" element={<AdminDashboard />} />
    </Routes>
  )
}
