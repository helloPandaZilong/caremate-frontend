import { RouterProvider } from "react-router";
import { Toaster } from "sonner";
import { router } from "./app/routes";
import { AuthProvider } from "./contexts/AuthContext";

export default function App() {
  return (
    // AuthProvider를 RouterProvider 바깥에 배치해 모든 라우트에서 useAuth() 사용 가능
    <AuthProvider>
      <RouterProvider router={router} />
      {/* 전역 토스트 알림 — API 응답 성공/오류 메시지 표시 */}
      <Toaster richColors position="top-center" duration={3000} />
    </AuthProvider>
  );
}
