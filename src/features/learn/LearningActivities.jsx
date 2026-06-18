import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Layers3, ShieldCheck, Sparkles, Trophy } from 'lucide-react'
import { activityTypeLabels as typeLabels } from '../../content/advancedTiers.js'


export function LessonActivity({ activity, onComplete, completed, nextTitle }) {
  return <><div className="lesson-objective"><span>Domain {activity.domain}</span><span>Objective {activity.objective}</span><span>{activity.duration} min</span></div>{activity.media && <figure className="lesson-media"><img src={activity.media.src} alt={activity.media.alt} /><figcaption>{activity.media.caption}</figcaption></figure>}{activity.learningObjectives && <section className="learning-objectives"><p className="eyebrow">By the end, you can</p>{activity.learningObjectives.map((objective) => <span key={objective}><Check size={14} />{objective}</span>)}</section>}<article className="lesson-body">{activity.content.map((paragraph, index) => <div className="lesson-section" key={paragraph}><span className="lesson-section__number">{String(index + 1).padStart(2, '0')}</span><div className="lesson-section__content">{activity.headings?.[index] && <h2>{activity.headings[index]}</h2>}<p>{paragraph}</p></div></div>)}</article><div className="key-idea"><Sparkles size={19} /><div><strong>Field note</strong><p>Ask what the safeguard protects, how it works, and which risk it reduces. That reasoning transfers better than memorizing labels.</p></div></div><button className="button button--primary activity-complete" onClick={onComplete}>{nextTitle ? <>{completed ? 'Continue' : 'Complete'} · {nextTitle}<ArrowRight size={17}/></> : <><Check size={17}/>Complete journey</>}</button></>
}

export function FlashcardActivity({ activity, onComplete, completed, nextTitle }) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const card = activity.cards[index]
  return <><p className="activity-instruction">Tap the card to reveal the meaning. Move at your own pace—this is retrieval practice, not a test.</p><button className={`flashcard ${flipped ? 'flashcard--flipped' : ''}`} onClick={() => setFlipped(!flipped)}><span>{flipped ? 'Definition' : `Term ${index + 1} of ${activity.cards.length}`}</span><strong>{flipped ? card[1] : card[0]}</strong><small>{flipped ? 'Tap to see term' : 'Tap to reveal'}</small></button><div className="flashcard-controls"><button className="button button--ghost" disabled={index === 0} onClick={() => { setIndex(index - 1); setFlipped(false) }}><ArrowLeft size={16} />Previous</button>{index < activity.cards.length - 1 ? <button className="button button--primary" onClick={() => { setIndex(index + 1); setFlipped(false) }}>Next card <ArrowRight size={16} /></button> : <button className="button button--primary" onClick={onComplete}>{nextTitle ? <>{completed?'Continue':'Complete deck'} <ArrowRight size={16}/></> : <><Check size={16}/>Complete journey</>}</button>}</div></>
}

export function QuizActivity({ activity, onComplete, nextTitle }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState(null)
  const [correct, setCorrect] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = activity.questions[index]
  const answered = selected !== null
  const choose = (choice) => { if (answered) return; setSelected(choice); if (choice === question.correctIndex) setCorrect(correct + 1) }
  const advance = () => { if (index === activity.questions.length - 1) { setFinished(true); return }; setIndex(index + 1); setSelected(null) }
  if (finished) { const score = Math.round(correct / activity.questions.length * 100); return <div className="activity-results"><div className="results-mark"><Trophy size={38} /></div><p className="eyebrow">{activity.type === 'checkpoint' ? 'Checkpoint complete' : 'Knowledge check complete'}</p><h2>{score >= 80 ? 'Strong signal.' : 'Useful reconnaissance.'}</h2><p>You scored <strong>{correct} of {activity.questions.length}</strong>. Incorrect answers are information, not punishment.</p><div className="results-score"><strong>{score}%</strong><span>accuracy</span></div><button className="button button--primary" onClick={() => onComplete(score / 100)}>{nextTitle ? <>Save & continue <ArrowRight size={16}/></> : <><ShieldCheck size={16}/>Save & return to Field HQ</>}</button></div> }
  return <><div className="quiz-head"><div><p className="eyebrow">Question {index + 1} of {activity.questions.length}</p><span>Domain {question.domain} · Objective {question.objective}</span></div><div className="quiz-dots">{activity.questions.map((_, i) => <i key={i} className={i <= index ? 'active' : ''} />)}</div></div><h2 className="question-title">{question.prompt}</h2><div className="answers">{question.options.map((option, choice) => { let state = ''; if (answered && choice === question.correctIndex) state = 'answer--correct'; else if (answered && choice === selected) state = 'answer--wrong'; return <button key={option} className={`answer ${state}`} onClick={() => choose(choice)}><span>{String.fromCharCode(65 + choice)}</span>{option}{answered && choice === question.correctIndex && <CheckCircle2 size={19} />}</button> })}</div>{answered && <div className={`explanation ${selected === question.correctIndex ? 'explanation--correct' : ''}`}><strong>{selected === question.correctIndex ? 'Correct — clean read.' : 'Not quite. Here’s the distinction.'}</strong><p>{question.explanation}</p></div>}<div className="quiz-footer"><span>{correct} correct so far</span><button className="button button--primary" disabled={!answered} onClick={advance}>{index === activity.questions.length - 1 ? 'See results' : 'Next question'} <ArrowRight size={16} /></button></div></>
}

export function ScenarioActivity({ activity, onComplete, nextTitle }) {
  const [selected, setSelected] = useState([])
  const [finished, setFinished] = useState(false)
  const toggle = (id) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  const correct = activity.actions.filter((action) => action.correct && selected.includes(action.id)).length
  const wrong = activity.actions.filter((action) => !action.correct && selected.includes(action.id)).length
  const possible = activity.actions.filter((action) => action.correct).length
  const score = Math.max(0, (correct - wrong) / possible)
  if (finished) return <div className="activity-results"><div className="results-mark"><Trophy size={38} /></div><p className="eyebrow">Scenario debrief</p><h2>{score >= .8 ? 'Defensible call.' : 'Useful rehearsal.'}</h2><p>{activity.explanation}</p><div className="results-score"><strong>{Math.round(score * 100)}%</strong><span>decision score</span></div><button className="button button--primary" onClick={() => onComplete({ score, selectedActions:selected })}>{nextTitle ? <>Save & continue <ArrowRight size={16}/></> : <><ShieldCheck size={16}/>Save & return to Field HQ</>}</button></div>
  return <><section className="scenario-brief"><p className="eyebrow">Mission</p><p>{activity.instructions}</p>{activity.evidence.map((item) => <div key={item} className="scenario-evidence">{item}</div>)}</section><h2 className="question-title">Choose the best coordinated actions</h2><div className="answers">{activity.actions.map((action, index) => <button key={action.id} className={`answer ${selected.includes(action.id) ? 'answer--selected' : ''}`} aria-pressed={selected.includes(action.id)} onClick={() => toggle(action.id)}><span>{letters[index] ?? index + 1}</span>{action.label}</button>)}</div><details className="scenario-hints"><summary>Need a hint?</summary>{activity.hints.map((hint) => <p key={hint}>{hint}</p>)}</details><div className="quiz-footer"><span>{selected.length} actions selected</span><button className="button button--primary" disabled={!selected.length} onClick={() => setFinished(true)}>Submit decision <ArrowRight size={16} /></button></div></>
}

const letters = ['A','B','C','D','E','F']

export function ExamActivity({ activity, onComplete, nextTitle }) {
  const storageKey = `secplus-exam-${activity.id}`
  const initial = useMemo(() => { try { return JSON.parse(localStorage.getItem(storageKey)) ?? {} } catch { return {} } }, [storageKey])
  const [answers, setAnswers] = useState(initial.answers ?? {})
  const [index, setIndex] = useState(initial.index ?? 0)
  const [endsAt] = useState(initial.endsAt ?? Date.now() + activity.config.durationMinutes * 60000)
  const [remaining, setRemaining] = useState(Math.max(0, endsAt - Date.now()))
  const [finished, setFinished] = useState(false)
  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify({ answers,index,endsAt })); const timer = setInterval(() => setRemaining(Math.max(0, endsAt - Date.now())), 1000); return () => clearInterval(timer) }, [answers,index,endsAt,storageKey])
  useEffect(() => { if (remaining === 0 && !finished) setFinished(true) }, [remaining,finished])
  const question = activity.questions[index]
  const result = useMemo(() => {
    const misses = []; const domains = {}
    let correct = 0
    activity.questions.forEach((item, questionIndex) => { const right = answers[questionIndex] === item.correctIndex; if (right) correct += 1; else misses.push(item.objective); const bucket = domains[item.domain] ?? { correct:0,total:0 }; bucket.total += 1; if (right) bucket.correct += 1; domains[item.domain] = bucket })
    return { score:activity.questions.length ? correct / activity.questions.length : 0, correct, objectiveMisses:[...new Set(misses)], domainScores:Object.fromEntries(Object.entries(domains).map(([domain,value]) => [domain,value.correct/value.total])), elapsedSeconds:Math.round((activity.config.durationMinutes*60000-remaining)/1000) }
  }, [activity,answers,remaining])
  if (finished) return <div className="activity-results"><div className="results-mark"><Trophy size={38} /></div><p className="eyebrow">Practice exam complete</p><h2>{result.score >= activity.config.passThreshold ? 'Readiness confirmed.' : 'Your review map is ready.'}</h2><p>You answered <strong>{result.correct} of {activity.questions.length}</strong> correctly. Review priority: {result.objectiveMisses.slice(0,5).join(', ') || 'none'}.</p><div className="results-score"><strong>{Math.round(result.score*100)}%</strong><span>accuracy</span></div><button className="button button--primary" onClick={() => { localStorage.removeItem(storageKey); onComplete(result) }}>Save exam <ArrowRight size={16} /></button></div>
  return <><div className="exam-status"><strong>{String(Math.floor(remaining/60000)).padStart(2,'0')}:{String(Math.floor(remaining/1000)%60).padStart(2,'0')}</strong><span>{Object.keys(answers).length} of {activity.questions.length} answered</span></div><div className="quiz-head"><div><p className="eyebrow">Question {index+1} of {activity.questions.length}</p><span>Domain {question.domain} · Objective {question.objective}</span></div></div><h2 className="question-title">{question.prompt}</h2><div className="answers">{question.options.map((option,choice) => <button key={option} className={`answer ${answers[index]===choice?'answer--selected':''}`} aria-pressed={answers[index]===choice} onClick={() => setAnswers({...answers,[index]:choice})}><span>{letters[choice]}</span>{option}</button>)}</div><div className="exam-nav"><button className="button button--ghost" disabled={index===0} onClick={() => setIndex(index-1)}><ArrowLeft size={16}/>Previous</button>{index < activity.questions.length-1 ? <button className="button button--primary" onClick={() => setIndex(index+1)}>Next <ArrowRight size={16}/></button> : <button className="button button--primary" onClick={() => setFinished(true)}>Submit exam</button>}</div></>
}

export function ActivityView({ activity, nextActivity, progress, onClose, onHome, onComplete, onOpenNext }) {
  const completed = progress.completedActivityIds.includes(activity.id)
  const hasContent = activity.content || activity.cards || activity.questions || activity.actions
  const [readingProgress, setReadingProgress] = useState(0)
  const updateReadingProgress = (event) => { const element = event.currentTarget; const available = element.scrollHeight - element.clientHeight; setReadingProgress(available > 0 ? Math.min(100, Math.round(element.scrollTop / available * 100)) : 100) }
  const finish = (result = null) => onComplete(activity,result,nextActivity?.id)
  return <div className="activity-overlay" onScroll={updateReadingProgress}><main className="activity-view"><header className="activity-header"><button className="back-button" onClick={onClose}><ArrowLeft size={16}/>Exit</button><span className="activity-header__type">{typeLabels[activity.type]}</span><div className="activity-header__actions">{completed && nextActivity && <button className="activity-next" onClick={() => onOpenNext(nextActivity.id)}>Next<ArrowRight size={14}/></button>}<button className="field-hq" onClick={onHome} aria-label="Return to Field HQ home"><span><ShieldCheck size={16}/></span><b>FIELD HQ</b></button></div><i className="reading-progress" style={{width:`${readingProgress}%`}}/></header><div className="activity-shell"><div className="activity-title"><p className="eyebrow">Tier {activity.tierNumber} · {activity.difficulty}</p><h1>{activity.title}</h1><p>{activity.summary}</p></div>{!hasContent ? <div className="preview-state"><Layers3 size={35}/><p className="eyebrow">Curriculum preview</p><h2>This activity has its place on the trail.</h2><p>Its full learning content arrives after validation.</p><button className="button button--primary" onClick={onClose}>Return to tier <ArrowRight size={16}/></button></div> : activity.type==='lesson' ? <LessonActivity activity={activity} completed={completed} nextTitle={nextActivity?.title} onComplete={()=>finish()}/> : activity.type==='flashcards' ? <FlashcardActivity activity={activity} completed={completed} nextTitle={nextActivity?.title} onComplete={()=>finish()}/> : activity.type==='scenario' ? <ScenarioActivity activity={activity} nextTitle={nextActivity?.title} onComplete={finish}/> : activity.type==='exam' ? <ExamActivity activity={activity} nextTitle={nextActivity?.title} onComplete={finish}/> : <QuizActivity activity={activity} nextTitle={nextActivity?.title} onComplete={finish}/>}</div></main></div>
}
