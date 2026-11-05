# Notes_App

Playwright end-to-end, API, and network interception test framework for the Notes application.

## Requirements

- **Node.js**: v20+ recommended
- **npm**: Included with Node.js
- **Browser**: Chromium (installed via Playwright)
- **Target Application**: `https://practice.expandtesting.com/notes/app`
- **Target API**: `https://practice.expandtesting.com/notes/api`

## Setup

Install the project dependencies and Playwright's Chromium browser:

```bash
npm ci
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

Run only the network interception & mocking tests:

```bash
npx playwright test --grep @mock
```

The UI suite registers a test user through the API, then tests signing in and creating, editing, deleting, and verifying notes through the UI. The API suite tests user registration and login, note creation, listing, updating, deletion, access control isolation between tenants, and unauthorized operations.

## Test reports and artifacts

The Playwright configuration targets Chromium. It creates an HTML report in `playwright-report/` and captures traces, screenshots, and videos for failed tests. Open the latest report with:

```bash
npx playwright show-report
```

Test artifacts and reports are generated locally and are ignored in git.

---

## 📋 Test Plan & Route Coverage

### Supported Routes & Endpoints
* **User Authentication:** `/notes/api/users/register`, `/notes/api/users/login`
* **Notes CRUD Operations:** `/notes/api/notes`, `/notes/api/notes/{id}`

### Test Assumptions & Environment Rules
1. **Dynamic Data Isolation:** Each test suite registers a fresh, unique user using `@faker-js/faker` to eliminate test-order dependencies and database state pollution.
2. **Auto-Waiting Strategy:** Web-first assertions (`expect()`, `expect.poll()`) handle asynchronous DOM updates and API propagation without static sleeps (`waitForTimeout`).
3. **Execution Mode:** Tests are fully parallel-safe for execution in both headless CI environments and local headed mode.

---

## 🌐 Observed Network Contracts & Request Shapes

During browser DevTools network analysis of `practice.expandtesting.com/notes/app`, the following actual network contracts were captured and verified:

### 1. User Registration (`POST /notes/api/users/register`)
* **Headers:** `Content-Type: application/json`
* **Request Payload:**
  ```json
  {
    "name": "Test User",
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
* **Response Contract (201 Created):**
  ```json
  {
    "status": 201,
    "message": "User account created successfully",
    "data": {
      "id": "60d5ec49f1b2c81184a7e52a",
      "name": "Test User",
      "email": "user@example.com",
      "token": "eyJhbGciOiJIUzI1NiIsIn..."
    }
  }
  ```

### 2. Note Creation (`POST /notes/api/notes`)
* **Headers:** `x-auth-token: <JWT_TOKEN>`, `Content-Type: application/json`
* **Request Payload:**
  ```json
  {
    "title": "Work Note",
    "description": "Task details here",
    "category": "Home"
  }
  ```
* **Response Contract (200 OK / 201 Created):**
  ```json
  {
    "status": 200,
    "message": "Note successfully created",
    "data": {
      "id": "66f3a12b...",
      "title": "Work Note",
      "description": "Task details here",
      "category": "Home",
      "completed": false,
      "created_at": "2026-11-05T00:00:00.000Z"
    }
  }
  ```

---

## 🛠️ Network Mocking Architecture & Strategy

### Method Selection Rationale
* **`page.route()` + `route.fulfill()`:** Selected to inject synthetic payloads and simulate backend HTTP failures (`401 Unauthorized`, `500 Internal Server Error`). This verifies UI error boundary resilience and recovery behavior without altering live production database records.
* **`route.continue()`:** Used inside route handlers to filter targeted requests while allowing non-targeted API calls and static UI assets (JS/CSS) to pass through unhindered.

### Isolation of Live vs. Mocked Tests
1. **Scope Specificity:** Route matching patterns are constrained using narrow URL glob patterns (e.g., `**/notes/api/notes`) to avoid intercepting unrelated requests.
2. **Route Cleanup:** Every mocked test executes `page.unroute()` after asserting failure behavior to verify that the UI can gracefully recover on a retry.
3. **Fresh Context Teardown:** Mocked test specs run in isolated `browserContext` instances, ensuring intercepted routes never leak into live integration suites (`@api` or `@ui`).