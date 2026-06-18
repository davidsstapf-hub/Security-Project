# Security and Privacy Review

## Current data flow

- Learner progress is stored only in browser local storage.
- The application contains no account system, analytics client, advertising SDK, or application API.
- Export occurs only after the learner presses **Export progress**.
- Import accepts JSON files with the expected application envelope, migrates the embedded progress object, rejects unrelated/oversized input, and writes only to local storage.
- External study-resource links use a new tab with `noreferrer`.

## Validation completed

- `npm audit`: no known dependency vulnerabilities at installation time.
- Malformed and unrelated progress imports are rejected by unit tests.
- Progress migrations preserve stable activity identifiers.
- Production build, curriculum-integrity tests, and automated accessibility checks pass.

## Release considerations

- Export files contain learner name, activity history, scores, study time, and timestamps; the interface must continue to describe them as personal data.
- Browser local storage is not encrypted and should not store passwords, payment information, or regulated records.
- A deployment review must confirm headers, TLS, hosting logs, third-party scripts, and the final privacy notice for the chosen host.
- Native iOS storage and platform privacy declarations require a separate review when the native project is generated.
