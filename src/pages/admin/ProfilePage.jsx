import { useState } from "react";
import { User, Lock, Settings2, CheckCircle2, Eye } from "lucide-react";
import { Card, Button, Input } from "../../components/shared";

export default function AdminProfilePage() {
  const [tab, setTab] = useState("profile");
  const [saved, setSaved] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const TABS = [
    { id: "profile", label: "관리자 정보", icon: User },
    { id: "security", label: "보안", icon: Lock },
    { id: "system", label: "시스템 설정", icon: Settings2 },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">마이페이지</h1>
        <p className="text-sm text-muted-foreground mt-1">
          관리자 계정 및 시스템 설정을 관리합니다.
        </p>
      </div>

      <Card className="p-6 flex items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700/50 flex items-center justify-center text-2xl font-bold text-red-600 dark:text-red-400 shrink-0">
          관
        </div>
        <div className="flex-1">
          <p className="text-base font-semibold text-foreground">
            Admin Master
          </p>
          <p className="text-sm text-muted-foreground">admin@caremate.kr</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-700/50 font-medium">
              ROLE_ADMIN
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-700/50 font-medium">
              활성
            </span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground">
          마지막 로그인: 2024.06.13 09:00
        </p>
      </Card>

      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${tab === t.id ? "border-accent text-accent" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              <Icon className="w-3.5 h-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <Card className="p-6 flex flex-col gap-5">
          <h3 className="text-sm font-semibold text-foreground">
            관리자 기본 정보
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Input label="관리자 이름" value="Admin Master" />
            <Input label="이메일" value="admin@caremate.kr" type="email" />
            <Input label="연락처" value="02-0000-0000" />
            <Input label="부서" value="플랫폼 운영팀" />
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-border">
            {saved ? (
              <span className="flex items-center gap-1.5 text-xs text-green-600 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5" />
                저장 완료
              </span>
            ) : (
              <div />
            )}
            <Button variant="accent" size="sm" onClick={handleSave}>
              저장
            </Button>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <div className="flex flex-col gap-4">
          <Card className="p-6 flex flex-col gap-5">
            <h3 className="text-sm font-semibold text-foreground">
              비밀번호 변경
            </h3>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  현재 비밀번호
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    className="w-full px-3.5 py-2.5 pr-10 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all"
                  />
                  <button
                    onClick={() => setShowPw((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Input label="새 비밀번호" type="password" />
              <Input label="새 비밀번호 확인" type="password" />
            </div>
            <Button
              variant="accent"
              size="sm"
              className="self-end"
              onClick={handleSave}
            >
              비밀번호 변경
            </Button>
          </Card>

          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">접속 이력</h3>
            <div className="flex flex-col divide-y divide-border text-xs">
              {[
                {
                  time: "2024.06.13 09:00",
                  ip: "211.49.xxx.xxx",
                  device: "Chrome / macOS",
                },
                {
                  time: "2024.06.12 18:30",
                  ip: "211.49.xxx.xxx",
                  device: "Chrome / macOS",
                },
                {
                  time: "2024.06.11 10:15",
                  ip: "175.213.xxx.xxx",
                  device: "Safari / iPhone",
                },
              ].map((l) => (
                <div key={l.time} className="py-2.5 flex justify-between">
                  <span className="text-muted-foreground font-mono">
                    {l.time}
                  </span>
                  <span className="text-muted-foreground">{l.ip}</span>
                  <span className="text-foreground">{l.device}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {tab === "system" && (
        <div className="flex flex-col gap-4">
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">배치 설정</h3>
            <div className="flex flex-col gap-3 text-sm">
              {[
                {
                  label: "월말 정산 배치 실행 시각",
                  value: "매월 말일 자정 (00:00 KST)",
                },
                { label: "플랫폼 수수료율", value: "10%" },
                { label: "수수료 납부 기한", value: "익월 5일" },
                { label: "배치 실패 시 알림 대상", value: "admin@caremate.kr" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex justify-between items-center py-2.5 border-b border-border last:border-0"
                >
                  <span className="text-muted-foreground">{s.label}</span>
                  <span className="font-medium text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card className="p-6 flex flex-col gap-4">
            <h3 className="text-sm font-semibold text-foreground">
              운영 파라미터
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <Input label="Access Token TTL (분)" value="30" type="number" />
              <Input label="Refresh Token TTL (일)" value="14" type="number" />
              <Input label="DLQ 재시도 횟수" value="3" type="number" />
              <Input label="노쇼 판정 유예 (시간)" value="2" type="number" />
            </div>
            <Button
              variant="accent"
              size="sm"
              className="self-end"
              onClick={handleSave}
            >
              설정 저장
            </Button>
          </Card>
        </div>
      )}
    </div>
  );
}
