export const practiceExamSources = {
  1: [
    { title:'NIST Cybersecurity Framework 2.0', url:'https://www.nist.gov/cyberframework' },
    { title:'IETF RFC 8446 — TLS 1.3', url:'https://datatracker.ietf.org/doc/html/rfc8446' },
  ],
  2: [
    { title:'CISA StopRansomware Guide', url:'https://www.cisa.gov/stopransomware/ransomware-guide' },
    { title:'OWASP Top 10', url:'https://owasp.org/www-project-top-ten/' },
  ],
  3: [
    { title:'NIST SP 800-207 — Zero Trust Architecture', url:'https://csrc.nist.gov/pubs/sp/800/207/final' },
    { title:'IETF RFC 8446 — TLS 1.3', url:'https://datatracker.ietf.org/doc/html/rfc8446' },
  ],
  4: [
    { title:'NIST SP 800-61 Rev. 2 — Incident Handling Guide', url:'https://csrc.nist.gov/pubs/sp/800/61/r2/final' },
    { title:'CISA StopRansomware Guide', url:'https://www.cisa.gov/stopransomware/ransomware-guide' },
  ],
  5: [
    { title:'NIST Cybersecurity Framework 2.0', url:'https://www.nist.gov/cyberframework' },
  ],
}

const targetByDomain = { 1:10, 2:18, 3:14, 4:22, 5:16 }

function sourceForQuestion(domain,question) {
  const text = `${question.prompt} ${question.options.join(' ')} ${question.explanation}`.toLowerCase()
  const crypto = /tls|certificate|cryptograph|encrypt|signature|hash|pki|key\b/.test(text)
  const application = /injection|application|access control|misconfigur|dependency|software|web\b/.test(text)
  const ransomware = /ransom|malware|backup|phish|credential|patch|vulnerab/.test(text)
  if ((domain === 1 || domain === 3) && crypto) return practiceExamSources[domain][1]
  if (domain === 2 && application) return practiceExamSources[2][1]
  if ((domain === 2 || domain === 4) && ransomware) return practiceExamSources[domain][1]
  return practiceExamSources[domain][0]
}

function assessmentQuestions(tiers, domain) {
  return tiers.flatMap((tier) => tier.modules.flatMap((module) => module.activities))
    .filter((activity) => activity.id.endsWith('-quiz'))
    .flatMap((activity) => activity.questions ?? [])
    .filter((question) => question.domain === domain)
}

function aggregateFlashcards(tiers) {
  return tiers
    .flatMap((tier) => tier.modules.flatMap((module) => module.activities))
    .filter((activity) => activity.type === 'flashcards')
    .flatMap((activity) =>
      (activity.cards ?? []).map(([term, definition]) => [
        term,
        `${definition} (${activity.title.replace(/\s+flashcards$/i, '')})`,
      ]),
    )
}

export function createPracticeExamTier(sourceTiers) {
  const questions = Object.entries(targetByDomain).flatMap(([domainKey,count]) => {
    const domain = Number(domainKey)
    const candidates = assessmentQuestions(sourceTiers,domain)
    if (candidates.length < count) throw new Error(`Domain ${domain} has only ${candidates.length} practice-exam candidates; ${count} required.`)
    return candidates.slice(0,count).map((question,index) => ({
      ...question,
      id:`t6-practice-d${domain}-q${String(index+1).padStart(2,'0')}`,
      source:sourceForQuestion(domain,question),
    }))
  })

  questions.forEach((question,index) => {
    const desiredPosition = index % 4
    const shift = (question.correctIndex - desiredPosition + 4) % 4
    question.options = [...question.options.slice(shift),...question.options.slice(0,shift)]
    question.correctIndex = desiredPosition
    question.lockedAnswerPosition = true
  })

  const flashcards = aggregateFlashcards(sourceTiers)

  return {
    id:'tier-6',number:6,title:'Practice Exam',subtitle:'Prove the knowledge under pressure',difficulty:'synthesis',color:'#35e6a5',minutes:110,recommendedAfter:5,
    modules:[{
      id:'t6-practice-exam-section',title:'Full-length practice exam',summary:'Eighty original, source-grounded multiple-choice questions across all five domains.',
      activities:[{
        id:'t6-practice-exam',type:'exam',title:'Security+ 80-question practice exam',duration:90,required:true,domain:5,objective:'Cross-domain exam readiness',difficulty:'synthesis',
        summary:'Complete 80 domain-weighted multiple-choice questions with plausible alternatives and objective-level remediation.',questions,
        config:{version:2,durationMinutes:90,questionCount:80,domainWeights:{1:12,2:22,3:18,4:28,5:20},passThreshold:.8,reviewPolicy:'after-submit',allowModeSelection:true},
      }],
    },{
      id:'t6-master-flashcards-section',title:'Flash Cards',summary:'Shuffle every flashcard from every section into one cumulative review deck.',
      activities:[{
        id:'t6-master-flashcards',type:'flashcards',title:'Security+ master flash card deck',duration:20,required:false,domain:5,objective:'Cross-domain recall',difficulty:'synthesis',
        summary:`Review ${flashcards.length} shuffled flashcards pulled from all curriculum sections.`,cards:flashcards,shuffleCards:true,
      }],
    }],
  }
}
