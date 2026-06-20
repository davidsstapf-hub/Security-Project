import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleHelp,
  Clock3,
  Command,
  Contact,
  Gauge,
  GraduationCap,
  Layers3,
  LayoutDashboard,
  LockKeyhole,
  Menu,
  Play,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Target,
  Trophy,
  UsersRound,
  X,
  Zap,
} from "lucide-react";
import {
  allActivities,
  domains,
  getActivity,
  getTier,
  masterFlashcardsActivity,
  tiers,
} from "../content/studyData.js";
import {
  getDomainCoverage,
  getModuleProgress,
  getOverallProgress,
  getReadiness,
  getRecommendation,
  getTierProgress,
  moduleNeedsReview,
} from "../lib/learningLogic.js";
import { progressRepository } from "../lib/progressRepository.js";
import {
  currentTierForProgress,
  filterCurriculum,
} from "../lib/curriculumSearch.js";
import { ActivityView as LearningActivityView } from "../features/learn/LearningActivities.jsx";

const primaryNavItems = [
  { id: "dashboard", label: "Overview", icon: LayoutDashboard },
  { id: "path", label: "Learning Path", icon: Layers3 },
  { id: "domains", label: "Exam Domains", icon: BookOpen },
  { id: "flashcards", label: "Flash Cards", icon: Contact },
  { id: "progress", label: "Progress", icon: BarChart3 },
  { id: "study-guide", label: "How to Use This App", icon: GraduationCap },
  { id: "developers", label: "Meet the developers", icon: UsersRound },
];

const aboutNavItems = [
  { id: "why-security", label: "Why the Security+?", icon: TrendingUp },
  { id: "why-app", label: "Why choose this app?", icon: Award },
];

const navItems = [...primaryNavItems, ...aboutNavItems];

const typeLabels = {
  lesson: "Lesson",
  flashcards: "Flashcards",
  quiz: "Knowledge check",
  checkpoint: "Tier checkpoint",
  scenario: "Scenario lab",
  exam: "Practice exam",
};

function Sidebar({ active, onNavigate, open, onClose, progress }) {
  const overall = getOverallProgress(progress);
  const renderNavItem = ({ id, label, icon: Icon }) => (
    <button
      key={id}
      className={`nav__item ${active === id ? "nav__item--active" : ""}`}
      onClick={() => {
        onNavigate(id);
        onClose();
      }}
    >
      <Icon size={18} />
      <span>{label}</span>
      {id === "path" && <span className="nav__badge">{tiers.length}</span>}
    </button>
  );

  return (
    <aside className={`sidebar ${open ? "sidebar--open" : ""}`}>
      <div className="brand">
        <button
          className="brand__mark brand__home"
          onClick={() => {
            onNavigate("dashboard");
            onClose();
          }}
          aria-label="Return to Overview home"
          title="Field Guide home"
        >
          <ShieldCheck size={22} />
        </button>
        <div>
          <strong>SEC+ FIELD GUIDE</strong>
          <span>SY0-701</span>
        </div>
      </div>
      <button
        className="sidebar__close"
        onClick={onClose}
        aria-label="Close navigation"
      >
        <X size={20} />
      </button>
      <nav className="nav" aria-label="Main navigation">
        <div className="nav__group">
          <p className="eyebrow">Workspace</p>
          {primaryNavItems.map(renderNavItem)}
        </div>
        <div className="nav__group nav__group--about">
          <p className="eyebrow">About</p>
          {aboutNavItems.map(renderNavItem)}
        </div>
      </nav>
      <div className="sidebar__mission">
        <div className="mission__icon">
          <Target size={18} />
        </div>
        <p className="eyebrow">Learning path</p>
        <strong>Foundations first.</strong>
        <span>Six guided tiers turn a big exam into the next small win.</span>
        <div className="mission__meter">
          <i style={{ width: `${overall}%` }} />
        </div>
        <small>{overall}% journey complete</small>
      </div>
      <div className="profile">
        <div className="profile__avatar">
          {progress.learnerName.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <strong>{progress.learnerName}</strong>
          <span>Security+ candidate</span>
        </div>
        <ChevronRight size={17} />
      </div>
    </aside>
  );
}

function Topbar({
  title,
  onMenu,
  query,
  onQueryChange,
  onSearchActivate,
  recommendation,
  onContinue,
}) {
  const inputRef = useRef(null);
  const [searchOpen, setSearchOpen] = useState(false);
  useEffect(() => {
    const handleKey = (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
        onSearchActivate();
        window.setTimeout(() => inputRef.current?.focus(), 0);
      } else if (
        event.key === "Escape" &&
        document.activeElement === inputRef.current
      ) {
        event.preventDefault();
        onQueryChange("");
        setSearchOpen(false);
        inputRef.current.blur();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onQueryChange, onSearchActivate]);
  const update = (value) => {
    onQueryChange(value);
    onSearchActivate();
  };
  return (
    <header className="topbar">
      <button
        className="icon-button mobile-menu"
        onClick={onMenu}
        aria-label="Open navigation"
      >
        <Menu size={20} />
      </button>
      <div>
        <p className="eyebrow">Learning workspace</p>
        <h1>{title}</h1>
      </div>
      <div className={`topbar__actions ${searchOpen ? "search-open" : ""}`}>
        {recommendation?.activity && (
          <button
            className="continue-learning"
            onClick={onContinue}
            aria-label="Continue learning"
            title="Continue learning"
          >
            <Play size={15} />
            <span>Continue learning</span>
          </button>
        )}
        <button
          className="search-toggle"
          onClick={() => {
            setSearchOpen(!searchOpen);
            if (!searchOpen) {
              onSearchActivate();
              window.setTimeout(() => inputRef.current?.focus(), 0);
            }
          }}
          aria-label="Search guided curriculum"
          aria-expanded={searchOpen}
        >
          <Search size={18} />
        </button>
        <label className="search">
          <Search size={17} />
          <input
            ref={inputRef}
            value={query}
            onChange={(event) => update(event.target.value)}
            aria-label="Filter guided curriculum"
            placeholder="Filter curriculum..."
          />
          <kbd>
            <Command size={11} /> K
          </kbd>
        </label>
      </div>
    </header>
  );
}

function Ring({ value, color = "#00d9ff", size = 74 }) {
  return (
    <div
      className="ring"
      style={{
        "--value": `${Math.max(0, Math.min(100, value)) * 3.6}deg`,
        "--ring": color,
        "--size": `${size}px`,
      }}
    >
      <strong>{value}%</strong>
    </div>
  );
}

function Highlight({ text, query }) {
  const value = String(text ?? "");
  const index = value.toLowerCase().indexOf(query.trim().toLowerCase());
  return index < 0 || !query.trim() ? (
    value
  ) : (
    <>
      {value.slice(0, index)}
      <mark>{value.slice(index, index + query.trim().length)}</mark>
      {value.slice(index + query.trim().length)}
    </>
  );
}

function Onboarding({ onStart, onExplore }) {
  return (
    <div className="welcome-overlay">
      <section
        className="welcome-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        <div className="welcome-orbit">
          <div className="brand__mark">
            <ShieldCheck size={30} />
          </div>
          <i />
          <i />
        </div>
        <p className="eyebrow">Welcome to your field guide</p>
        <h1 id="welcome-title">
          Security+ is a mountain.
          <br />
          <em>We built you a trail.</em>
        </h1>
        <p>
          Six guided tiers move from essential language to a full practice exam.
          Nothing is locked, and you’ll always know the next useful step.
        </p>
        <div className="welcome-tiers">
          {tiers.map((tier) => (
            <span key={tier.id} style={{ "--tier": tier.color }}>
              <b>0{tier.number}</b>
              {tier.title}
            </span>
          ))}
        </div>
        <div className="welcome-actions">
          <button className="button button--primary" onClick={onStart}>
            <Play size={17} fill="currentColor" />
            Start with Tier 1 <ArrowRight size={17} />
          </button>
          <button className="button button--ghost" onClick={onExplore}>
            Explore the full path
          </button>
        </div>
        <small>Progress stays on this device. No account required.</small>
      </section>
    </div>
  );
}

function Dashboard({ progress, onOpenTier, onOpenActivity, onNavigate }) {
  const readiness = getReadiness(progress);
  const recommendation = getRecommendation(progress);
  const next = recommendation.activity;
  const nextTier = next
    ? getTier(`tier-${next.tierNumber}`)
    : tiers[tiers.length - 1];
  const currentTier = currentTierForProgress(
    tiers,
    progress,
    getRecommendation,
  );
  const currentTierProgress = getTierProgress(currentTier, progress);
  return (
    <div className="page dashboard">
      <div className="circuit-field" aria-hidden="true">
        {Array.from({ length: 14 }, (_, index) => (
          <span key={index}>
            <i />
          </span>
        ))}
      </div>
      <section className="hero guided-hero">
        <div className="hero__grid" />
        <div className="hero__copy">
          <span className="status-pill">
            <i />{" "}
            {recommendation.review
              ? "Review recommended"
              : `Tier ${currentTier.number} · ${currentTier.title}`}
          </span>
          <p className="eyebrow">Your recommended next step</p>
          <h2>
            {next ? next.title : "Journey complete."}
            <br />
            <em>
              {next
                ? `${next.duration} focused minutes.`
                : "That deserves a victory lap."}
            </em>
          </h2>
          <p>
            {recommendation.review
              ? `A recent score below 80% suggests a quick review. ${next?.summary}`
              : (next?.summary ??
                "Review any tier or take another practice exam whenever you like.")}
          </p>
          <div className="hero__actions">
            <button
              className="button button--primary"
              disabled={!next}
              onClick={() => next && onOpenActivity(next.id)}
            >
              <Play size={17} fill="currentColor" />
              {recommendation.review
                ? "Start review"
                : next
                  ? "Continue learning"
                  : "Journey complete"}
              <ArrowRight size={17} />
            </button>
            <button
              className="button button--ghost"
              onClick={() => onOpenTier(nextTier.id)}
            >
              <Layers3 size={17} />
              View tier
            </button>
          </div>
        </div>
        <div className="hero__visual">
          <div className="orbit orbit--one" />
          <div className="orbit orbit--two" />
          <div className="readiness">
            <Ring value={currentTierProgress} size={148} />
            <span>TIER {currentTier.number} PROGRESS</span>
          </div>
          <div className="signal signal--one">
            <Activity size={14} /> {readiness}% exam ready
          </div>
          <div className="signal signal--two">
            <LockKeyhole size={14} /> Path stays open
          </div>
        </div>
      </section>
      <section className="stats-row">
        <article>
          <span className="stat-icon stat-icon--green">
            <Clock3 size={19} />
          </span>
          <div>
            <p>Study time</p>
            <strong>{progress.totalStudyMinutes} min</strong>
            <small>saved on this device</small>
          </div>
        </article>
        <article>
          <span className="stat-icon stat-icon--orange">
            <Target size={19} />
          </span>
          <div>
            <p>Current tier</p>
            <strong>Tier {currentTier.number}</strong>
            <small>{currentTier.title}</small>
          </div>
        </article>
        <article>
          <span className="stat-icon stat-icon--blue">
            <Award size={19} />
          </span>
          <div>
            <p>Activities</p>
            <strong>{progress.completedActivityIds.length}</strong>
            <small>completed across the path</small>
          </div>
        </article>
        <article>
          <span className="stat-icon stat-icon--purple">
            <Gauge size={19} />
          </span>
          <div>
            <p>Readiness</p>
            <strong>{readiness}%</strong>
            <small>coverage + accuracy</small>
          </div>
        </article>
      </section>
      <section className="start-card" aria-labelledby="start-card-title">
        <div className="start-card__icon">
          <GraduationCap size={24} />
        </div>
        <div>
          <p className="eyebrow">
            {progress.completedActivityIds.length ? "Keep going" : "Start here"}
          </p>
          <h3 id="start-card-title">
            {progress.completedActivityIds.length
              ? "Your next small win is already picked."
              : "New to cybersecurity? Start at zero and follow the trail."}
          </h3>
          <p>
            {progress.completedActivityIds.length
              ? "Use the recommendation to continue in order, then review anything under 80% before moving too far ahead."
              : "Begin with Tier 1. Each lesson gives you the language, examples, flashcards, checks, and quizzes you need before the app moves you forward."}
          </p>
        </div>
        <button
          className="button button--primary"
          disabled={!next}
          onClick={() => next && onOpenActivity(next.id)}
        >
          {next ? "Open next activity" : "Journey complete"}
          <ArrowRight size={16} />
        </button>
      </section>
      <div className="guided-layout guided-layout--wide">
        <section className="panel journey-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Your guided journey</p>
              <h3>Six tiers, one clear direction</h3>
            </div>
            <button className="text-button" onClick={() => onNavigate("path")}>
              Full path <ArrowRight size={15} />
            </button>
          </div>
          <TierRail progress={progress} onOpenTier={onOpenTier} compact />
        </section>
      </div>
    </div>
  );
}

function TierRail({ progress, onOpenTier, compact = false }) {
  const recommendedTier =
    tiers.find((tier) => getTierProgress(tier, progress) < 100) ??
    tiers[tiers.length - 1];
  return (
    <div className={`tier-rail ${compact ? "tier-rail--compact" : ""}`}>
      {tiers.map((tier, index) => {
        const value = getTierProgress(tier, progress);
        const recommended = tier.id === recommendedTier.id;
        return (
          <button
            key={tier.id}
            className={`tier-node ${recommended ? "tier-node--recommended" : ""}`}
            style={{ "--tier": tier.color }}
            onClick={() => onOpenTier(tier.id)}
          >
            <span className="tier-node__number">
              {value === 100 ? <Check size={19} /> : tier.number}
            </span>
            <span className="tier-node__copy">
              <small>
                {recommended
                  ? value > 0
                    ? "Continue here"
                    : "Recommended next"
                  : tier.recommendedAfter
                    ? `Best after Tier ${tier.recommendedAfter}`
                    : "Start here"}
              </small>
              <strong>{tier.title}</strong>
              <em>{tier.subtitle}</em>
            </span>
            <span className="tier-node__progress">
              <i style={{ width: `${value}%` }} />
            </span>
            <b>{value}%</b>
            <ChevronRight size={18} />
            {index < tiers.length - 1 && <span className="tier-connector" />}
          </button>
        );
      })}
    </div>
  );
}

function PathView({
  progress,
  onOpenTier,
  onOpenActivity,
  query,
  onClearQuery,
}) {
  const results = useMemo(() => filterCurriculum(tiers, query), [query]);
  if (query.trim())
    return (
      <div className="page">
        <div className="page-intro search-intro">
          <div>
            <p className="eyebrow">Curriculum filter</p>
            <h2>Results for “{query}”</h2>
            <p aria-live="polite">
              {results.resultCount}{" "}
              {results.resultCount === 1 ? "activity" : "activities"} found
              across {results.tiers.length}{" "}
              {results.tiers.length === 1 ? "tier" : "tiers"}.
            </p>
          </div>
          <button className="button button--ghost" onClick={onClearQuery}>
            Clear filter
          </button>
        </div>
        {results.resultCount === 0 ? (
          <section className="panel search-empty">
            <Search size={28} />
            <h3>No curriculum matches that filter.</h3>
            <p>
              Try a tier name, objective such as 3.4, activity type, or topic
              keyword.
            </p>
            <button className="button button--primary" onClick={onClearQuery}>
              Show full path
            </button>
          </section>
        ) : (
          <div className="search-results">
            {results.tiers.map((tier) => (
              <section
                className="panel search-tier"
                key={tier.id}
                style={{ "--tier": tier.color }}
              >
                <header>
                  <span>Tier {tier.number}</span>
                  <h3>
                    <Highlight text={tier.title} query={query} />
                  </h3>
                </header>
                {tier.modules.map((module) => (
                  <div className="search-module" key={module.id}>
                    <h4>
                      <Highlight text={module.title} query={query} />
                    </h4>
                    {module.activities.map((activity) => (
                      <button
                        key={activity.id}
                        onClick={() => onOpenActivity(activity.id)}
                      >
                        <span>
                          {typeLabels[activity.type]} · Objective{" "}
                          <Highlight text={activity.objective} query={query} />
                        </span>
                        <strong>
                          <Highlight text={activity.title} query={query} />
                        </strong>
                        <small>
                          <Highlight text={activity.summary} query={query} />
                        </small>
                        <ArrowRight size={16} />
                      </button>
                    ))}
                  </div>
                ))}
              </section>
            ))}
          </div>
        )}
      </div>
    );
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Guided curriculum</p>
          <h2>
            See the whole mountain.
            <br />
            Take one step.
          </h2>
          <p>
            The path mixes all five exam domains in prerequisite order. Every
            tier is open, but Tier 1 gives you the vocabulary and confidence the
            rest will use.
          </p>
        </div>
        <div className="path-summary">
          <Ring value={getOverallProgress(progress)} size={94} />
          <span>
            <strong>Full journey</strong>
            <small>
              {progress.completedActivityIds.length} activities finished
            </small>
          </span>
        </div>
      </div>
      <section className="panel path-panel">
        <TierRail progress={progress} onOpenTier={onOpenTier} />
      </section>
    </div>
  );
}

function TierDetail({ tier, progress, onBack, onOpenActivity }) {
  const value = getTierProgress(tier, progress);
  return (
    <div className="page tier-detail-page" style={{ "--tier": tier.color }}>
      <button className="back-button" onClick={onBack}>
        <ArrowLeft size={16} /> Back to path
      </button>
      <section className="tier-banner">
        <div>
          <span className="status-pill">
            <i /> Tier {tier.number} of {tiers.length}
          </span>
          <p className="eyebrow">
            {tier.difficulty} · {tier.minutes} minutes
          </p>
          <h2>{tier.title}</h2>
          <p>
            {tier.subtitle}. {tier.modules[0].summary}
          </p>
        </div>
        <Ring value={value} color={tier.color} size={126} />
      </section>
      {tier.recommendedAfter && (
        <div className="guidance-note">
          <Sparkles size={18} />
          <div>
            <strong>
              Recommended after Tier {tier.recommendedAfter}, never locked.
            </strong>
            <span>
              You can explore now. If anything feels unfamiliar, the earlier
              tier will build the missing context.
            </span>
          </div>
        </div>
      )}
      <div className="module-stack">
        {tier.modules.map((module, moduleIndex) => {
          const moduleProgress = getModuleProgress(module, progress);
          const needsReview = moduleNeedsReview(module, progress);
          return (
            <section
              className={`panel module-panel ${needsReview ? "module-panel--review" : ""}`}
              key={module.id}
            >
              <div className="module-heading">
                <span>0{moduleIndex + 1}</span>
                <div className="module-heading__copy">
                  <p className="eyebrow">Learning module</p>
                  <h3>{module.title}</h3>
                  <p>{module.summary}</p>
                </div>
                <div className="module-progress">
                  <strong>
                    {needsReview
                      ? "Review recommended"
                      : `${moduleProgress}% complete`}
                  </strong>
                  <i>
                    <em style={{ width: `${moduleProgress}%` }} />
                  </i>
                </div>
              </div>
              <div className="activity-list">
                {module.activities.map((activity, activityIndex) => {
                  const done = progress.completedActivityIds.includes(
                    activity.id,
                  );
                  const hasContent =
                    activity.content || activity.cards || activity.questions;
                  return (
                    <button
                      key={activity.id}
                      className={`activity-row ${done ? "activity-row--done" : ""}`}
                      onClick={() => onOpenActivity(activity.id)}
                    >
                      <span className="activity-status">
                        {done ? <Check size={17} /> : activityIndex + 1}
                      </span>
                      <span className="activity-copy">
                        <small>
                          {typeLabels[activity.type]} · Domain {activity.domain}{" "}
                          · Objective {activity.objective}
                        </small>
                        <strong>{activity.title}</strong>
                        <em>{activity.summary}</em>
                      </span>
                      <span className="activity-time">
                        <Clock3 size={14} />
                        {activity.duration} min
                      </span>
                      {!hasContent && (
                        <span className="preview-badge">Preview</span>
                      )}
                      <ChevronRight size={18} />
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function DomainsView({ progress }) {
  const coverage = getDomainCoverage(progress);
  const [selected, setSelected] = useState(coverage[0]);
  useEffect(
    () =>
      setSelected(
        coverage.find((domain) => domain.id === selected.id) ?? coverage[0],
      ),
    [progress],
  );
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Objective reference</p>
          <h2>
            Five exam domains.
            <br />
            Woven through every tier.
          </h2>
          <p>
            Use this view to inspect official coverage. Your learning order is
            guided by difficulty, not the domain numbering.
          </p>
        </div>
      </div>
      <div className="domain-grid">
        {coverage.map((domain) => {
          const Icon = domain.icon;
          return (
            <button
              key={domain.id}
              className={`domain-card ${selected.id === domain.id ? "domain-card--active" : ""}`}
              style={{ "--domain": domain.color }}
              onClick={() => setSelected(domain)}
            >
              <span className="domain-card__icon">
                <Icon size={22} />
              </span>
              <small>{domain.weight}% OF EXAM</small>
              <h3>{domain.title}</h3>
              <p>{domain.topics.join(" · ")}</p>
              <div className="domain-card__bottom">
                <span>
                  <i style={{ width: `${domain.progress}%` }} />
                </span>
                <strong>{domain.progress}%</strong>
              </div>
            </button>
          );
        })}
      </div>
      <section
        className="panel domain-detail"
        style={{ "--domain": selected.color }}
      >
        <div>
          <p className="eyebrow">Domain {selected.id} coverage</p>
          <h3>{selected.title}</h3>
          <p>
            Progress grows whenever you complete a mapped activity anywhere in
            the {tiers.length}-tier path.
          </p>
        </div>
        <div className="topic-chips">
          {selected.topics.map((topic, i) => (
            <span key={topic}>
              <b>
                {selected.id}.{i + 1}
              </b>
              {topic}
            </span>
          ))}
        </div>
        <Ring value={selected.progress} color={selected.color} size={82} />
      </section>
    </div>
  );
}

function ProgressView({ progress }) {
  const readiness = getReadiness(progress);
  const currentTier = currentTierForProgress(
    tiers,
    progress,
    getRecommendation,
  );
  return (
    <div className="page">
      <div className="page-intro">
        <div>
          <p className="eyebrow">Performance</p>
          <h2>Your learning telemetry.</h2>
          <p>
            Readiness combines weighted domain coverage with checkpoint
            accuracy. It will become more meaningful as you practice.
          </p>
        </div>
      </div>
      <div className="progress-layout">
        <section className="panel readiness-panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Tier progress</p>
              <h3>{tiers.length}-stage trajectory</h3>
            </div>
            <span className="trend-up">{readiness}% ready</span>
          </div>
          <div className="tier-bars">
            {tiers.map((tier) => (
              <div key={tier.id} style={{ "--tier": tier.color }}>
                <span>
                  <b>Tier {tier.number}</b>
                  {tier.title}
                </span>
                <i>
                  <em
                    style={{ width: `${getTierProgress(tier, progress)}%` }}
                  />
                </i>
                <strong>{getTierProgress(tier, progress)}%</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="panel mastery-panel">
          <p className="eyebrow">Current focus</p>
          <ShieldCheck size={34} />
          <h3>{currentTier.title}</h3>
          <strong>{getTierProgress(currentTier, progress)}% complete</strong>
          <p>
            Finish the next recommended activity to strengthen your core map.
          </p>
        </section>
      </div>
    </div>
  );
}

function FlashCardsView({ onOpenActivity }) {
  return (
    <div className="page flashcards-page">
      <section className="flashcards-hero">
        <div>
          <span className="status-pill">
            <i /> Cumulative recall
          </span>
          <p className="eyebrow">Flash Cards</p>
          <h2>Shuffle the whole Security+ deck.</h2>
          <p>
            This deck pulls every flashcard from every section into one
            cumulative review set. Each time you open it, the order is shuffled
            so you practice recall instead of memorizing a sequence.
          </p>
          <button
            className="button button--primary"
            onClick={() => onOpenActivity(masterFlashcardsActivity.id)}
          >
            Start shuffled deck <ArrowRight size={16} />
          </button>
        </div>
        <div className="flashcards-stat" aria-hidden="true">
          <Contact size={42} />
          <strong>{masterFlashcardsActivity.cards.length}</strong>
          <span>cards from all sections</span>
        </div>
      </section>
      <section className="flashcards-note">
        <Sparkles size={20} />
        <div>
          <strong>Best use</strong>
          <p>
            Use this after a tier checkpoint, before exam mode, or whenever you
            want a fast mixed review across terms, controls, attacks,
            architecture, operations, and governance.
          </p>
        </div>
      </section>
    </div>
  );
}

function StudyGuideView() {
  return (
    <div className="page study-guide-page">
      <section className="study-guide-hero">
        <div>
          <span className="status-pill">
            <i /> Study strategy
          </span>
          <p className="eyebrow">How to study for the Security+</p>
          <h2>
            Go from zero to Security+ ready.
            <br />
            <em>One guided step at a time.</em>
          </h2>
          <p>
            Sec+ Field Guide is built as a complete path from first principles
            through exam synthesis. Start at Tier 1, follow the guided
            recommendations, and let each lesson, scenario, flashcard deck,
            quiz, checkpoint, and practice exam build the next layer of your
            Security+ readiness.
          </p>
        </div>
        <div className="study-guide-mark">
          <GraduationCap size={42} />
          <span>
            Start here.
            <br />
            Build steadily.
          </span>
        </div>
      </section>
      <section className="study-principle">
        <p className="eyebrow">Our purpose</p>
        <h3>A complete Security+ learning path designed for beginners.</h3>
        <p>
          The course starts with foundational language, then moves into threats,
          architecture, operations, governance, and full exam practice. Use the
          app in order when you are new, or jump into weak objectives when you
          already have experience. The goal is not just memorization—it is
          helping you reason through Security+ scenarios with confidence.
        </p>
      </section>
      <div className="study-method-grid">
        <article>
          <span>
            <BookOpen size={20} />
          </span>
          <p className="eyebrow">01 · Start at the foundation</p>
          <h3>Follow the tiers in order</h3>
          <p>
            Begin with Tier 1 and let the app introduce the vocabulary,
            objectives, and decision patterns you need before moving into more
            technical domains.
          </p>
        </article>
        <article>
          <span>
            <Layers3 size={20} />
          </span>
          <p className="eyebrow">02 · Practice as you learn</p>
          <h3>Use every learning loop</h3>
          <p>
            Read the lesson, study the objective map, work the scenario, drill
            the flashcards, complete the coached check, and finish the section
            quiz before advancing.
          </p>
        </article>
        <article>
          <span>
            <Sparkles size={20} />
          </span>
          <p className="eyebrow">03 · Repair weak spots</p>
          <h3>Let results guide review</h3>
          <p>
            When a quiz, checkpoint, or exam exposes a weak objective, return
            to that lesson and its cards. Short targeted reviews turn misses
            into durable understanding.
          </p>
        </article>
        <article>
          <span>
            <CircleHelp size={20} />
          </span>
          <p className="eyebrow">04 · Prove readiness</p>
          <h3>Use checkpoints and exam mode</h3>
          <p>
            Complete each tier checkpoint, then use the comprehensive practice
            exam in exam mode. Read every explanation afterward and retest only
            after reviewing missed objectives.
          </p>
        </article>
      </div>
      <section className="study-rhythm">
        <div>
          <p className="eyebrow">A simple study rhythm</p>
          <h3>Learn → practice → test → remediate</h3>
        </div>
        <ol>
          <li>
            <strong>Learn</strong>
            <span>Read the next guided lesson and objective map.</span>
          </li>
          <li>
            <strong>Apply</strong>
            <span>Work the scenario and connect the concept to a realistic decision.</span>
          </li>
          <li>
            <strong>Retrieve</strong>
            <span>
              Review flashcards and answer questions without notes.
            </span>
          </li>
          <li>
            <strong>Adjust</strong>
            <span>
              Revisit weak objectives until you can explain the right answer
              and why the distractors are wrong.
            </span>
          </li>
        </ol>
      </section>
      <aside className="study-disclaimer">
        <ShieldCheck size={22} />
        <div>
          <strong>Preparation, not a guarantee.</strong>
          <p>
            This app is designed to take a learner from zero to Security+
            readiness, but no study tool can guarantee a passing score. Always
            compare your preparation against the current official CompTIA
            Security+ exam objectives and use the resources below when you want
            another explanation or extra practice.
          </p>
        </div>
      </aside>
      <footer className="additional-resources">
        <div>
          <p className="eyebrow">Continue learning</p>
          <h3>Additional resources</h3>
          <p>
            For comprehensive video instruction and another perspective on the
            exam objectives, consider exploring these independent educators.
          </p>
        </div>
        <nav aria-label="Additional Security+ study resources">
          <a
            href="https://www.youtube.com/watch?v=KiEptGbnEBc&list=PLG49S3nxzAnl4QDVqK-hOnoqcSKEIDDuv"
            target="_blank"
            rel="noreferrer"
          >
            Professor Messer <ArrowRight size={16} />
          </a>
          <a
            href="https://www.udemy.com/user/jason-dion/?kw=jason+di&src=sac"
            target="_blank"
            rel="noreferrer"
          >
            Jason Dion <ArrowRight size={16} />
          </a>
        </nav>
        <p className="resources-disclosure">
          Sec+ Field Guide and its creator are not affiliated with, endorsed by,
          or sponsored by CompTIA, Udemy, Jason Dion, or Professor Messer. All
          trademarks and course materials belong to their respective owners.
        </p>
      </footer>
    </div>
  );
}

function MeetDevelopersView() {
  const team = [
    {
      name: "David",
      specialty: "Specializes in network security and infrastructure.",
    },
    {
      name: "Ryan",
      specialty: "Specializes in Corporate Cyber Security and Data Integrity.",
    },
    {
      name: "Russ",
      specialty: "Specializes in all aspects of IT and cybersecurity.",
    },
  ];
  return (
    <div className="page developers-page">
      <section className="developers-hero">
        <div>
          <span className="status-pill">
            <i /> Built by practitioners
          </span>
          <p className="eyebrow">Meet the developers</p>
          <h2>Security+ study design shaped by real cybersecurity professionals.</h2>
          <p>
            This app was developed strategically by three cybersecurity
            professionals with a combined 30 years of cybersecurity expertise.
            Each developer currently holds an active Security+ certification,
            so the learning path, assessment style, and review flow were built
            with both exam readiness and practical security judgment in mind.
          </p>
        </div>
        <div className="developers-badge" aria-hidden="true">
          <UsersRound size={44} />
          <strong>30+</strong>
          <span>combined years of cybersecurity expertise</span>
        </div>
      </section>
      <section className="team-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Meet the team</p>
            <h3>Three certified security practitioners behind the guide.</h3>
          </div>
        </div>
        <div className="team-grid">
          {team.map((member) => (
            <article key={member.name} className="team-card">
              <div className="team-card__scene" aria-hidden="true">
                <div className="team-card__figure">
                  <span className="team-card__head" />
                  <span className="team-card__body" />
                  <span className="team-card__arm team-card__arm--left" />
                  <span className="team-card__arm team-card__arm--right" />
                  <span className="team-card__leg team-card__leg--left" />
                  <span className="team-card__leg team-card__leg--right" />
                </div>
                <div className="team-card__desk">
                  <span className="team-card__monitor" />
                  <span className="team-card__keyboard" />
                </div>
              </div>
              <h4>{member.name}</h4>
              <p>{member.specialty}</p>
              <small>Current Security+ certified</small>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function WhySecurityView() {
  const marketStats = [
    { value: "29%", label: "projected growth for information security analysts, 2024–2034" },
    { value: "$124,910", label: "2024 median annual pay for information security analysts" },
    { value: "1", label: "vendor-neutral certification that validates security foundations" },
  ];
  return (
    <div className="page info-page">
      <section className="info-hero">
        <div>
          <span className="status-pill">
            <i /> Career signal
          </span>
          <p className="eyebrow">Why the Security+?</p>
          <h2>Cybersecurity keeps growing because every organization now runs on risk.</h2>
          <p>
            Cloud platforms, remote work, identity systems, ransomware,
            compliance pressure, third-party dependencies, and constant data
            movement have made cybersecurity a core business function. Security+
            is a practical starting credential because it proves you understand
            the common language of controls, threats, architecture, operations,
            risk, and governance.
          </p>
        </div>
        <div className="info-stat-card">
          <TrendingUp size={42} />
          <strong>29%</strong>
          <span>projected job growth</span>
        </div>
      </section>
      <div className="info-stat-grid">
        {marketStats.map((stat) => (
          <article key={stat.value} className="panel info-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
      <section className="panel info-copy">
        <h3>Why it matters for new learners</h3>
        <p>
          Security+ can help a learner show baseline readiness for analyst,
          help desk, systems, network, cloud, compliance, and junior security
          roles. It does not replace hands-on experience, but it gives hiring
          teams a recognizable signal that you can reason about security
          fundamentals across technical and business contexts.
        </p>
        <small>
          Labor-market figures reference the U.S. Bureau of Labor Statistics
          Occupational Outlook Handbook for Information Security Analysts.
        </small>
      </section>
    </div>
  );
}

function WhyChooseAppView() {
  const questionCount = allActivities.flatMap((activity) => activity.questions ?? []).length;
  const appStats = [
    { value: tiers.length, label: "guided tiers from foundations to practice exam" },
    { value: allActivities.length, label: "learning activities, labs, checks, quizzes, and exams" },
    { value: questionCount, label: "assessment questions with explanations" },
    { value: masterFlashcardsActivity.cards.length, label: "flashcards in the cumulative deck" },
  ];
  return (
    <div className="page info-page">
      <section className="info-hero info-hero--app">
        <div>
          <span className="status-pill">
            <i /> Built for momentum
          </span>
          <p className="eyebrow">Why choose this app?</p>
          <h2>Security+ prep without the maze.</h2>
          <p>
            Sec+ Field Guide gives you a clear path, focused lessons, realistic
            scenarios, coached checks, cumulative review, and practice exams
            without burying you in fluff. It is designed to help you learn the
            objective, practice the decision, test the concept, and immediately
            know what to review next.
          </p>
        </div>
        <div className="info-stat-card">
          <Award size={42} />
          <strong>{questionCount}</strong>
          <span>questions with explanations</span>
        </div>
      </section>
      <div className="info-stat-grid">
        {appStats.map((stat) => (
          <article key={stat.label} className="panel info-stat">
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </article>
        ))}
      </div>
      <section className="panel info-copy">
        <h3>What we offer</h3>
        <p>
          You get a zero-to-Security+ learning path, original questions,
          shuffled flashcards, practice and exam modes, objective-based
          remediation, progress tracking, mobile-friendly layouts, and a simple
          interface that keeps the next step obvious. The goal is clarity:
          learn what matters, practice it often, and remove unnecessary noise
          from the cybersecurity learning process.
        </p>
      </section>
    </div>
  );
}

function LessonActivity({ activity, onComplete, completed }) {
  return (
    <>
      <div className="lesson-objective">
        <span>Domain {activity.domain}</span>
        <span>Objective {activity.objective}</span>
        <span>{activity.duration} min</span>
      </div>
      {activity.media && (
        <figure className="lesson-media">
          <img src={`${import.meta.env.BASE_URL}${activity.media.src.replace(/^\/+/, '')}`} alt={activity.media.alt} />
          <figcaption>{activity.media.caption}</figcaption>
        </figure>
      )}
      {activity.learningObjectives && (
        <section className="learning-objectives">
          <p className="eyebrow">By the end, you can</p>
          {activity.learningObjectives.map((objective) => (
            <span key={objective}>
              <Check size={14} />
              {objective}
            </span>
          ))}
        </section>
      )}
      <article className="lesson-body">
        {activity.content.map((paragraph, index) => (
          <div className="lesson-section" key={paragraph}>
            <span className="lesson-section__number">
              {String(index + 1).padStart(2, "0")}
            </span>
            <div className="lesson-section__content">
              {activity.headings?.[index] && (
                <h2>{activity.headings[index]}</h2>
              )}
              <p>{paragraph}</p>
            </div>
          </div>
        ))}
      </article>
      <div className="key-idea">
        <Sparkles size={19} />
        <div>
          <strong>Field note</strong>
          <p>
            Ask what the safeguard protects, how it works, and which risk it
            reduces. That reasoning transfers better than memorizing labels.
          </p>
        </div>
      </div>
      <button
        className="button button--primary activity-complete"
        onClick={onComplete}
      >
        {completed ? (
          <>
            <Check size={17} />
            Completed — continue
          </>
        ) : (
          <>
            Mark complete <ArrowRight size={17} />
          </>
        )}
      </button>
    </>
  );
}

function FlashcardActivity({ activity, onComplete, completed }) {
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = activity.cards[index];
  return (
    <>
      <p className="activity-instruction">
        Tap the card to reveal the meaning. Move at your own pace—this is
        retrieval practice, not a test.
      </p>
      <button
        className={`flashcard ${flipped ? "flashcard--flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
      >
        <span>
          {flipped
            ? "Definition"
            : `Term ${index + 1} of ${activity.cards.length}`}
        </span>
        <strong>{flipped ? card[1] : card[0]}</strong>
        <small>{flipped ? "Tap to see term" : "Tap to reveal"}</small>
      </button>
      <div className="flashcard-controls">
        <button
          className="button button--ghost"
          disabled={index === 0}
          onClick={() => {
            setIndex(index - 1);
            setFlipped(false);
          }}
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        {index < activity.cards.length - 1 ? (
          <button
            className="button button--primary"
            onClick={() => {
              setIndex(index + 1);
              setFlipped(false);
            }}
          >
            Next card <ArrowRight size={16} />
          </button>
        ) : (
          <button className="button button--primary" onClick={onComplete}>
            {completed ? "Review complete" : "Complete deck"}{" "}
            <Check size={16} />
          </button>
        )}
      </div>
    </>
  );
}

function QuizActivity({ activity, onComplete }) {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const question = activity.questions[index];
  const answered = selected !== null;
  const choose = (choice) => {
    if (answered) return;
    setSelected(choice);
    if (choice === question.correctIndex) setCorrect(correct + 1);
  };
  const advance = () => {
    if (index === activity.questions.length - 1) {
      setFinished(true);
      return;
    }
    setIndex(index + 1);
    setSelected(null);
  };
  if (finished) {
    const score = Math.round((correct / activity.questions.length) * 100);
    return (
      <div className="activity-results">
        <div className="results-mark">
          <Trophy size={38} />
        </div>
        <p className="eyebrow">
          {activity.type === "checkpoint"
            ? "Checkpoint complete"
            : "Knowledge check complete"}
        </p>
        <h2>{score >= 80 ? "Strong signal." : "Useful reconnaissance."}</h2>
        <p>
          You scored{" "}
          <strong>
            {correct} of {activity.questions.length}
          </strong>
          . Incorrect answers are information, not punishment.
        </p>
        <div className="results-score">
          <strong>{score}%</strong>
          <span>accuracy</span>
        </div>
        <button
          className="button button--primary"
          onClick={() => onComplete(score / 100)}
        >
          Save progress <ArrowRight size={16} />
        </button>
      </div>
    );
  }
  return (
    <>
      <div className="quiz-head">
        <div>
          <p className="eyebrow">
            Question {index + 1} of {activity.questions.length}
          </p>
          <span>
            Domain {question.domain} · Objective {question.objective}
          </span>
        </div>
        <div className="quiz-dots">
          {activity.questions.map((_, i) => (
            <i key={i} className={i <= index ? "active" : ""} />
          ))}
        </div>
      </div>
      <h2 className="question-title">{question.prompt}</h2>
      <div className="answers">
        {question.options.map((option, choice) => {
          let state = "";
          if (answered && choice === question.correctIndex)
            state = "answer--correct";
          else if (answered && choice === selected) state = "answer--wrong";
          return (
            <button
              key={option}
              className={`answer ${state}`}
              onClick={() => choose(choice)}
            >
              <span>{String.fromCharCode(65 + choice)}</span>
              {option}
              {answered && choice === question.correctIndex && (
                <CheckCircle2 size={19} />
              )}
            </button>
          );
        })}
      </div>
      {answered && (
        <div
          className={`explanation ${selected === question.correctIndex ? "explanation--correct" : ""}`}
          role="status"
        >
          <strong>
            {selected === question.correctIndex
              ? "Correct — clean read."
              : "Not quite. Here’s the distinction."}
          </strong>
          <p>{question.explanation}</p>
        </div>
      )}
      <div className="quiz-footer">
        <span>{correct} correct so far</span>
        <button
          className="button button--primary"
          disabled={!answered}
          onClick={advance}
        >
          {index === activity.questions.length - 1
            ? "See results"
            : "Next question"}{" "}
          <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

function ActivityView({ activity, progress, onClose, onComplete }) {
  const completed = progress.completedActivityIds.includes(activity.id);
  const hasContent = activity.content || activity.cards || activity.questions;
  const [readingProgress, setReadingProgress] = useState(0);
  const updateReadingProgress = (event) => {
    const element = event.currentTarget;
    const available = element.scrollHeight - element.clientHeight;
    setReadingProgress(
      available > 0
        ? Math.min(100, Math.round((element.scrollTop / available) * 100))
        : 100,
    );
  };
  return (
    <div className="activity-overlay" onScroll={updateReadingProgress}>
      <main className="activity-view">
        <header className="activity-header">
          <button className="back-button" onClick={onClose}>
            <ArrowLeft size={16} /> Exit activity
          </button>
          <span className="activity-header__type">
            {typeLabels[activity.type]}
          </span>
          <i
            className="reading-progress"
            style={{ width: `${readingProgress}%` }}
          />
        </header>
        <div className="activity-shell">
          <div className="activity-title">
            <p className="eyebrow">
              Tier {activity.tierNumber} · {activity.difficulty}
            </p>
            <h1>{activity.title}</h1>
            <p>{activity.summary}</p>
          </div>
          {!hasContent ? (
            <div className="preview-state">
              <Layers3 size={35} />
              <p className="eyebrow">Curriculum preview</p>
              <h2>This activity has its place on the trail.</h2>
              <p>
                Its full learning content arrives after the complete Tier 1
                experience is validated. You can still explore every tier and
                see how the path fits together.
              </p>
              <button className="button button--primary" onClick={onClose}>
                Return to tier <ArrowRight size={16} />
              </button>
            </div>
          ) : activity.type === "lesson" ? (
            <LessonActivity
              activity={activity}
              completed={completed}
              onComplete={() => onComplete(activity)}
            />
          ) : activity.type === "flashcards" ? (
            <FlashcardActivity
              activity={activity}
              completed={completed}
              onComplete={() => onComplete(activity)}
            />
          ) : (
            <QuizActivity
              activity={activity}
              onComplete={(score) => onComplete(activity, score)}
            />
          )}
        </div>
      </main>
    </div>
  );
}

function CompletionToast({ activity, onClose }) {
  return (
    <div className="completion-toast" role="status">
      <span>
        <Check size={18} />
      </span>
      <div>
        <strong>
          {activity.type === "checkpoint"
            ? "Tier checkpoint complete!"
            : "Progress saved"}
        </strong>
        <small>{activity.title} · keep the momentum gentle.</small>
      </div>
      <button onClick={onClose} aria-label="Dismiss">
        <X size={16} />
      </button>
    </div>
  );
}

export default function App() {
  const [progress, setProgress] = useState(() => progressRepository.load());
  const [active, setActive] = useState("dashboard");
  const [selectedTierId, setSelectedTierId] = useState(null);
  const [activityId, setActivityId] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastActivity, setToastActivity] = useState(null);
  const [showWelcome, setShowWelcome] = useState(
    () => !progressRepository.load().completedOnboarding,
  );
  const activityTriggerRef = useRef(null);
  const titles = useMemo(
    () => Object.fromEntries(navItems.map((item) => [item.id, item.label])),
    [],
  );

  const closeActivity = () => {
    setActivityId(null);
    window.requestAnimationFrame(() => activityTriggerRef.current?.focus?.());
  };
  useEffect(() => {
    const handleKey = (event) => {
      if (event.key === "Escape") {
        if (activityId) closeActivity();
        setMenuOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [activityId]);
  const persist = (next) => {
    const saved = progressRepository.save(next);
    setProgress(saved);
    return saved;
  };
  const finishOnboarding = (destination) => {
    persist({ ...progress, completedOnboarding: true });
    setShowWelcome(false);
    if (destination === "path") setActive("path");
  };
  const openTier = (tierId) => {
    setSelectedTierId(tierId);
    setActive("path");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const openActivity = (id) => {
    activityTriggerRef.current = document.activeElement;
    setSearchQuery("");
    setActivityId(id);
  };
  const completeActivity = (activity, result = null, nextActivityId = null) => {
    const normalizedResult =
      typeof result === "number"
        ? { score: result }
        : (result ?? { score: null });
    const alreadyDone = progress.completedActivityIds.includes(activity.id);
    const completedActivityIds = alreadyDone
      ? progress.completedActivityIds
      : [...progress.completedActivityIds, activity.id];
    const completedAt = new Date().toISOString();
    const savedResult = {
      ...normalizedResult,
      attempts: (progress.results[activity.id]?.attempts ?? 0) + 1,
      completedAt,
    };
    const nextDraft = {
      ...progress,
      completedActivityIds,
      totalStudyMinutes:
        progress.totalStudyMinutes + (alreadyDone ? 0 : activity.duration),
      lastStudiedAt: completedAt,
      results: { ...progress.results, [activity.id]: savedResult },
      scenarioResults:
        activity.type === "scenario"
          ? { ...progress.scenarioResults, [activity.id]: savedResult }
          : progress.scenarioResults,
      examAttempts:
        activity.type === "exam"
          ? [
              ...progress.examAttempts,
              { activityId: activity.id, ...savedResult },
            ]
          : progress.examAttempts,
    };
    const nextActivity = getRecommendation(nextDraft).activity;
    persist({ ...nextDraft, currentActivityId: nextActivity?.id ?? null });
    setActivityId(nextActivityId);
    setToastActivity(activity);
    window.setTimeout(() => setToastActivity(null), 4200);
  };
  const activity = activityId ? getActivity(activityId) : null;
  const activityIndex = activity
    ? allActivities.findIndex((candidate) => candidate.id === activity.id)
    : -1;
  const nextActivity =
    activityIndex >= 0 ? (allActivities[activityIndex + 1] ?? null) : null;
  const selectedTier = selectedTierId ? getTier(selectedTierId) : null;
  const topbarRecommendation = getRecommendation(progress);

  const activateSearch = () => {
    setActive("path");
    setSelectedTierId(null);
  };
  const continueLearning = () => {
    const next = topbarRecommendation.activity;
    if (!next) return;
    setSelectedTierId(next.tierId);
    openActivity(next.id);
  };
  return (
    <div className="app-shell">
      <Sidebar
        active={active}
        onNavigate={(id) => {
          setActive(id);
          setSelectedTierId(null);
        }}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        progress={progress}
      />
      {menuOpen && (
        <button
          className="sidebar-scrim"
          onClick={() => setMenuOpen(false)}
          aria-label="Close navigation overlay"
        />
      )}
      <main className="main">
        <Topbar
          title={titles[active]}
          onMenu={() => setMenuOpen(true)}
          query={searchQuery}
          onQueryChange={setSearchQuery}
          onSearchActivate={activateSearch}
          recommendation={topbarRecommendation}
          onContinue={continueLearning}
        />
        {active === "dashboard" && (
          <Dashboard
            progress={progress}
            onOpenTier={openTier}
            onOpenActivity={openActivity}
            onNavigate={(id) => {
              setActive(id);
              setSelectedTierId(null);
            }}
          />
        )}
        {active === "path" &&
          (selectedTier ? (
            <TierDetail
              tier={selectedTier}
              progress={progress}
              onBack={() => setSelectedTierId(null)}
              onOpenActivity={openActivity}
            />
          ) : (
            <PathView
              progress={progress}
              onOpenTier={openTier}
              onOpenActivity={openActivity}
              query={searchQuery}
              onClearQuery={() => setSearchQuery("")}
            />
          ))}
        {active === "domains" && <DomainsView progress={progress} />}
        {active === "flashcards" && (
          <FlashCardsView onOpenActivity={openActivity} />
        )}
        {active === "progress" && (
          <ProgressView progress={progress} />
        )}
        {active === "study-guide" && <StudyGuideView />}
        {active === "developers" && <MeetDevelopersView />}
        {active === "why-security" && <WhySecurityView />}
        {active === "why-app" && <WhyChooseAppView />}
      </main>
      {showWelcome && (
        <Onboarding
          onStart={() => finishOnboarding("start")}
          onExplore={() => finishOnboarding("path")}
        />
      )}
      {activity && (
        <LearningActivityView
          activity={activity}
          nextActivity={nextActivity}
          progress={progress}
          onClose={closeActivity}
          onHome={() => {
            setActivityId(null);
            setSelectedTierId(null);
            setActive("dashboard");
            window.scrollTo({ top: 0 });
          }}
          onOpenNext={setActivityId}
          onComplete={completeActivity}
        />
      )}
      {toastActivity && (
        <CompletionToast
          activity={toastActivity}
          onClose={() => setToastActivity(null)}
        />
      )}
    </div>
  );
}
