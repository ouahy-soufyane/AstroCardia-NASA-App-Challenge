# Astrocardia

**Space medicine, made easier to follow.** Astrocardia is a responsive, space-themed health monitoring prototype with separate experiences for astronauts and medical staff. It brings daily check-ins, example health readings, reports, and crew information together in one interface.

> **Project status: First version — still in progress.** Astrocardia is an early prototype. Some screens and interactions are demonstrations, and the project is not complete or ready for real medical use.

> **Demo only:** Astrocardia uses fictional records, simulated readings, and an illustrative status model. It is not a medical device and must not be used to diagnose, recommend medication, or guide treatment.

## Preview

Run the app locally to explore the astronaut and doctor experiences. The prototype is a frontend app; sign-in, profile updates, and demo records are stored in the browser and are not shared with a server.

## Features

- **Astronaut dashboard** with health status, example vital readings, and a short animated status simulation.
- **Health profile** for recording weight, height, and 24-hour diuresis. The current weight is also shown on the dashboard.
- **Health reports and medical messages** for demonstrating astronaut-to-clinician communication flows.
- **Doctor workspace** with a crew overview, searchable astronaut list, and individual record details.
- **Synthetic dataset** containing 100 fictional astronaut profiles, available as an Excel workbook.
- **TensorFlow.js demonstration model** that groups synthetic readings into Healthy, Attention, or Critical status classes. It does not predict medication or provide medical advice.
- **Responsive neon space theme** with an animated astronaut scan and starfield background.

## Tech stack

React, TypeScript, Vite, TensorFlow.js, ExcelJS, Framer Motion, Recharts, and Lucide icons.

## Requirements

- Node.js 20.19+ or 22.12+
- npm

## Run locally

```bash
npm install
npm run dev
```

Vite prints the local development URL, usually `http://localhost:5173`.

## Demo accounts

Use the built-in demo sign-in options on the login page to explore the astronaut and doctor roles. These are frontend-only demo roles, not secure authentication accounts.

## Dataset and model

The generated files are included in the repository. To recreate them:

```bash
npm run generate:data
npm run train:model
```

The dataset generator writes astronaut records to `src/data/astronauts.json` and an Excel workbook to `public/data/astrocardia-demo-astronauts.xlsx`. The training script writes the model and training report to `public/models/`.

Training and validation use generated data only. The reported model score is not evidence of clinical accuracy; status labels and thresholds are illustrative.

## Production build

```bash
npm run build
npm run preview
```

The production files are created in `dist/`.

## Deploy to Vercel

Import this repository in Vercel, or deploy from the project root with the Vercel CLI. The included `vercel.json` routes application paths to the Vite single-page app.

| Setting | Value |
| --- | --- |
| Framework preset | Vite |
| Build command | `npm run build` |
| Output directory | `dist` |
| Install command | `npm install` |

No server environment variables are required for the current demo. Its sample user data and profile changes stay in the visitor's browser.

## Project documents

- [Full project overview](docs/PROJECT_OVERVIEW.md)
- [Presentation pitch (about 1 minute 50 seconds)](docs/PITCH_1M50.md)

## Limitations and responsible use

All astronaut identities and health values are fictional. The status model is a software demonstration, not clinically validated, and must not be used for diagnosis, medication selection, or treatment. A real deployment would need medical review, appropriate privacy and security controls, and validated data and workflows.
