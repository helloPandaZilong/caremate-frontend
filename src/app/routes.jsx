import { createBrowserRouter,Navigate } from "react-router";
import AppShell from "../components/AppShell";
import ProtectedRoute from "../components/ProtectedRoute";
import LandingPage from "../pages/LandingPage";
import AuthPage from "../pages/AuthPage";
import OAuthCallbackPage from "../pages/OAuthCallbackPage"; // Google OAuth2 콜백 처리
import NotificationPage from "../pages/NotificationPage";

// 수리 고객용 import
import CustomerDashboard from "../pages/customer/DashboardPage";
import CustomerRequest   from "../pages/customer/RequestPage";
import CustomerInsurance from "../pages/customer/InsurancePage";
import CustomerPayment   from "../pages/customer/PaymentPage";
import CustomerProfile   from "../pages/customer/ProfilePage";
import CustomerFindShop  from "../pages/customer/FindShopPage";

// 수리점용 import
import ShopDashboard  from "../pages/repairshop/DashboardPage";
import ShopReport     from "../pages/repairshop/ReportPage";
import ShopOrderList  from "../pages/repairshop/OrderList";
import ShopOrderDetail from "../pages/repairshop/OrderDetail";
import ShopSettlement from "../pages/repairshop/SettlementPage";
import ShopLMS        from "../pages/repairshop/LMSPage";
import ShopProfile    from "../pages/repairshop/ProfilePage";

// 관리자용 import
import AdminDashboard      from "../pages/admin/DashboardPage";
import AdminPolicies       from "../pages/admin/PoliciesPage";
import AdminSettlements    from "../pages/admin/SettlementsPage";
import AdminAudit          from "../pages/admin/AuditPage";
import AdminLMS            from "../pages/admin/LMSManagePage";
import AdminProfile        from "../pages/admin/ProfilePage";
import AdminShopApprovals  from "../pages/admin/ShopApprovalsPage"; // 수리점 가입 승인 관리
import AdminMembers        from "../pages/admin/MembersPage";        // 회원 차단/해제 관리

export const router = createBrowserRouter([
  // 공개 라우트 — 인증 불필요
  { path: "/",              Component: LandingPage       },
  { path: "/auth",          Component: AuthPage          },
  // Google OAuth2 콜백 — Google이 code와 state를 붙여 리다이렉트하는 URL
  // Google Cloud Console의 "승인된 리다이렉트 URI"에 등록 필요:
  //   개발: http://localhost:3000/auth/callback
  //   운영: https://your-domain.com/auth/callback
  { path: "/auth/callback", Component: OAuthCallbackPage },

  // 보호 라우트 — 미로그인 접근 시 /auth 로 리다이렉트
  {
    element: (
      <ProtectedRoute>
        <AppShell />
      </ProtectedRoute>
    ),
    children: [

      // 수리 고객
      { path: "/customer/dashboard",  Component: CustomerDashboard }, // 메인 대시보드
      { path: "/customer/request",    Component: CustomerRequest   }, // A/S 접수
      { path: "/customer/insurance",  Component: CustomerInsurance }, // 보험 관리
      { path: "/customer/payment/:orderId", Component: CustomerPayment   }, // 결제·청구
      { path: "/customer/find-shop",  Component: CustomerFindShop  }, // 서비스 센터 찾기
      { path: "/customer/profile",    Component: CustomerProfile   }, // 프로필
      { path: "/customer/repair-orders/status", element: <Navigate to="/customer/dashboard" replace /> },
      { path: "/customer/repair-orders/:orderId/status", element: <Navigate to="/customer/dashboard" replace /> },

      // 역할 공통
      { path: "/notifications", Component: NotificationPage },

      // 수리점
      { path: "/shop/dashboard",    Component: ShopDashboard   }, // 메인 대시보드
      { path: "/shop/orders",       Component: ShopOrderList   }, // 주문 접수 목록
      { path: "/shop/orders/:id",   Component: ShopOrderDetail }, // 주문 상세
      { path: "/shop/report",       Component: ShopReport      }, // 수리 리포트 목록
      { path: "/shop/settlement",   Component: ShopSettlement  }, // 월말 정산
      { path: "/shop/lms",          Component: ShopLMS         }, // LMS 교육
      { path: "/shop/profile",      Component: ShopProfile     }, // 수리점 프로필

      // 관리자
      { path: "/admin/dashboard",      Component: AdminDashboard     }, // 통합 대시보드
      { path: "/admin/policies",       Component: AdminPolicies      }, // 보험 약관 관리
      { path: "/admin/settlements",    Component: AdminSettlements   }, // 수수료 청구 관리
      { path: "/admin/audit",          Component: AdminAudit         }, // 감사·DLQ
      { path: "/admin/lms",            Component: AdminLMS           }, // LMS 관리
      { path: "/admin/profile",        Component: AdminProfile       }, // 관리자 프로필
      { path: "/admin/shop-approvals", Component: AdminShopApprovals }, // 수리점 가입 승인 관리
      { path: "/admin/members",        Component: AdminMembers        }, // 회원 차단/해제 관리
    ],
  },
]);
