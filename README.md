# PCDA Interactive Presentation (Next.js)

Live, interactive presentation form for prospective student-athletes and their families.  
Built with Next.js + Tailwind, ready for GitHub + Vercel.

## 🚀 Quick Start
```bash
npm install
npm run dev
```
Visit http://localhost:3000

## 🧩 Features
- PCDA-branded UI (primary: #26a8e0, secondary: #96a8ab)
- Interactive questionnaire (GPA, classes, residency/FAFSA logic, credits → eligibility timeline)
- Searchable multi-select of NCAA/NAIA schools (starter dataset in `src/data/schools.json`)
- Per-school cards: cost, location, avg class size, last 2 seasons record
- Financial calculator (down payment, FAFSA placeholder, per-semester work reduction → net balance)
- 2- vs 3-semester pathway with timestamp + input visit dates
- Print/Save to PDF
- **Download CSV** and **Download PDF** buttons

## 🏗 Structure
```
src/
  components/PCDAInteractiveForm.jsx
  data/schools.json
  pages/index.jsx
  styles/globals.css
  utils/export.js
```

## ✏️ Customize
- Replace `public/pcda-logo.png` with your real logo
- Update colors in `tailwind.config.js`
- Expand `src/data/schools.json` with full NCAA/NAIA dataset

## ☁️ Deploy to Vercel
1. Push to GitHub
2. In Vercel → New Project → Import the repo → Deploy
