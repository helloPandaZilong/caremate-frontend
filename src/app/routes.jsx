import { createBrowserRouter } from "react-router";
import AppShell from "../components/AppShell";
import LandingPage from "../pages/LandingPage";
import DesignOverviewPage from "../pages/DesignOverviewPage";
import AuthPage from "../pages/AuthPage";
import FindShopPage from "../pages/FindShopPage";
import CustomerDashboard from "../pages/customer/DashboardPage";
import CustomerRequest from "../pages/customer/RequestPage";
import CustomerInsurance from "../pages/customer/InsurancePage";
import CustomerPayment from "../pages/customer/PaymentPage";
import CustomerProfile from "../pages/customer/ProfilePage";
import ShopDashboard from "../pages/repairshop/DashboardPage";
import ShopReport from "../pages/repairshop/ReportPage";
import ShopSettlement from "../pages/repairshop/SettlementPage";
import ShopLMS from "../pages/repairshop/LMSPage";
import ShopProfile from "../pages/repairshop/ProfilePage";
import AdminDashboard from "../pages/admin/DashboardPage";
import AdminPolicies from "../pages/admin/PoliciesPage";
import AdminSettlements from "../pages/admin/SettlementsPage";
import AdminAudit from "../pages/admin/AuditPage";
import AdminLMS from "../pages/admin/LMSManagePage";
import AdminProfile from "../pages/admin/ProfilePage";

export const router = createBrowserRouter([
  { path: "/", Component: LandingPage },
  { path: "/design", Component: DesignOverviewPage },
  { path: "/auth", Component: AuthPage },
  {
    Component: AppShell,
    children: [
      { path: "/find-shop", Component: FindShopPage },
      // Customer
      { path: "/customer/dashboard", Component: CustomerDashboard },
      { path: "/customer/request", Component: CustomerRequest },
      { path: "/customer/insurance", Component: CustomerInsurance },
      { path: "/customer/payment", Component: CustomerPayment },
      { path: "/customer/profile", Component: CustomerProfile },
      // Shop
      { path: "/shop/dashboard", Component: ShopDashboard },
      { path: "/shop/report", Component: ShopReport },
      { path: "/shop/settlement", Component: ShopSettlement },
      { path: "/shop/lms", Component: ShopLMS },
      { path: "/shop/profile", Component: ShopProfile },
      // Admin
      { path: "/admin/dashboard", Component: AdminDashboard },
      { path: "/admin/policies", Component: AdminPolicies },
      { path: "/admin/settlements", Component: AdminSettlements },
      { path: "/admin/audit", Component: AdminAudit },
      { path: "/admin/lms", Component: AdminLMS },
      { path: "/admin/profile", Component: AdminProfile },
    ],
  },
]);
