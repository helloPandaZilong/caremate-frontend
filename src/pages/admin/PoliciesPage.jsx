import { useState } from "react";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronDown,
  Upload,
} from "lucide-react";
import { Button, Card, Input } from "../../components/shared";

const CARRIERS = [
  "전체",
  "KB손해보험",
  "삼성화재",
  "메리츠화재",
  "현대해상",
  "DB손해보험",
];

const POLICIES = [
  {
    id: "POL-001",
    carrier: "KB손해보험",
    name: "KB스마트폰케어 Standard",
    category: "파손",
    rate: 80,
    maxCap: 800000,
    modified: "2024.05.20",
  },
  {
    id: "POL-002",
    carrier: "삼성화재",
    name: "삼성 디지털 안심보험 Pro",
    category: "파손·침수",
    rate: 90,
    maxCap: 1200000,
    modified: "2024.04.15",
  },
  {
    id: "POL-003",
    carrier: "메리츠화재",
    name: "메리츠 폰클럽 기본형",
    category: "파손",
    rate: 70,
    maxCap: 600000,
    modified: "2024.06.01",
  },
  {
    id: "POL-004",
    carrier: "현대해상",
    name: "하이카 모바일 프로텍트",
    category: "분실",
    rate: 60,
    maxCap: 500000,
    modified: "2024.03.30",
  },
  {
    id: "POL-005",
    carrier: "DB손해보험",
    name: "다이렉트 스마트케어",
    category: "파손·침수",
    rate: 85,
    maxCap: 1000000,
    modified: "2024.06.10",
  },
  {
    id: "POL-006",
    carrier: "KB손해보험",
    name: "KB스마트폰케어 Premium",
    category: "전체",
    rate: 95,
    maxCap: 1500000,
    modified: "2024.05.22",
  },
];

// ── New Template Modal ────────────────────────────────────────────────────────

function NewTemplateModal({ onClose }) {
  const [rate, setRate] = useState("80");
  const [dragging, setDragging] = useState(false);
  const [fileUploaded, setFileUploaded] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <p className="text-base font-semibold text-foreground">
              새 약관 템플릿 추가
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              보험 마스터 약관 파라미터를 설정합니다.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Basic info */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              기본 정보
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  보험사
                </label>
                <div className="relative">
                  <select className="w-full appearance-none px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all">
                    {[
                      "KB손해보험",
                      "삼성화재",
                      "메리츠화재",
                      "현대해상",
                      "DB손해보험",
                    ].map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  보장 카테고리
                </label>
                <div className="relative">
                  <select className="w-full appearance-none px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all">
                    {["파손", "침수", "분실", "파손·침수", "전체"].map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                </div>
              </div>
              <div className="col-span-2">
                <Input
                  label="약관명"
                  placeholder="예: KB스마트폰케어 Premium"
                />
              </div>
              <Input label="상품 ID (자동 생성 가능)" placeholder="POL-XXX" />
              <Input
                label="정책 번호 (Policy Number)"
                placeholder="KB-CARE-2024-001"
              />
            </div>
          </div>

          {/* Algorithm params */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              알고리즘 파라미터
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  보상 비율 (%)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={rate}
                    onChange={(e) => setRate(e.target.value)}
                    className="flex-1 accent-accent"
                  />

                  <span className="text-sm font-bold text-foreground w-10 text-right">
                    {rate}%
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  최대 보상 한도 (원)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="800,000"
                    className="w-full px-3.5 py-2.5 pr-8 text-sm bg-secondary border border-border rounded-xl text-right text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    원
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  자기부담금 (원)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="30,000"
                    className="w-full px-3.5 py-2.5 pr-8 text-sm bg-secondary border border-border rounded-xl text-right text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
                  />

                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                    원
                  </span>
                </div>
              </div>
              <Input
                label="연간 청구 횟수 한도"
                placeholder="2"
                type="number"
              />
              <div className="col-span-2">
                <Input
                  label="자기부담금 계산 방식"
                  placeholder="예: (수리비 - 자기부담금) × 보상율"
                />
              </div>
            </div>
          </div>

          {/* Terms */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              약관 내용
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  약관 요약문
                </label>
                <textarea
                  placeholder="보험 적용 범위, 보상 조건, 제외 사항 등을 요약하여 입력하세요."
                  rows={4}
                  className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  면책 사항
                </label>
                <textarea
                  placeholder="예: 고의적 파손, 천재지변, 전쟁·폭동, 가입 후 30일 이내 사고는 보상하지 않습니다."
                  rows={2}
                  className="w-full px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
                />
              </div>
            </div>
          </div>

          {/* File upload */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              약관 파일 첨부
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragging(false);
                setFileUploaded(true);
              }}
              onClick={() => setFileUploaded(true)}
              className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center gap-3 text-center cursor-pointer transition-all ${
                fileUploaded
                  ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                  : dragging
                    ? "border-accent bg-accent/5"
                    : "border-border hover:border-accent/40 hover:bg-accent/5"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${fileUploaded ? "bg-green-100 dark:bg-green-800/50" : "bg-secondary"}`}
              >
                <Upload
                  className={`w-5 h-5 ${fileUploaded ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}`}
                />
              </div>
              {fileUploaded ? (
                <>
                  <p className="text-sm font-medium text-green-700 dark:text-green-400">
                    약관_템플릿_KB_2024.pdf 업로드 완료
                  </p>
                  <p className="text-xs text-green-500 dark:text-green-500">
                    클릭하여 다른 파일로 교체
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">
                    약관 PDF 파일을 드래그하거나 클릭하여 업로드
                  </p>
                  <p className="text-xs text-muted-foreground">
                    PDF · 최대 20MB
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-3 justify-end">
          <Button variant="secondary" size="md" onClick={onClose}>
            취소
          </Button>
          <Button variant="accent" size="md" onClick={onClose}>
            <Plus className="w-4 h-4" />
            약관 템플릿 등록
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Drawer ───────────────────────────────────────────────────────────────

function EditDrawer({ policy, onClose }) {
  const [rate, setRate] = useState(policy.rate.toString());
  const [cap, setCap] = useState(policy.maxCap.toLocaleString("ko-KR"));
  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" onClick={onClose} />
      <aside className="fixed right-0 top-0 h-full w-96 bg-card border-l border-border shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="text-sm font-semibold text-foreground">약관 편집</p>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary"
          >
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
        <div className="flex-1 p-5 flex flex-col gap-5 overflow-y-auto">
          <div className="bg-secondary rounded-xl p-4 flex flex-col gap-1">
            <p className="text-xs font-mono text-muted-foreground">
              {policy.id}
            </p>
            <p className="text-sm font-semibold text-foreground">
              {policy.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {policy.carrier} · {policy.category}
            </p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              보상 비율 (%)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={100}
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                className="flex-1 accent-accent"
              />

              <span className="text-sm font-bold text-foreground w-10 text-right">
                {rate}%
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              최대 보상 한도 (원)
            </label>
            <div className="relative">
              <input
                value={cap}
                onChange={(e) => setCap(e.target.value)}
                className="w-full px-3.5 py-2.5 pr-8 text-sm bg-secondary border border-border rounded-xl text-right text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
              />

              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                원
              </span>
            </div>
          </div>

          <Input
            label="자기부담금 계산 방식"
            placeholder="예: (수리비 - 30000) × 보상율"
          />
          <Input label="연간 청구 횟수 한도" placeholder="2" type="number" />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              면책 사항
            </label>
            <textarea
              placeholder="고의 파손, 천재지변 제외..."
              rows={3}
              className="px-3.5 py-2.5 text-sm bg-secondary border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 resize-none transition-all"
            />
          </div>
        </div>
        <div className="p-5 border-t border-border flex gap-2">
          <Button
            variant="secondary"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            취소
          </Button>
          <Button
            variant="accent"
            size="md"
            className="flex-1"
            onClick={onClose}
          >
            저장
          </Button>
        </div>
      </aside>
    </>
  );
}

export default function PoliciesPage() {
  const [carrier, setCarrier] = useState("전체");
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState(null);
  const [showNewTemplate, setShowNewTemplate] = useState(false);

  const filtered = POLICIES.filter(
    (p) =>
      (carrier === "전체" || p.carrier === carrier) &&
      p.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            보험 마스터 약관 관리
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            보험 알고리즘 파라미터를 설정하세요.
          </p>
        </div>
        <Button
          variant="accent"
          size="sm"
          onClick={() => setShowNewTemplate(true)}
        >
          <Plus className="w-4 h-4" />새 약관 템플릿
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="약관 검색..."
            className="pl-9 pr-4 py-2 text-sm bg-card border border-border rounded-xl text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all w-52"
          />
        </div>
        <div className="relative">
          <select
            value={carrier}
            onChange={(e) => setCarrier(e.target.value)}
            className="appearance-none pl-3.5 pr-8 py-2 text-sm bg-card border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all"
          >
            {CARRIERS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        </div>
        <span className="text-xs text-muted-foreground">
          {filtered.length}건 표시 중
        </span>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-border/40 bg-secondary/50">
                {[
                  "상품 ID",
                  "보험사",
                  "약관명",
                  "카테고리",
                  "보상율",
                  "최대 한도",
                  "최종 수정",
                  "Actions",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left py-3 px-4 text-muted-foreground font-semibold whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-border/20 hover:bg-secondary/40 transition-colors"
                >
                  <td className="py-3 px-4 font-mono text-muted-foreground">
                    {p.id}
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground whitespace-nowrap">
                    {p.carrier}
                  </td>
                  <td className="py-3 px-4 text-foreground max-w-48 truncate">
                    {p.name}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground font-medium">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-accent rounded-full"
                          style={{ width: `${p.rate}%` }}
                        />
                      </div>
                      <span className="font-semibold text-foreground">
                        {p.rate}%
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-4 font-medium text-foreground">
                    {p.maxCap.toLocaleString("ko-KR")}원
                  </td>
                  <td className="py-3 px-4 text-muted-foreground font-mono whitespace-nowrap">
                    {p.modified}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="p-1.5 rounded-lg hover:bg-accent/10 text-accent transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {editing && (
        <EditDrawer policy={editing} onClose={() => setEditing(null)} />
      )}
      {showNewTemplate && (
        <NewTemplateModal onClose={() => setShowNewTemplate(false)} />
      )}
    </div>
  );
}
