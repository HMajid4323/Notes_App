# Notes_App

Playwright end-to-end and API tests for the Notes application.

## Requirements

- Node.js and npm
- Chromium (installed through Playwright)
- Access to the Notes application API at `https://practice.expandtesting.com/notes/api`

## Setup

Install the project dependencies and Playwright's Chromium browser:

```bash
npm install
npx playwright install chromium
```

## Running tests

Run the full test suite:

```bash
npm run tests:All
```

Run only the UI tests in a visible browser:

```bash
npm run tests:UI
```

Run only the API tests:

```bash
npm run tests:API
```

The UI suite registers a test user through the API, then tests signing in and creating, editing, deleting, and verifying notes through the UI. The API suite tests user registration and login, note creation, listing, updating, deletion, and a request without an authentication token.

## Test reports and artifacts

The Playwright configuration targets Chromium. It creates an HTML report in `playwright-report/` and captures traces, screenshots, and videos for failed tests. Open the latest report with:

```bash
npx playwright show-report
```

Test artifacts and reports are generated locally and are not part of the test source.