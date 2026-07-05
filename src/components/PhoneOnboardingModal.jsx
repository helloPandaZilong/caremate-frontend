import { useState } from "react";
import { toast } from "sonner";
import { Phone, Loader2, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { updateProfile } from "../api/customerService";

// 백엔드 CustomerProfileUpdateRequest.phoneNumber 검증과 동일한 규칙
// 000-0000-0000 형식(3자리-4자리-4자리, 하이픈 필수)만 허용
const PHONE_REGEX = /^\d{3}-\d{4}-\d{4}$/;

/**
 * 소셜(구글) 가입자 전화번호 온보딩 모달.
 *
 * Google OAuth2는 전화번호를 제공하지 않아 소셜 가입자의 members.phone이 빈 값이다.
 * 최초 로그인 후 대시보드 진입 시 AppShell이 이 모달을 필수(닫기 불가)로 띄워
 * 전화번호를 입력받아 저장한다. A/S 접수·수리점 연락·결제 안내에 전화번호가 필요하기 때문.
 *
 * @param {() => void} onLogout 갇힘 방지용 — 입력을 원치 않는 사용자의 로그아웃 처리
 */
export default function PhoneOnboardingModal({ onLogout }) {
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const trimmed = phone.trim();
    if (!PHONE_REGEX.test(trimmed)) {
      toast.error("전화번호 형식이 올바르지 않습니다. (예: 010-1234-5678)");
      return;
    }
    setSaving(true);
    try {
      // name은 필수 필드이므로 기존 이름을 그대로 전송
      await updateProfile({ name: user?.name ?? "", phoneNumber: trimmed });
      updateUser({ phoneNumber: trimmed });
      toast.success("전화번호가 저장되었습니다.");
    } catch {
      toast.error("저장에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !saving) handleSubmit();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        {/* 아이콘 */}
        <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <Phone className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>

        {/* 안내 문구 */}
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-foreground">
            전화번호를 입력해주세요
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Google 계정에는 전화번호가 없어 <strong className="text-foreground">{user?.name}</strong>님의
            연락처가 비어 있습니다. A/S 접수·수리점 연락·결제 안내에 사용되니
            서비스 이용 전 한 번만 입력해주세요.
          </p>
        </div>

        {/* 입력 필드 */}
        <div className="flex flex-col gap-1.5">
          <label htmlFor="onboarding-phone" className="text-xs font-medium text-muted-foreground">
            전화번호
          </label>
          <input
            id="onboarding-phone"
            type="tel"
            autoFocus
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="010-1234-5678"
            maxLength={13}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/40 focus:border-accent transition-all"
          />
        </div>

        {/* 저장 버튼 */}
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm transition-all shadow-lg shadow-amber-500/25 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              저장 중...
            </>
          ) : (
            "저장하고 시작하기"
          )}
        </button>

        {/* 갇힘 방지용 로그아웃 — 입력을 원치 않으면 로그아웃 */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>입력을 원치 않으시면</span>
          <button
            onClick={onLogout}
            className="text-accent hover:underline font-medium"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
