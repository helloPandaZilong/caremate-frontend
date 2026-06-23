import { useState } from "react";
import { Link } from "react-router";
import {
  BookOpen,
  CheckCircle2,
  ArrowLeft,
  ChevronRight,
  Award,
  Clock,
  FileText,
  RotateCcw,
  Trophy,
  LayoutDashboard,
  ShieldCheck,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";

// ── Guide content & quiz data ─────────────────────────────────────────────────

const GUIDES = [
  {
    type: "REPAIR_REPORT_GUIDE",
    title: "수리 리포트 작성 기준",
    desc: "필수 입력 항목, 사진 요건, 작성 예시 및 금지 사항",
    readTime: "약 10분",
    content: [
      "## 1. 개요\nCareMate 수리 리포트는 고객의 보험 청구 패키지 생성을 위한 핵심 문서입니다. 정확하고 완전한 리포트 작성은 고객의 보험금 수령에 직접적인 영향을 미칩니다.",
      "## 2. 필수 입력 항목\n- **부품비(parts_cost)**: 교체한 부품의 실제 원가 (0원 이상 정수)\n- **공임비(labor_cost)**: 수리 작업에 대한 인건비\n- **정비 내용(maintenance_log)**: 수행한 수리 작업의 구체적인 내용\n- **증빙 서류**: 공식 수리 영수증(PDF) + 결제 확인서(이미지)\n\n> ⚠️ 총수리비(total)는 서버에서 부품비 + 공임비로 자동 계산됩니다. 직접 입력 불가.",
      "## 3. 사진 요건\n- 파손 부위가 명확히 보이는 사진 필수\n- 수리 전/후 비교 사진 권장\n- 형식: JPEG, PNG / 파일당 최대 10MB / 최대 5장\n- 흐릿하거나 조명이 불충분한 사진은 보험사 심사에서 불이익이 발생할 수 있습니다.",
      "## 4. 작성 예시\n**올바른 예시**:\n```\n정비 내용: 전면 OLED 패널(정품) 교체 완료. 디지타이저 재조정 후 터치 전 영역 정상 작동 확인. 후면 카메라 렌즈 교체 후 AF·OIS 정상 동작 확인.\n부품비: 320,000원 / 공임비: 50,000원\n```\n\n**잘못된 예시 (금지)**:\n- '액정 수리함' 처럼 모호한 기재\n- 실제 사용하지 않은 부품 항목 추가\n- 공임비를 부품비에 포함시키는 이중 계산",
      "## 5. 금지 사항\n다음 행위는 플랫폼 이용 정지 및 법적 처벌 대상입니다.\n- 수리하지 않은 항목을 수리한 것처럼 허위 기재\n- 부품비·공임비 부풀리기\n- 타 고객 영수증 유용\n- 고객과 사전 합의 없이 추가 비용 청구",
    ],
    quiz: [
      {
        q: "CareMate 수리 리포트에서 총수리비(total)는 어떻게 결정되나요?",
        options: [
          "수리점이 직접 입력",
          "서버에서 부품비 + 공임비로 자동 계산",
          "고객과 협의하여 결정",
          "관리자가 검토 후 확정",
        ],
        answer: 1,
      },
      {
        q: "수리 사진 업로드 시 파일당 최대 허용 크기는?",
        options: ["5MB", "10MB", "20MB", "50MB"],
        answer: 1,
      },
      {
        q: "다음 중 정비 내용 기재 시 잘못된 예시는?",
        options: [
          "전면 OLED 패널 교체 완료",
          "배터리 BMS 이상으로 배터리 팩 교체",
          "액정 수리함",
          "디지타이저 재조정 후 터치 전 영역 정상 확인",
        ],
        answer: 2,
      },
      {
        q: "수리 영수증으로 허용되는 파일 형식은?",
        options: ["PDF, DOCX", "PDF, JPG, PNG", "HWP, PDF", "JPG만 허용"],
        answer: 1,
      },
      {
        q: "다음 중 플랫폼 이용 정지 대상 행위가 아닌 것은?",
        options: [
          "부품비 부풀리기",
          "수리 전/후 사진 2장 모두 촬영",
          "수리하지 않은 항목 허위 기재",
          "타 고객 영수증 유용",
        ],
        answer: 1,
      },
    ],
  },
  {
    type: "PLATFORM_PROCESS_GUIDE",
    title: "플랫폼 A/S 처리 절차 및 준수 안내",
    desc: "전체 처리 절차, 공식 센터 역할과 책임, 허위·부정 청구 금지 안내",
    readTime: "약 15분",
    content: [
      "## 1. 전체 A/S 처리 흐름\n```\n[고객] 비대면 접수(RECEIVED)\n   ↓\n[수리점] 수락(ACCEPTED) 또는 반려(REJECTED)\n   ↓ 수락 시\n[수리점] 수리 시작(IN_REPAIR)\n   ↓\n[수리점] 수리 완료 리포트 작성 → REPAIR_DONE 자동 전이\n   ↓\n[고객] 결제(PAYMENT_COMPLETED)\n   ↓\n[플랫폼] 보험 청구 패키지 자동 생성 → CLAIM_COMPLETED\n```",
      "## 2. 수리점의 역할과 책임\n- **접수 수락/반려**: 접수를 확인하고 처리 가능 여부를 판단합니다. 반려 시에는 반드시 명확한 사유를 기재해야 합니다.\n- **수리 진행**: 수락 후 지정된 방문 시각에 고객을 응대하여 수리를 진행합니다.\n- **노쇼(NO_SHOW)**: 방문 예약 시각 + 2시간이 경과해도 고객이 방문하지 않을 경우 노쇼 처리됩니다. 수리점이 수동으로도 처리 가능합니다.\n- **리포트 작성**: 수리 완료 후 정확한 비용과 정비 내용을 입력해야 합니다.",
      "## 3. 결제 및 정산 구조\n- 고객은 수리 완료 후 인앱 PG를 통해 **전액 선결제**합니다.\n- 결제 대금은 수리점으로 직접 지급됩니다.\n- **월말 플랫폼 수수료** (현재 10%)가 익월 5일까지 플랫폼에 납부되어야 합니다.\n- 수수료 미납 시 서비스 이용이 제한될 수 있습니다.",
      "## 4. 보험 청구 안내\n고객의 결제 완료 이후 플랫폼이 자동으로 보험 청구 패키지를 생성합니다. 이 패키지에는 수리점이 입력한 리포트 내용이 포함되므로 허위 기재 시 **보험 사기**에 해당합니다.\n\n수리점은 보험 청구 결과 또는 보험금 수령액에 관여하지 않습니다. 보험사의 최종 심사 결과는 고객과 보험사 간의 사안입니다.",
      "## 5. 허위·부정 처리 금지\n다음 행위는 민·형사상 책임이 발생할 수 있습니다.\n- 실제 수리 금액을 초과한 금액을 청구하는 행위\n- 수리하지 않은 항목을 수리한 것처럼 리포트에 기재하는 행위\n- 고객 동의 없이 추가 서비스를 제공하고 비용을 청구하는 행위\n- 다른 수리 건의 서류를 유용하는 행위\n\n적발 시: 즉시 파트너십 해지 + 수사 기관 신고",
    ],
    quiz: [
      {
        q: "수리점이 접수를 반려(REJECTED)할 때 필수로 해야 하는 것은?",
        options: [
          "반려 사유 기재",
          "고객에게 전화 통보",
          "관리자 승인 획득",
          "별도 절차 없음",
        ],
        answer: 0,
      },
      {
        q: "CareMate의 노쇼(NO_SHOW) 자동 판정 기준은?",
        options: [
          "방문 예약 시각에 미도착 시 즉시",
          "방문 예약 시각 + 1시간 경과 후",
          "방문 예약 시각 + 2시간 경과 후 IN_REPAIR 미전이 시",
          "수리점이 수동으로만 처리 가능",
        ],
        answer: 2,
      },
      {
        q: "플랫폼 수수료는 언제까지 납부해야 하나요?",
        options: ["당월 말일", "익월 1일", "익월 5일", "익월 10일"],
        answer: 2,
      },
      {
        q: "수리점이 보험 청구 결과에 미치는 영향은?",
        options: [
          "리포트 내용이 청구 패키지에 포함됨",
          "수리점이 직접 보험사와 협상 가능",
          "수리점이 보험금 수령액을 결정할 수 있음",
          "관여하지 않음",
        ],
        answer: 0,
      },
      {
        q: "다음 중 허위·부정 처리에 해당하지 않는 것은?",
        options: [
          "실제 수리비보다 높은 금액 청구",
          "수리한 항목을 정확히 기재",
          "수리하지 않은 항목을 리포트에 기재",
          "고객 동의 없는 추가 서비스 청구",
        ],
        answer: 1,
      },
    ],
  },
];

// ── Guide status (simulated) ──────────────────────────────────────────────────

// ── LMS Home ──────────────────────────────────────────────────────────────────

function LMSHome({ onStart, statuses }) {
  const allCompleted = Object.values(statuses).every((s) => s === "COMPLETED");

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      <div>
        <h1 className="text-xl font-semibold text-foreground">LMS 교육</h1>
        <p className="text-sm text-muted-foreground mt-1">
          필수 교육 가이드를 학습하고 퀴즈를 통해 수료하세요.
        </p>
      </div>

      {allCompleted && (
        <div className="flex flex-col gap-4 p-6 rounded-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-900/25 dark:via-yellow-900/20 dark:to-orange-900/20">
          {/* Trophy row */}
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <p className="text-base font-bold text-amber-900 dark:text-amber-300">
                🎉 필수 교육 수료 완료!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                2종 가이드를 모두 수료했습니다. 이제 모든 수리점 기능을 사용하실
                수 있습니다.
              </p>
            </div>
          </div>

          {/* Certification mark */}
          <div className="flex items-center gap-2.5 px-4 py-3 bg-white/70 dark:bg-white/10 rounded-xl border border-amber-200 dark:border-amber-700/50">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-foreground">
                CareMate 파트너 인증 수료증 발급 완료
              </p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                마이페이지에서 LMS 수료 인증마크를 확인할 수 있습니다.
              </p>
            </div>
          </div>

          {/* CTA buttons */}
          <div className="flex gap-3">
            <Link
              to="/shop/dashboard"
              className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-sm transition-all shadow-lg shadow-amber-500/20"
            >
              <LayoutDashboard className="w-4 h-4" />
              대시보드로 이동
            </Link>
            <Link
              to="/shop/profile"
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-amber-300 dark:border-amber-600 bg-white/60 dark:bg-white/10 text-amber-800 dark:text-amber-300 font-medium text-sm hover:bg-white/80 dark:hover:bg-white/20 transition-all"
            >
              수료증 확인
            </Link>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-4">
        {GUIDES.map((guide) => {
          const status = statuses[guide.type];
          return (
            <Card key={guide.type} className="p-5 flex flex-col gap-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${status === "COMPLETED" ? "bg-green-100 dark:bg-green-900/30" : "bg-accent/10"}`}
                  >
                    {status === "COMPLETED" ? (
                      <Award className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <BookOpen className="w-5 h-5 text-accent" />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {guide.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {guide.desc}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {guide.readTime}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <FileText className="w-3 h-3" />
                        퀴즈 {guide.quiz.length}문항
                      </span>
                    </div>
                  </div>
                </div>
                <Badge variant={status === "COMPLETED" ? "green" : "muted"}>
                  {status === "COMPLETED" ? "수료 완료" : "미수료"}
                </Badge>
              </div>
              <Button
                variant={status === "COMPLETED" ? "secondary" : "accent"}
                size="sm"
                className="self-start"
                onClick={() => onStart(guide.type)}
              >
                {status === "COMPLETED" ? "다시 보기" : "학습 시작"}
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Card>
          );
        })}
      </div>

      <Card className="p-5 bg-secondary">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          수료 기준 안내
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          각 가이드별 퀴즈에서 <strong>정답률 80% 이상</strong> (5문항 중 4문항
          이상) 달성 시 수료 처리됩니다. 2종 모두 수료 시 '교육 수료 완료'
          인증을 받습니다. 수료 후에는 재응시가 불필요합니다.
        </p>
      </Card>
    </div>
  );
}

// ── Guide Reader ──────────────────────────────────────────────────────────────

function GuideReader({ guide, onStartQuiz, onBack }) {
  const [read, setRead] = useState(false);

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        교육 목록으로
      </button>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
          <BookOpen className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {guide.title}
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
            <Clock className="w-3 h-3" />
            {guide.readTime} · 퀴즈 {guide.quiz.length}문항
          </p>
        </div>
      </div>

      <Card className="p-6 flex flex-col gap-5">
        {guide.content.map((section, i) => {
          const lines = section.split("\n");
          const title = lines[0].replace(/^#+\s*/, "");
          const body = lines.slice(1).join("\n").trim();
          return (
            <div key={i} className="flex flex-col gap-2">
              <h3 className="text-sm font-bold text-foreground border-l-2 border-accent pl-3">
                {title}
              </h3>
              <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-1">
                {body.split("**").map((part, j) =>
                  j % 2 === 1 ? (
                    <strong key={j} className="text-foreground font-semibold">
                      {part}
                    </strong>
                  ) : (
                    <span key={j}>{part}</span>
                  ),
                )}
              </div>
            </div>
          );
        })}
      </Card>

      <div className="flex items-center justify-between p-5 bg-card border border-border rounded-2xl">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={read}
            onChange={(e) => setRead(e.target.checked)}
            className="accent-accent w-4 h-4"
          />
          <span className="text-sm text-foreground">
            가이드를 끝까지 읽었으며 내용을 이해했습니다.
          </span>
        </label>
        <Button
          variant="accent"
          size="md"
          disabled={!read}
          onClick={onStartQuiz}
        >
          퀴즈 시작하기
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Quiz ─────────────────────────────────────────────────────────────────────

function QuizView({ guide, onComplete, onBack }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const allAnswered = Object.keys(answers).length === guide.quiz.length;
  const score = submitted
    ? guide.quiz.filter((q, i) => answers[i] === q.answer).length
    : 0;
  const passed = submitted && score / guide.quiz.length >= 0.8;

  const handleSubmit = () => {
    setSubmitted(true);
    if (score / guide.quiz.length >= 0.8) {
      setTimeout(() => onComplete(score), 2000);
    }
  };

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        가이드로 돌아가기
      </button>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-foreground">
            {guide.title} — 퀴즈
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {guide.quiz.length}문항 · 정답률 80% 이상 시 수료
          </p>
        </div>
        {submitted && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${passed ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
          >
            {passed ? (
              <Trophy className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {score}/{guide.quiz.length}점 {passed ? "수료!" : "미달"}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {guide.quiz.map((q, qi) => (
          <Card
            key={qi}
            className={`p-5 flex flex-col gap-3 ${submitted ? (answers[qi] === q.answer ? "border-green-300 dark:border-green-700/50 bg-green-50/30 dark:bg-green-900/10" : "border-red-300 dark:border-red-700/50 bg-red-50/30 dark:bg-red-900/10") : ""}`}
          >
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <p className="text-sm font-medium text-foreground">{q.q}</p>
            </div>
            <div className="flex flex-col gap-2 pl-8">
              {q.options.map((opt, oi) => {
                const selected = answers[qi] === oi;
                const isCorrect = submitted && oi === q.answer;
                const isWrong = submitted && selected && oi !== q.answer;
                return (
                  <label
                    key={oi}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                      isCorrect
                        ? "border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                        : isWrong
                          ? "border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400"
                          : selected
                            ? "border-accent bg-accent/5 text-foreground"
                            : "border-border hover:border-accent/30 text-foreground"
                    } ${submitted ? "cursor-default" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      value={oi}
                      checked={selected}
                      onChange={() =>
                        !submitted &&
                        setAnswers((prev) => ({ ...prev, [qi]: oi }))
                      }
                      className="accent-accent w-3.5 h-3.5 shrink-0"
                      disabled={submitted}
                    />

                    {opt}
                    {isCorrect && (
                      <CheckCircle2 className="w-3.5 h-3.5 ml-auto text-green-600 dark:text-green-400 shrink-0" />
                    )}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {!submitted ? (
        <div className="flex items-center justify-end gap-3 p-4 bg-card border border-border rounded-2xl">
          <p className="text-xs text-muted-foreground flex-1">
            {Object.keys(answers).length}/{guide.quiz.length}문항 답변 완료
          </p>
          <Button
            variant="accent"
            size="md"
            disabled={!allAnswered}
            onClick={handleSubmit}
          >
            답안 제출
          </Button>
        </div>
      ) : !passed ? (
        <Card className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-red-700 dark:text-red-400">
              80% 미달 — 재응시 필요
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              가이드를 다시 읽고 퀴즈에 재도전하세요.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setAnswers({});
              setSubmitted(false);
            }}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            다시 풀기
          </Button>
        </Card>
      ) : (
        <Card className="p-5 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50 flex items-center gap-4 animate-in fade-in">
          <div className="w-10 h-10 rounded-xl bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
            <Trophy className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-green-800 dark:text-green-300">
              {score}/{guide.quiz.length}점 — 수료 처리 완료!
            </p>
            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
              교육 목록으로 자동 이동합니다...
            </p>
          </div>
        </Card>
      )}
    </div>
  );
}

// ── LMS Root ──────────────────────────────────────────────────────────────────

export default function LMSPage() {
  const [view, setView] = useState({ screen: "home" });
  const [statuses, setStatuses] = useState({
    REPAIR_REPORT_GUIDE: "NOT_STARTED",
    PLATFORM_PROCESS_GUIDE: "NOT_STARTED",
  });

  const handleComplete = (type) => {
    const next = { ...statuses, [type]: "COMPLETED" };
    setStatuses(next);
    const allDone = Object.values(next).every((s) => s === "COMPLETED");
    if (allDone) {
      localStorage.setItem("caremate-shop-lms", "done");
      // Notify AppShell immediately so the gate lifts without requiring navigation
      window.dispatchEvent(new Event("lms-completed"));
    }
    setTimeout(() => setView({ screen: "home" }), 600);
  };

  if (view.screen === "guide") {
    const guide = GUIDES.find((g) => g.type === view.type);
    return (
      <GuideReader
        guide={guide}
        onStartQuiz={() => setView({ screen: "quiz", type: view.type })}
        onBack={() => setView({ screen: "home" })}
      />
    );
  }

  if (view.screen === "quiz") {
    const guide = GUIDES.find((g) => g.type === view.type);
    return (
      <QuizView
        guide={guide}
        onComplete={(score) => {
          if (score / guide.quiz.length >= 0.8) handleComplete(view.type);
        }}
        onBack={() => setView({ screen: "guide", type: view.type })}
      />
    );
  }

  return (
    <LMSHome
      onStart={(type) => setView({ screen: "guide", type })}
      statuses={statuses}
    />
  );
}
