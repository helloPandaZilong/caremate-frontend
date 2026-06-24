import { useState, useEffect } from "react";
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
  Loader2,
} from "lucide-react";
import { Card, Badge, Button } from "../../components/shared";
import {
  getGuides,
  getGuideDocument,
  getGuideQuiz,
  submitQuiz,
} from "../../api/lmsService";

// ── LMS Home ──────────────────────────────────────────────────────────────────

function LMSHome({ onStart, guides, loading }) {
  const allCompleted =
    guides.length > 0 && guides.every((g) => g.completed);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

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
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center shrink-0">
              <Trophy className="w-7 h-7 text-amber-500" />
            </div>
            <div>
              <p className="text-base font-bold text-amber-900 dark:text-amber-300">
                필수 교육 수료 완료!
              </p>
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-0.5">
                모든 가이드를 수료했습니다. 이제 모든 수리점 기능을 사용하실 수
                있습니다.
              </p>
            </div>
          </div>
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
        {guides.map((guide) => (
          <Card key={guide.guideType} className="p-5 flex flex-col gap-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${guide.completed ? "bg-green-100 dark:bg-green-900/30" : "bg-accent/10"}`}
                >
                  {guide.completed ? (
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
                    {guide.description}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <FileText className="w-3 h-3" />
                      퀴즈 포함
                    </span>
                  </div>
                </div>
              </div>
              <Badge variant={guide.completed ? "green" : "muted"}>
                {guide.completed ? "수료 완료" : "미수료"}
              </Badge>
            </div>
            <Button
              variant={guide.completed ? "secondary" : "accent"}
              size="sm"
              className="self-start"
              onClick={() => onStart(guide.guideType)}
            >
              {guide.completed ? "다시 보기" : "학습 시작"}
              <ChevronRight className="w-4 h-4" />
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-5 bg-secondary">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          수료 기준 안내
        </p>
        <p className="text-sm text-foreground leading-relaxed">
          각 가이드별 퀴즈에서 <strong>정답률 80% 이상</strong> 달성 시 수료
          처리됩니다. 모든 가이드를 수료하면 '교육 수료 완료' 인증을 받습니다.
        </p>
      </Card>
    </div>
  );
}

// ── Guide Reader ──────────────────────────────────────────────────────────────

function GuideReader({ guideType, title, onStartQuiz, onBack }) {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [read, setRead] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGuideDocument(guideType)
      .then(({ data }) => setContent(data.data))
      .catch(() => setContent(null))
      .finally(() => setLoading(false));
  }, [guideType]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  const sections = content?.sections ?? content?.content ?? [];

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
            {title || guideType}
          </h1>
        </div>
      </div>

      <Card className="p-6 flex flex-col gap-5">
        {typeof content === "string" ? (
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {content}
          </div>
        ) : Array.isArray(sections) ? (
          sections.map((section, i) => {
            const text = typeof section === "string" ? section : section.content ?? "";
            const sectionTitle = typeof section === "object" ? section.title : null;
            return (
              <div key={i} className="flex flex-col gap-2">
                {sectionTitle && (
                  <h3 className="text-sm font-bold text-foreground border-l-2 border-accent pl-3">
                    {sectionTitle}
                  </h3>
                )}
                <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line pl-1">
                  {text.split("**").map((part, j) =>
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
          })
        ) : (
          <div className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
            {JSON.stringify(content, null, 2)}
          </div>
        )}
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

function QuizView({ guideType, title, onComplete, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setLoading(true);
    getGuideQuiz(guideType)
      .then(({ data }) => setQuestions(data.data ?? []))
      .catch(() => setQuestions([]))
      .finally(() => setLoading(false));
  }, [guideType]);

  const allAnswered = Object.keys(answers).length === questions.length && questions.length > 0;

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const answerPayload = questions.map((q, i) => ({
        questionId: q.id ?? i,
        selectedOption: answers[i],
      }));
      const { data } = await submitQuiz(guideType, answerPayload);
      const res = data.data;
      setResult(res);
      if (res?.passed) {
        setTimeout(() => onComplete(), 2000);
      }
    } catch {
      setResult({ passed: false, score: 0, total: questions.length });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

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
            {title || guideType} — 퀴즈
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {questions.length}문항 · 정답률 80% 이상 시 수료
          </p>
        </div>
        {result && (
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-sm ${result.passed ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}
          >
            {result.passed ? (
              <Trophy className="w-4 h-4" />
            ) : (
              <RotateCcw className="w-4 h-4" />
            )}
            {result.score}/{result.total ?? questions.length}점{" "}
            {result.passed ? "수료!" : "미달"}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        {questions.map((q, qi) => (
          <Card key={qi} className="p-5 flex flex-col gap-3">
            <div className="flex items-start gap-2">
              <span className="w-6 h-6 rounded-full bg-accent/10 text-accent text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                {qi + 1}
              </span>
              <p className="text-sm font-medium text-foreground">
                {q.question ?? q.q}
              </p>
            </div>
            <div className="flex flex-col gap-2 pl-8">
              {(q.options ?? []).map((opt, oi) => {
                const selected = answers[qi] === oi;
                const optionText = typeof opt === "string" ? opt : opt.text ?? opt.label ?? "";
                return (
                  <label
                    key={oi}
                    className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all text-sm ${
                      selected
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border hover:border-accent/30 text-foreground"
                    } ${result ? "cursor-default" : ""}`}
                  >
                    <input
                      type="radio"
                      name={`q-${qi}`}
                      value={oi}
                      checked={selected}
                      onChange={() =>
                        !result &&
                        setAnswers((prev) => ({ ...prev, [qi]: oi }))
                      }
                      className="accent-accent w-3.5 h-3.5 shrink-0"
                      disabled={!!result}
                    />
                    {optionText}
                  </label>
                );
              })}
            </div>
          </Card>
        ))}
      </div>

      {!result ? (
        <div className="flex items-center justify-end gap-3 p-4 bg-card border border-border rounded-2xl">
          <p className="text-xs text-muted-foreground flex-1">
            {Object.keys(answers).length}/{questions.length}문항 답변 완료
          </p>
          <Button
            variant="accent"
            size="md"
            disabled={!allAnswered || submitting}
            onClick={handleSubmit}
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : null}
            답안 제출
          </Button>
        </div>
      ) : !result.passed ? (
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
              setResult(null);
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
              {result.score}/{result.total ?? questions.length}점 — 수료 처리
              완료!
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
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadGuides = () => {
    setLoading(true);
    getGuides()
      .then(({ data }) => {
        setGuides(data.data ?? []);
        const allDone = (data.data ?? []).every((g) => g.completed);
        if (allDone && (data.data ?? []).length > 0) {
          localStorage.setItem("caremate-shop-lms", "done");
          window.dispatchEvent(new Event("lms-completed"));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadGuides();
  }, []);

  const currentGuide = guides.find((g) => g.guideType === view.type);

  if (view.screen === "guide") {
    return (
      <GuideReader
        guideType={view.type}
        title={currentGuide?.title}
        onStartQuiz={() => setView({ screen: "quiz", type: view.type })}
        onBack={() => setView({ screen: "home" })}
      />
    );
  }

  if (view.screen === "quiz") {
    return (
      <QuizView
        guideType={view.type}
        title={currentGuide?.title}
        onComplete={() => {
          loadGuides();
          setTimeout(() => setView({ screen: "home" }), 600);
        }}
        onBack={() => setView({ screen: "guide", type: view.type })}
      />
    );
  }

  return (
    <LMSHome
      onStart={(type) => setView({ screen: "guide", type })}
      guides={guides}
      loading={loading}
    />
  );
}