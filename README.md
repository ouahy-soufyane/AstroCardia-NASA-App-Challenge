# Astrocardia

**Space medicine, made easier to follow.** Astrocardia is a space-themed web application prototype for exploring how astronauts could share health information with a medical support team during a mission.

> **Project stage: MVP / first version — work in progress.** This is an early minimum viable product built to demonstrate the concept and core user flows. Some features use mock interactions or generated sample values. The project is incomplete and is not ready for operational, clinical, or real astronaut use.
>
> **For demonstration only.** Astrocardia is not a medical device. It does not diagnose conditions, choose or recommend medication, or guide treatment. All astronaut profiles and health readings in this repository are fictional and generated.

## Live website

Open the deployed MVP: **[https://astro-cardia.vercel.app/](https://astro-cardia.vercel.app/)**

The site is an early demonstration version. Its login is not secure authentication, and it uses fictional sample data.

## Contents

- [Project overview](#project-overview)
- [MVP scope](#mvp-scope)
- [User roles and demo accounts](#user-roles-and-demo-accounts)
- [Main screens](#main-screens)
- [Technology](#technology)
- [Getting started](#getting-started)
- [Dataset and demo model](#dataset-and-demo-model)
- [Project structure](#project-structure)
- [Build and preview](#build-and-preview)
- [Deploy to Vercel](#deploy-to-vercel)
- [Current limitations](#current-limitations)
- [Possible next steps](#possible-next-steps)
- [Project documents](#project-documents)

## Project overview

Astrocardia presents two role-specific workspaces:

- **Astronauts** can view a health dashboard, enter daily profile measurements, submit physical and psychological check-ins, and use a message screen.
- **Doctors** can review a crew overview, search and filter a list of generated astronaut profiles, and inspect a selected profile.

The interface uses a dark space setting, neon accents, a starfield background, and an animated astronaut scan. These visual elements support the demonstration; they are not connected to real spacecraft equipment or live medical telemetry.

## MVP scope

This repository is the **first MVP version**, intended to make the concept visible and usable for a demonstration. It provides a frontend and sample data, rather than a complete health platform.

### Included in this MVP

- Role selection for astronaut and doctor demo workspaces.
- Astronaut dashboard with illustrative readings, health status, and a 10-second status simulation.
- Health profile check-in for weight, height, and 24-hour diuresis. The profile is stored in the current browser, and its weight is shown on the dashboard.
- Physical and psychological report forms.
- Message screen with mock conversation behavior and a constrained synthetic status response for the AstroCare demo assistant.
- Doctor dashboard and a searchable/filterable list of 100 fictional astronaut records.
- Excel workbook containing the generated sample records.
- JavaScript training script for a TensorFlow.js status-classification demonstration.
- Vite production build and Vercel single-page-app routing configuration.

### What “MVP” means here

The app demonstrates the main screens and interactions so that the idea can be reviewed and improved. It is not a complete production service: it has no server, database, verified identity system, real clinician messaging, real telemetry connection, or medically validated decision support. Browser storage is local to one browser and device.

## User roles and demo accounts

Choose a role on the login screen. The sample account cards can fill in the login form:

| Role | Demo email | Demo password |
| --- | --- | --- |
| Astronaut | `astronaut@astrocardia.demo` | `Astro2026!` |
| Doctor | `doctor@astrocardia.demo` | `Doctor2026!` |

These are **not real protected accounts**. This MVP accepts any valid email address and any non-empty password; the sample values are provided to make presentations easier. Do not enter a real or reused password. Role selection only changes the interface in this frontend demo and does not enforce permissions on a server.

## Main screens

### Login

Select the astronaut or doctor view. The visible demo accounts prefill the email, password, and role fields. This is a demo entry screen, not secure authentication.

### Astronaut dashboard

The dashboard displays synthetic health indicators, a status summary, an animated astronaut scan, and an optional 10-second simulation that moves the example readings from healthy toward attention and critical states. Simulation values are generated in the browser and do not represent measurements from a person.

### Health profile

Enter weight, height, and urine output over the last 24 hours (diuresis). The values are saved to browser `localStorage` and the current weight is reflected on the dashboard. This persistence is limited to the same browser profile and device; clearing browser data removes it.

### Reports

Submit example physical and psychological symptom check-ins. In this MVP, report actions are illustrative and are not sent to a real medical service or clinician.

### Messages

Explore a mock conversation flow. The AstroCare demo response is limited to a synthetic health-status summary. It is not a clinical chatbot and does not diagnose or suggest medicines.

### Doctor dashboard and astronaut list

Review the demonstration crew overview, search or filter the generated roster, and inspect a selected astronaut's sample information. The roster contains 100 fictional records and is not linked to astronaut accounts.

## Technology

| Technology | Purpose in this project |
| --- | --- |
| React | Builds the interface from interactive, reusable components. |
| TypeScript | Adds types to the app code and catches many coding errors during the build. |
| CSS | Controls layout, responsive behavior, colors, typography, stars, scan effects, and neon styling. |
| Vite | Runs the local development server and builds the static site for deployment. |
| TensorFlow.js | Trains and runs the demonstration classifier in JavaScript. |
| ExcelJS | Creates the `.xlsx` sample-data workbook. |
| Framer Motion | Provides interface animation. |
| Recharts | Displays chart-style health information. |
| Lucide React | Provides interface icons. |

## Getting started

### Requirements

- Node.js **20.19+** or **22.12+**
- npm (included with Node.js)
- A modern desktop or mobile browser

### Install and run

From the project root, run:

```bash
npm install
npm run dev
```

Vite prints a local address in the terminal, commonly `http://localhost:5173/`. Keep the development server running while using the app. Stop it with `Ctrl+C` in the terminal.

### Recreate the demo data and model (optional)

The generated dataset, workbook, and model artifacts are already included. To regenerate them, run:

```bash
npm run generate:data
npm run train:model
```

Regenerating will replace the demo data/model files. It is not necessary just to start the site.

## Dataset and demo model

### Synthetic astronaut dataset

The generator creates 100 fictional astronaut records, including example profile measurements and vital readings. It writes:

- `src/data/astronauts.json` for the app's doctor workspace.
- `public/data/astrocardia-demo-astronauts.xlsx` for workbook download and review.

The workbook includes an explanatory sheet. Names and measurements are made-up demo content; none of the records describes a real astronaut or patient.

### TensorFlow.js status model

The training script augments the generated values and trains a small classifier to return one of three illustrative status groups: **Healthy**, **Attention**, or **Critical**. The model is a coding and presentation demonstration only.

Model artifacts and its training report are stored in `public/models/`. Training on generated examples can only measure how the model performs on that generated data. Any reported score is **not** a measure of medical accuracy and must not be used to make health decisions. The model does not predict medications, diagnose a condition, or recommend treatment.

## Project structure

```text
.
├── docs/
│   ├── PROJECT_OVERVIEW.md       # Longer description of the concept and screens
│   └── PITCH_1M50.md             # Plain-language presentation script
├── public/
│   ├── data/                     # Downloadable demo workbook
│   └── models/                   # TensorFlow.js model and training report
├── scripts/
│   ├── generate-demo-data.js     # Generates 100 fictional records and workbook
│   └── train-health-status-model.js # Trains the synthetic status demo model
├── src/
│   ├── data/astronauts.json      # Records loaded by the app
│   ├── services/healthModel.ts   # Loads and calls the status model
│   ├── App.tsx                   # Screens, state, and interactions
│   ├── styles.css                # Base styles
│   └── space-theme.css           # Space theme, responsive styles, and effects
├── index.html
├── package.json                 # Dependencies and npm commands
├── vercel.json                  # Vercel routing for the single-page app
└── vite.config.ts
```

## Build and preview

Create and preview the optimized production build:

```bash
npm run build
npm run preview
```

Vite outputs the static site to `dist/`. The build runs TypeScript checking before bundling the site.

## Deploy to Vercel

The project is configured for Vercel as a static Vite site. Import the GitHub repository in Vercel and use these settings:

| Vercel setting | Value |
| --- | --- |
| Framework preset | Vite |
| Root directory | `./` (repository root) |
| Install command | `npm install` |
| Build command | `npm run build` |
| Output directory | `dist` |
| Environment variables | None required for this demo |

The included `vercel.json` rewrites application paths to `index.html` so the client-side app can load on direct navigation. A Vercel deployment hosts the frontend and included static demo assets; it does not add a backend or make the demo login secure.

## Current limitations

- **No backend:** there is no API or server-side application logic.
- **No persistent shared database:** profile values are stored in the user's browser only; they do not sync between browsers or devices.
- **Demo-only authentication:** the login does not verify credentials or provide real role-based access control.
- **Synthetic information:** all astronaut profiles and measurements are generated and fictitious.
- **No live telemetry:** readings and the simulation are not connected to sensors or spacecraft systems.
- **No real medical messaging:** the message and report flows do not contact a doctor or emergency service.
- **No clinical validation:** model outputs, labels, and thresholds are illustrative and have not been reviewed or validated for medical use.
- **Not a medical tool:** never use this MVP for diagnosis, medication choice, treatment, or emergency response.

Any future real-world version would require, at minimum, clinician-led requirements, appropriate validation, secure authentication and authorization, protected data storage, auditability, privacy and security review, and carefully designed operational workflows. Clinical decisions must remain with qualified medical professionals.

## Possible next steps

These are future development areas, not features currently included in the MVP:

1. Gather feedback from intended users and refine the screens and workflows.
2. Define privacy, security, and medical requirements before handling real health information.
3. Design a secure backend and database with access controls and audit trails.
4. Connect real accounts and role permissions rather than relying on frontend-only role selection.
5. Have clinicians define and review any health thresholds or decision-support behavior.
6. Validate any future model with appropriate, approved data and qualified oversight before considering real use.

## Project documents

- [Full project overview](docs/PROJECT_OVERVIEW.md)
- [Presentation pitch (about 1 minute 50 seconds)](docs/PITCH_1M50.md)

## License

No license has been added yet. Until a license is chosen, do not assume that others have permission to reuse, modify, or redistribute this project.
