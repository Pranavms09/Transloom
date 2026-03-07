# TransLoom - AI Translation Studio

## Overview

TransLoom is a powerful, production-ready MVP for an AI-assisted translation studio. It provides a comprehensive suite of tools for translators and agencies to manage projects, leverage Translation Memory (TM), enforce terminology with glossaries, and review content in a streamlined browser-based environment.

## Key Features

- **Secure Authentication**: User login, registration, and session protection powered by Firebase Authentication (supports Email/Password and Google OAuth).
- **Dashboard Overview**: A central hub summarizing ongoing projects, recent activity, and translation metrics.
- **Project Management**: Create, organize, and track the status of multiple translation projects.
- **Translation Workspace**: A dedicated, interactive editor designed for translating, editing, and formatting content.
- **Translation Memory (TM)**: Simulate or integrate translation memory to speed up the translation of recurring phrases.
- **Glossary Enforcement**: Maintain and apply strict terminology guidelines across projects.
- **Review & Validation**: Built-in workflows for quality assurance and final content validation.
- **Settings & Billing**: User profile configurations, aesthetic preferences (Dark/Light mode), and subscription management.

## Tech Stack

- **Structure/Styling**: HTML5, Vanilla CSS3, and Tailwind CSS (via CDN for fast prototyping).
- **Interactivity**: Vanilla JavaScript (ES6 Modules).
- **Icons**: [Lucide Icons](https://lucide.dev/).
- **Backend/Auth**: [Firebase Authentication](https://firebase.google.com/).
- **Data Persistence**: `localStorage` (for mocking MVP core logic and data without a backend) alongside Firebase APIs.

## Project Structure

- `index.html` - The main entry point (Login/Authentication Gateway).
- `register.html` - User registration page.
- `dashboard.html` - Main user dashboard.
- `projects.html` - Project management interface.
- `workspace.html` - The core translation editor.
- `glossary.html` - Terminology management.
- `memory.html` - Translation Memory management.
- `review.html` & `validation.html` - QA and review workflows.
- `settings.html` & `billing.html` - Account configuration screens.
- `auth.js` / `firebase.js` / `firebase-config.js` - Firebase initialization and authentication logic.
- `style.css` - Custom styling supplementing Tailwind.

## Getting Started

Because TransLoom uses modern ES6 modules (`type="module"`), you cannot run it directly from the file system (e.g., `file://...`). You must run it through a local web server.

### Prerequisites

- Any modern web browser.
- A local web server (e.g., VS Code Live Server, Node.js `http-server`, Python `http.server`, etc.).

### Installation & Setup

1. **Clone or Download** the repository to your local machine.
2. **Configure Firebase**: Ensure `firebase-config.js` contains your valid Firebase project credentials.
   ```javascript
   // Example firebase-config.js
   export const firebaseConfig = {
     apiKey: "YOUR_API_KEY",
     authDomain: "YOUR_PROJECT.firebaseapp.com",
     projectId: "YOUR_PROJECT_ID",
     // ...
   };
   ```
3. **Serve the Application**:
   Using Node.js:
   ```bash
   npx serve .
   ```
   Or using Python:
   ```bash
   python -m http.server 8000
   ```
4. **Open in Browser**: Navigate to exactly where your local server is hosted (e.g., `http://localhost:8000/index.html`).

## License

All rights reserved.
