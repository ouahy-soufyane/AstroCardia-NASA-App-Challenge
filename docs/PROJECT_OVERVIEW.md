# Astrocardia — Project Description

## What it is

Astrocardia is a responsive web prototype for astronaut health monitoring. It brings daily check-ins, current health indicators, symptom reports, and private messages into one workspace for astronauts and their medical team. The idea follows a basic spaceflight-care need: crews operate far from ordinary clinics, while flight surgeons and medical teams remain responsible for health care and monitoring. NASA describes in-flight care as part of crew safety and mission support, with medical professionals overseeing care. Astrocardia is an independent demo, not a NASA product or clinical system.

## Who uses it

- **Astronauts** sign in to see a health dashboard, record their current weight, height, and 24-hour urine output, submit physical or psychological check-ins, and message their assigned doctor or the AstroCare demo checker.
- **Doctors** sign in to see an overview of their assigned crew and open the astronaut list to search and inspect individual demo records.

Each role sees only its own navigation. Demo login accepts any valid email and nonempty password; it is not real authentication.

## Screens and actions

1. **Login:** select Doctor or Astronaut and open the matching workspace.
2. **Astronaut dashboard:** view an animated astronaut scan, a 10-second demo vital-sign simulation, health status, and the current weight from the profile.
3. **Health profile:** record weight, height, and urine output over 24 hours. It saves in the current browser and allows another check-in after 24 hours.
4. **Reports:** submit separate physical or psychological symptom check-ins.
5. **Messages:** send mock messages to the doctor. AstroCare AI returns only a GREEN, ORANGE, or RED demo health-status message. It does not diagnose or recommend medicines.
6. **Doctor dashboard and Astronautes:** see a crew overview, browse 100 generated astronaut records, search/filter the list, and inspect a selected record.

## Data and model

The set of 100 astronaut records is entirely fictional and generated for demonstration. The Excel workbook contains the same synthetic measurements and a Read Me sheet. No real people or medical records are included.

The TensorFlow.js model is trained in JavaScript from augmented versions of these synthetic records. It predicts only one of three demo health-status labels: Healthy, Attention, or Critical. The labels and thresholds are illustrative examples, not validated medical standards. A training score measures performance on generated sample data only; it does not show real clinical accuracy.

The prototype must not be used for medical decisions. It has no medication predictor. A production system would require approved medical data, clinician-reviewed criteria, clinical validation, secure identity management, protected storage, and a proper connection to the responsible medical team. Treatment decisions remain with qualified professionals. NASA notes that flight medical teams oversee astronaut care and monitoring ([NASA in-flight medical care](https://www.nasa.gov/ochmo/health-and-medical-systems/in-flight-medical-care/), [NASA flight surgeons](https://www.nasa.gov/directorates/esdmd/hhp/flight-surgeons/)).

## Technology and deployment

The frontend uses React, TypeScript, Vite, CSS, Lucide icons, and TensorFlow.js. ExcelJS generates the `.xlsx` workbook. Vercel can host the static Vite build; `vercel.json` sends app paths back to `index.html`. Profile check-ins and demo login use browser local storage, so data is not shared across devices.

## Run the demo

```sh
npm install
npm run generate:data
npm run train:model
npm run dev
```

Create a production build with `npm run build`. Deploy the project root to Vercel; use `npm run build` and `dist` as the output directory.
