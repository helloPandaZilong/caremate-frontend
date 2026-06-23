import { useState } from "react";
import {
  Plus,
  X,
  Shield,
  ToggleLeft,
  ToggleRight,
  ChevronRight,
} from "lucide-react";
import { Button, Card, Badge } from "../../components/shared";

const POLICIES = [
  {
    id: 1,
    name: "Carrier Care",
    number: "CC-2024-9182-01",
    carrier: "SKT",
    coverage: 80,
    deductible: "30,000원",
    maxCap: "800,000원",
    status: true,
    expiry: "2025.01.15",
    terms:
      "본 보험은 스마트폰 파손, 침수, 분실에 대해 수리 비용의 80%를 보상합니다. 자기부담금은 30,000원이며, 연간 최대 보상 한도는 800,000원입니다. 가입 후 30일 이내 발생한 손해는 보상하지 않습니다. 고의적 파손, 전쟁, 천재지변으로 인한 손해는 면책 사항에 해당합니다.",
  },
  {
    id: 2,
    name: "프리미엄 카드 폰케어",
    number: "SH-CARD-7736-02",
    carrier: "신한카드",
    coverage: 60,
    deductible: "50,000원",
    maxCap: "500,000원",
    status: true,
    expiry: "2024.12.31",
    terms:
      "신한카드 프리미엄 카드 소지자 대상 부가 서비스입니다. 스마트폰 파손·침수 시 수리 비용의 60%를 보상하며, 자기부담금은 50,000원입니다. 연간 최대 2회, 500,000원 한도 내에서 보상됩니다.",
  },
  {
    id: 3,
    name: "디지털 안심보험",
    number: "SF-DIGIT-3341-03",
    carrier: "삼성화재",
    coverage: 90,
    deductible: "20,000원",
    maxCap: "1,200,000원",
    status: false,
    expiry: "2026.03.22",
    terms:
      "삼성화재 디지털 안심보험은 스마트폰을 포함한 디지털 기기 파손에 대해 최대 90%를 보상합니다. 자기부담금은 20,000원, 연간 한도는 1,200,000원입니다. 해외에서 발생한 손해도 보상됩니다.",
  },
];

function TermsModal({ policy, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <p className="text-sm font-semibold text-foreground">
              {policy.name}
            </p>
            <p className="text-xs text-muted-foreground">{policy.number}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="p-6 max-h-64 overflow-y-auto">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            약관 전문
          </h4>
          <p className="text-sm text-foreground leading-relaxed">
            {policy.terms}
          </p>
          <div className="mt-4 p-3 bg-secondary rounded-xl text-xs text-muted-foreground leading-relaxed">
            ※ 본 약관은 요약본입니다. 전체 약관은 각 보험사 홈페이지에서
            확인하실 수 있습니다.
          </div>
        </div>
        <div className="px-6 pb-5 flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            onClick={onClose}
          >
            닫기
          </Button>
          <Button variant="accent" size="sm" className="flex-1">
            전체 약관 다운로드
          </Button>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ policy, onToggle, onView }) {
  return (
    <Card
      onClick={onView}
      className="p-5 flex flex-col gap-4 cursor-pointer hover:border-accent/30 hover:shadow-md transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center shrink-0">
            <Shield className="w-4 h-4 text-accent" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              {policy.name}
            </p>
            <p className="text-xs text-muted-foreground">{policy.carrier}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="shrink-0"
        >
          {policy.status ? (
            <ToggleRight className="w-9 h-9 text-accent" />
          ) : (
            <ToggleLeft className="w-9 h-9 text-muted-foreground/40" />
          )}
        </button>
      </div>

      {/* Policy number */}
      <p className="text-xs text-muted-foreground font-mono">{policy.number}</p>

      {/* Coverage bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">보장 비율</span>
          <span className="font-semibold text-foreground">
            {policy.coverage}%
          </span>
        </div>
        <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-accent rounded-full transition-all"
            style={{ width: `${policy.coverage}%` }}
          />
        </div>
      </div>

      {/* Details */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">자기부담금</span>
          <span className="font-medium text-foreground">
            {policy.deductible}
          </span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-muted-foreground">최대 보상</span>
          <span className="font-medium text-foreground">{policy.maxCap}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-border/40">
        <Badge variant={policy.status ? "green" : "muted"}>
          {policy.status ? "활성화" : "비활성화"}
        </Badge>
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          약관 보기 <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </Card>
  );
}

export default function InsurancePage() {
  const [policies, setPolicies] = useState(POLICIES);
  const [modal, setModal] = useState(null);

  const toggle = (id) => {
    setPolicies((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: !p.status } : p)),
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            내 보험 관리
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            연동된 보험 정책을 한 곳에서 관리하세요.
          </p>
        </div>
        <Button variant="accent" size="sm">
          <Plus className="w-4 h-4" />
          보험 연동하기
        </Button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: "연동된 보험", value: `${policies.length}개` },
          {
            label: "활성화된 보험",
            value: `${policies.filter((p) => p.status).length}개`,
          },
          {
            label: "평균 보장 비율",
            value: `${Math.round(policies.filter((p) => p.status).reduce((a, p) => a + p.coverage, 0) / policies.filter((p) => p.status).length)}%`,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-card border border-border rounded-2xl px-5 py-4"
          >
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-semibold text-foreground mt-1">
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Policy grid */}
      <div className="grid md:grid-cols-3 gap-4">
        {policies.map((p) => (
          <PolicyCard
            key={p.id}
            policy={p}
            onToggle={() => toggle(p.id)}
            onView={() => setModal(p)}
          />
        ))}
      </div>

      {modal && <TermsModal policy={modal} onClose={() => setModal(null)} />}
    </div>
  );
}
