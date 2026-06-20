import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Layers3,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  Trophy,
} from "lucide-react";
import { activityTypeLabels as typeLabels } from "../../content/advancedTiers.js";
import { allActivities, getTier } from "../../content/studyData.js";
import { getObjectiveVisual } from "../../content/objectiveVisuals.js";
import {
  isValidQuestionOrder,
  shuffleQuestionOrder,
} from "../../lib/examOrder.js";

function ObjectiveVisual({ visual }) {
  if (!visual) return null;
  const summary = `${visual.title}: ${visual.items.map((item) => `${item.label}, ${item.value}`).join("; ")}`;
  return (
    <section className={`objective-visual objective-visual--${visual.theme}`} aria-label={summary}>
      <div className="objective-visual__header">
        <span className="eyebrow">Objective map</span>
        <h2>{visual.title}</h2>
        <p>{visual.caption}</p>
      </div>
      <div className="objective-visual__diagram" aria-hidden="true">
        {visual.items.map((item, index) => (
          <div className="objective-visual__node" key={`${visual.title}-${item.label}`} style={{ "--node-index": index }}>
            <b>{item.label}</b>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

function QuestionFeedback({ correct, explanation }) {
  return (
    <div
      className={`explanation ${correct ? "explanation--correct" : ""}`}
      role="status"
    >
      <span className="feedback-kicker">
        {correct ? "Correct answer" : "Review before moving on"}
      </span>
      <strong>Exam takeaway</strong>
      <p>{explanation}</p>
      {!correct && (
        <small>
          Slow down here: this is exactly the kind of distinction Security+
          likes to test.
        </small>
      )}
    </div>
  );
}

export function LessonActivity({ activity, onComplete, completed, nextTitle }) {
  const objectiveVisual = getObjectiveVisual(activity);
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
      <ObjectiveVisual visual={objectiveVisual} />

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
        {nextTitle ? (
          <>
            {completed ? "Continue" : "Complete"} · {nextTitle}
            <ArrowRight size={17} />
          </>
        ) : (
          <>
            <Check size={17} />
            Complete journey
          </>
        )}
      </button>
    </>
  );
}

export function FlashcardActivity({
  activity,
  onComplete,
  completed,
  nextTitle,
}) {
  const [shuffleNonce, setShuffleNonce] = useState(0);
  const cards = useMemo(() => {
    if (!activity.shuffleCards) return activity.cards;
    const shuffled = [...activity.cards];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
    }
    return shuffled;
  }, [activity.id, activity.cards, activity.shuffleCards, shuffleNonce]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const card = cards[index];
  const cardsRemaining = cards.length - index - 1;
  const restartDeck = () => {
    setIndex(0);
    setFlipped(false);
  };
  const shuffleAgain = () => {
    setShuffleNonce((value) => value + 1);
    restartDeck();
  };
  return (
    <>
      <p className="activity-instruction">
        Tap the card to reveal the meaning. Space or Enter flips the focused
        card. Move at your own pace—this is retrieval practice, not a test.
      </p>
      <div className="flashcard-session" aria-live="polite">
        <span>
          Card {index + 1} of {cards.length}
        </span>
        <span>{cardsRemaining} remaining</span>
        <span>Space / Enter to flip</span>
      </div>
      <button
        className={`flashcard ${flipped ? "flashcard--flipped" : ""}`}
        onClick={() => setFlipped(!flipped)}
        aria-pressed={flipped}
        aria-label={`${flipped ? "Definition" : "Term"} card ${index + 1} of ${cards.length}. ${flipped ? "Activate to show term." : "Activate to reveal definition."}`}
      >
        <span>
          {flipped
            ? "Definition"
            : `Term ${index + 1} of ${cards.length}`}
        </span>
        <strong>{flipped ? card[1] : card[0]}</strong>
        <small>{flipped ? "Definition shown · tap to see term" : "Tap, Space, or Enter to reveal"}</small>
      </button>
      <div className="flashcard-tools">
        <button className="text-button" onClick={restartDeck}>
          <RotateCcw size={14} />
          Restart deck
        </button>
        {activity.shuffleCards && (
          <button className="text-button" onClick={shuffleAgain}>
            <Sparkles size={14} />
            Shuffle again
          </button>
        )}
      </div>
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
        {index < cards.length - 1 ? (
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
            {nextTitle ? (
              <>
                {completed ? "Continue" : "Complete deck"}{" "}
                <ArrowRight size={16} />
              </>
            ) : (
              <>
                <Check size={16} />
                Complete journey
              </>
            )}
          </button>
        )}
      </div>
    </>
  );
}

export function QuizActivity({ activity, onComplete, nextTitle }) {
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
          {nextTitle ? (
            <>
              Save & continue <ArrowRight size={16} />
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Save & return to Field HQ
            </>
          )}
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
        <QuestionFeedback
          correct={selected === question.correctIndex}
          explanation={question.explanation}
        />
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

export function ScenarioActivity({ activity, onComplete, nextTitle }) {
  const [selected, setSelected] = useState([]);
  const [finished, setFinished] = useState(false);
  const toggle = (id) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  const correct = activity.actions.filter(
    (action) => action.correct && selected.includes(action.id),
  ).length;
  const wrong = activity.actions.filter(
    (action) => !action.correct && selected.includes(action.id),
  ).length;
  const possible = activity.actions.filter((action) => action.correct).length;
  const score = Math.max(0, (correct - wrong) / possible);
  const recommendedSelected = activity.actions.filter(
    (action) => action.correct && selected.includes(action.id),
  );
  const recommendedMissed = activity.actions.filter(
    (action) => action.correct && !selected.includes(action.id),
  );
  const unnecessarySelected = activity.actions.filter(
    (action) => !action.correct && selected.includes(action.id),
  );
  if (finished)
    return (
      <div className="activity-results">
        <div className="results-mark">
          <Trophy size={38} />
        </div>
        <p className="eyebrow">Scenario debrief</p>
        <h2>{score >= 0.8 ? "Defensible call." : "Useful rehearsal."}</h2>
        <p>{activity.explanation}</p>
        <div className="scenario-scorecard" aria-label="Scenario decision breakdown">
          <article>
            <strong>{recommendedSelected.length}</strong>
            <span>recommended selected</span>
          </article>
          <article>
            <strong>{recommendedMissed.length}</strong>
            <span>recommended missed</span>
          </article>
          <article>
            <strong>{unnecessarySelected.length}</strong>
            <span>unnecessary selected</span>
          </article>
        </div>
        <div className="scenario-review">
          <section>
            <h3>Recommended and selected</h3>
            {recommendedSelected.length ? (
              recommendedSelected.map((action) => (
                <p key={action.id}>{action.label}</p>
              ))
            ) : (
              <p>No recommended actions selected.</p>
            )}
          </section>
          <section>
            <h3>Recommended but missed</h3>
            {recommendedMissed.length ? (
              recommendedMissed.map((action) => (
                <p key={action.id}>{action.label}</p>
              ))
            ) : (
              <p>No recommended actions missed.</p>
            )}
          </section>
          <section>
            <h3>Selected but unnecessary</h3>
            {unnecessarySelected.length ? (
              unnecessarySelected.map((action) => (
                <p key={action.id}>{action.label}</p>
              ))
            ) : (
              <p>No unnecessary actions selected.</p>
            )}
          </section>
        </div>
        <div className="results-score">
          <strong>{Math.round(score * 100)}%</strong>
          <span>decision score</span>
        </div>
        <button
          className="button button--primary"
          onClick={() => onComplete({ score, selectedActions: selected })}
        >
          {nextTitle ? (
            <>
              Save & continue <ArrowRight size={16} />
            </>
          ) : (
            <>
              <ShieldCheck size={16} />
              Save & return to Field HQ
            </>
          )}
        </button>
      </div>
    );
  return (
    <>
      <section className="scenario-brief">
        <p className="eyebrow">Mission</p>
        <p>{activity.instructions}</p>
        {activity.evidence.map((item) => (
          <div key={item} className="scenario-evidence">
            {item}
          </div>
        ))}
      </section>
      <h2 className="question-title">Choose the best coordinated actions</h2>
      <div className="answers">
        {activity.actions.map((action, index) => (
          <button
            key={action.id}
            className={`answer ${selected.includes(action.id) ? "answer--selected" : ""}`}
            aria-pressed={selected.includes(action.id)}
            onClick={() => toggle(action.id)}
          >
            <span>{letters[index] ?? index + 1}</span>
            {action.label}
          </button>
        ))}
      </div>
      <details className="scenario-hints">
        <summary>Need a hint?</summary>
        {activity.hints.map((hint) => (
          <p key={hint}>{hint}</p>
        ))}
      </details>
      <div className="quiz-footer">
        <span>{selected.length} actions selected</span>
        <button
          className="button button--primary"
          disabled={!selected.length}
          onClick={() => setFinished(true)}
        >
          Submit decision <ArrowRight size={16} />
        </button>
      </div>
    </>
  );
}

const letters = ["A", "B", "C", "D", "E", "F"];

export function ExamActivity({ activity, onComplete, nextTitle }) {
  const storageKey = `secplus-exam-v3-${activity.id}`;
  const initial = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) ?? {};
    } catch {
      return {};
    }
  }, [storageKey]);
  const selectableMode = activity.config.allowModeSelection === true;
  const [mode, setMode] = useState(
    initial.mode ?? (selectableMode ? null : "exam"),
  );
  const [questionOrder, setQuestionOrder] = useState(() =>
    isValidQuestionOrder(initial.questionOrder, activity.questions.length)
      ? initial.questionOrder
      : selectableMode
        ? null
        : shuffleQuestionOrder(activity.questions.length),
  );
  const [answers, setAnswers] = useState(initial.answers ?? {});
  const [index, setIndex] = useState(initial.index ?? 0);
  const [endsAt, setEndsAt] = useState(
    initial.endsAt ??
      (selectableMode
        ? null
        : Date.now() + activity.config.durationMinutes * 60000),
  );
  const [remaining, setRemaining] = useState(
    endsAt
      ? Math.max(0, endsAt - Date.now())
      : activity.config.durationMinutes * 60000,
  );
  const [revealed, setRevealed] = useState(initial.revealed ?? false);
  const [finished, setFinished] = useState(false);
  useEffect(() => {
    localStorage.setItem(
      storageKey,
      JSON.stringify({ mode, questionOrder, answers, index, endsAt, revealed }),
    );
    if (!endsAt) return undefined;
    const timer = setInterval(
      () => setRemaining(Math.max(0, endsAt - Date.now())),
      1000,
    );
    return () => clearInterval(timer);
  }, [mode, questionOrder, answers, index, endsAt, revealed, storageKey]);
  useEffect(() => {
    if (endsAt && remaining === 0 && !finished) setFinished(true);
  }, [endsAt, remaining, finished]);
  const orderedQuestions = useMemo(
    () =>
      (questionOrder ?? []).map(
        (questionIndex) => activity.questions[questionIndex],
      ),
    [activity.questions, questionOrder],
  );
  const question = orderedQuestions[index];
  const result = useMemo(() => {
    const misses = [];
    const domains = {};
    let correct = 0;
    orderedQuestions.forEach((item, questionIndex) => {
      const right = answers[questionIndex] === item.correctIndex;
      if (right) correct += 1;
      else misses.push(item.objective);
      const bucket = domains[item.domain] ?? { correct: 0, total: 0 };
      bucket.total += 1;
      if (right) bucket.correct += 1;
      domains[item.domain] = bucket;
    });
    return {
      score: orderedQuestions.length ? correct / orderedQuestions.length : 0,
      correct,
      objectiveMisses: [...new Set(misses)],
      domainScores: Object.fromEntries(
        Object.entries(domains).map(([domain, value]) => [
          domain,
          value.correct / value.total,
        ]),
      ),
      elapsedSeconds: Math.round(
        (activity.config.durationMinutes * 60000 - remaining) / 1000,
      ),
    };
  }, [activity.config.durationMinutes, answers, orderedQuestions, remaining]);
  const begin = (selectedMode) => {
    const deadline = Date.now() + activity.config.durationMinutes * 60000;
    setMode(selectedMode);
    setQuestionOrder(shuffleQuestionOrder(activity.questions.length));
    setAnswers({});
    setIndex(0);
    setRevealed(false);
    setEndsAt(deadline);
    setRemaining(activity.config.durationMinutes * 60000);
  };
  const move = (nextIndex) => {
    setIndex(nextIndex);
    setRevealed(false);
  };
  if (!mode)
    return (
      <section className="exam-mode-picker">
        <p className="eyebrow">Choose your run</p>
        <h2>How do you want to train?</h2>
        <p>
          Both modes use the same 80-question bank and save your final result.
        </p>
        <div>
          <button onClick={() => begin("practice")}>
            <Sparkles size={24} />
            <strong>Practice Mode</strong>
            <span>
              Select an answer, reveal it immediately, and study the explanation
              before continuing.
            </span>
            <b>
              Learn as you go <ArrowRight size={15} />
            </b>
          </button>
          <button onClick={() => begin("exam")}>
            <Trophy size={24} />
            <strong>Exam Mode</strong>
            <span>
              No answer feedback or score appears until all questions are
              submitted.
            </span>
            <b>
              Simulate the exam <ArrowRight size={15} />
            </b>
          </button>
        </div>
      </section>
    );
  if (finished)
    return (
      <div className="activity-results">
        <div className="results-mark">
          <Trophy size={38} />
        </div>
        <p className="eyebrow">
          {mode === "practice"
            ? "Practice run complete"
            : "Practice exam complete"}
        </p>
        <h2>
          {result.score >= activity.config.passThreshold
            ? "Readiness confirmed."
            : "Your review map is ready."}
        </h2>
        <p>
          You answered{" "}
          <strong>
            {result.correct} of {activity.questions.length}
          </strong>{" "}
          correctly. Review priority:{" "}
          {result.objectiveMisses.slice(0, 5).join(", ") || "none"}.
        </p>
        <div className="results-score">
          <strong>{Math.round(result.score * 100)}%</strong>
          <span>accuracy</span>
        </div>
        <button
          className="button button--primary"
          onClick={() => {
            localStorage.removeItem(storageKey);
            onComplete({ ...result, mode });
          }}
        >
          Save result <ArrowRight size={16} />
        </button>
      </div>
    );
  return (
    <>
      <div className="exam-status">
        <strong>
          {String(Math.floor(remaining / 60000)).padStart(2, "0")}:
          {String(Math.floor(remaining / 1000) % 60).padStart(2, "0")}
        </strong>
        <span>
          {mode === "practice" ? "Practice Mode" : "Exam Mode"} ·{" "}
          {Object.keys(answers).length} of {activity.questions.length} answered
        </span>
      </div>
      <div className="quiz-head">
        <div>
          <p className="eyebrow">
            Question {index + 1} of {activity.questions.length}
          </p>
          <span>
            Domain {question.domain} · Objective {question.objective}
          </span>
        </div>
      </div>
      <h2 className="question-title">{question.prompt}</h2>
      <div className="answers">
        {question.options.map((option, choice) => {
          let state = answers[index] === choice ? "answer--selected" : "";
          if (
            mode === "practice" &&
            revealed &&
            choice === question.correctIndex
          )
            state = "answer--correct";
          else if (mode === "practice" && revealed && choice === answers[index])
            state = "answer--wrong";
          return (
            <button
              key={option}
              className={`answer ${state}`}
              aria-pressed={answers[index] === choice}
              disabled={mode === "practice" && revealed}
              onClick={() => {
                setAnswers({ ...answers, [index]: choice });
                setRevealed(false);
              }}
            >
              <span>{letters[choice]}</span>
              {option}
              {mode === "practice" &&
                revealed &&
                choice === question.correctIndex && <CheckCircle2 size={19} />}
            </button>
          );
        })}
      </div>
      {mode === "practice" && revealed && (
        <QuestionFeedback
          correct={answers[index] === question.correctIndex}
          explanation={question.explanation}
        />
      )}
      {mode === "practice" && !revealed && (
        <div className="practice-reveal">
          <button
            className="button button--primary"
            disabled={answers[index] === undefined}
            onClick={() => setRevealed(true)}
          >
            Show answer
          </button>
        </div>
      )}
      <div className="exam-nav">
        <button
          className="button button--ghost"
          disabled={index === 0}
          onClick={() => move(index - 1)}
        >
          <ArrowLeft size={16} />
          Previous
        </button>
        {index < activity.questions.length - 1 ? (
          <button
            className="button button--primary"
            disabled={mode === "practice" && !revealed}
            onClick={() => move(index + 1)}
          >
            Next <ArrowRight size={16} />
          </button>
        ) : (
          <button
            className="button button--primary"
            disabled={mode === "practice" && !revealed}
            onClick={() => setFinished(true)}
          >
            Submit {mode === "practice" ? "practice" : "exam"}
          </button>
        )}
      </div>
    </>
  );
}

export function ActivityView({
  activity,
  nextActivity,
  progress,
  onClose,
  onHome,
  onComplete,
  onOpenNext,
}) {
  const completed = progress.completedActivityIds.includes(activity.id);
  const hasContent =
    activity.content ||
    activity.cards ||
    activity.questions ||
    activity.actions;
  const tier = getTier(`tier-${activity.tierNumber}`);
  const activityPosition =
    allActivities.findIndex((candidate) => candidate.id === activity.id) + 1;
  const [readingProgress, setReadingProgress] = useState(0);
  const dialogRef = useRef(null);
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
  }, [activity.id]);
  const trapFocus = (event) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...dialogRef.current.querySelectorAll(
        'button:not([disabled]),a[href],input:not([disabled]),[tabindex]:not([tabindex="-1"])',
      ),
    ];
    if (!focusable.length) return;
    const first = focusable[0],
      last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };
  const updateReadingProgress = (event) => {
    const element = event.currentTarget;
    const available = element.scrollHeight - element.clientHeight;
    setReadingProgress(
      available > 0
        ? Math.min(100, Math.round((element.scrollTop / available) * 100))
        : 100,
    );
  };
  const finish = (result = null) =>
    onComplete(activity, result, nextActivity?.id);
  return (
    <div
      ref={dialogRef}
      className="activity-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="activity-title"
      onKeyDown={trapFocus}
      onScroll={updateReadingProgress}
    >
      <main className="activity-view">
        <header className="activity-header">
          <button ref={closeRef} className="back-button" onClick={onClose}>
            <ArrowLeft size={16} />
            Exit
          </button>
          <div className="activity-orientation" aria-label="Activity location">
            <span>
              Tier {activity.tierNumber} · {tier?.title ?? "Security+ Path"}
            </span>
            <strong>
              Activity {activityPosition} of {allActivities.length}
            </strong>
            <span>
              {typeLabels[activity.type]} · {activity.duration} min
            </span>
          </div>
          <div className="activity-header__actions">
            {completed && nextActivity && (
              <button
                className="activity-next"
                onClick={() => onOpenNext(nextActivity.id)}
              >
                Next
                <ArrowRight size={14} />
              </button>
            )}
            <button
              className="field-hq"
              onClick={onHome}
              aria-label="Return to Field HQ home"
            >
              <span>
                <ShieldCheck size={16} />
              </span>
              <b>FIELD HQ</b>
            </button>
          </div>
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
            <h1 id="activity-title">{activity.title}</h1>
            <p>{activity.summary}</p>
          </div>
          {!hasContent ? (
            <div className="preview-state">
              <Layers3 size={35} />
              <p className="eyebrow">Curriculum preview</p>
              <h2>This activity has its place on the trail.</h2>
              <p>Its full learning content arrives after validation.</p>
              <button className="button button--primary" onClick={onClose}>
                Return to tier <ArrowRight size={16} />
              </button>
            </div>
          ) : activity.type === "lesson" ? (
            <LessonActivity
              activity={activity}
              completed={completed}
              nextTitle={nextActivity?.title}
              onComplete={() => finish()}
            />
          ) : activity.type === "flashcards" ? (
            <FlashcardActivity
              activity={activity}
              completed={completed}
              nextTitle={nextActivity?.title}
              onComplete={() => finish()}
            />
          ) : activity.type === "scenario" ? (
            <ScenarioActivity
              activity={activity}
              nextTitle={nextActivity?.title}
              onComplete={finish}
            />
          ) : activity.type === "exam" ? (
            <ExamActivity
              activity={activity}
              nextTitle={nextActivity?.title}
              onComplete={finish}
            />
          ) : (
            <QuizActivity
              activity={activity}
              nextTitle={nextActivity?.title}
              onComplete={finish}
            />
          )}
        </div>
      </main>
    </div>
  );
}
