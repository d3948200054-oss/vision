# Vision

Vision is a coaching management and learning portal designed for grades 5–12. It gives teachers a central place to manage batches, enrolled students, study materials, class communication, and performance tracking, while providing students with a clean dashboard for learning progress and classroom engagement.

This project is a React + TypeScript app built with Vite and integrates with the Google Gemini API for AI-powered features.

## Features

- Teacher dashboard for managing classes and student groups
- Student dashboard for personal progress and course access
- Batch and enrollment flows for classroom onboarding
- 1:1 messaging and communication between teachers and students
- Study material and homework access
- Performance and engagement tracking
- Responsive UI for desktop and mobile use
- AI-powered capabilities via Gemini

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- Google GenAI SDK
- Express
- Recharts
- Lucide icons and Framer Motion-inspired UI animations

## Project Structure

```text
.
├── .env.example
├── index.html
├── metadata.json
├── package.json
├── public/
├── src/
│   ├── App.tsx
│   ├── components/
│   ├── context/
│   ├── data/
│   ├── index.css
│   ├── main.tsx
│   ├── types/
│   └── utils/
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 18+
- A Gemini API key from Google AI Studio

### 1) Install dependencies

```bash
npm install
```

### 2) Configure environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env.local
```

Then update `.env.local` with your Gemini key and app URL:

```env
GEMINI_API_KEY="YOUR_GEMINI_API_KEY"
APP_URL="http://localhost:3000"
```

If you are running this inside AI Studio, you can also configure the same secrets in the platform’s Secrets panel instead of using a local `.env.local` file.

### 3) Run the app locally

```bash
npm run dev
```

The app will be served locally on:

```text
http://localhost:3000
```

## Production Build

To create a production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

## Notes

- The app uses `vite --port=3000 --host=0.0.0.0` for local development.
- `GEMINI_API_KEY` is required for AI-related functionality.
- `APP_URL` is used for app-level links and runtime callbacks.

## License

This project is currently unlicensed unless otherwise specified in the repository.
