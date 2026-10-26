# FutureTrPr ESG Reporting Platform — Frontend Client

[![React Version](https://img.shields.io/badge/React-19.3.1-61dafb.svg?logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.3.4-646cff.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-v4.3.3-38bdf8.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-Proprietary-blue.svg)](#)

A modern, responsive Single Page Application (SPA) for corporate **Environmental, Social, and Governance (ESG)** reporting, greenhouse gas emission accounting, metric auditing, and disclosure workflow management. Built with **React 19**, **Vite**, and **Tailwind CSS v4**.

---

## Repository Links

- **Frontend Repository:** [`https://github.com/Deepith-03/esg-reporting-frontend`](https://github.com/Deepith-03/esg-reporting-frontend)
- **Backend Repository:** [`https://github.com/Deepith-03/esg-reporting-bacend`](https://github.com/Deepith-03/esg-reporting-bacend)
- **Live Production URL:** `https://your-frontend-deployment-url.com` *(Placeholder)*

---

## Table of Contents

- [Project Overview](#project-overview)
- [Key Features Currently Implemented](#key-features-currently-implemented)
- [Role-Based Access Control (RBAC)](#role-based-access-control-rbac)
- [Technologies & Dependencies](#technologies--dependencies)
- [Prerequisites](#prerequisites)
- [Local Installation & Setup](#local-installation--setup)
- [Environment Configuration](#environment-configuration)
- [Configuring Backend API Base URL](#configuring-backend-api-base-url)
- [Available NPM Scripts](#available-npm-scripts)
- [Application Screenshots](#application-screenshots)
- [Deployment Instructions](#deployment-instructions)
- [Incomplete Features & Future Roadmap (TODOs)](#incomplete-features--future-roadmap-todos)

---

## Project Overview

The **FutureTrPr ESG Reporting Platform** (internally branded as **EcoTrack**) provides enterprise teams with a transparent, role-governed interface to collect ESG metrics, calculate greenhouse gas (GHG) footprints, upload verifiable audit evidence, and shepherd disclosure reports through a formal review and approval cycle.

---

## Key Features Currently Implemented

### 1. Executive Dashboard & Metrics Overview
- Aggregated real-time counters: registered organizations, reporting periods, pending reviews, and defined ESG metrics.
- Reporting period progress tracker (`Draft`, `Submitted`, `Changes Requested`, `Approved`).
- Metric breakdown by ESG Pillar (**Environmental**, **Social**, and **Governance**).

### 2. Multi-Organization Management
- Tabular directory displaying registered companies, industries, and countries.
- Organization registration modal for Administrator users.

### 3. Reporting Period Lifecycle Management
- Organization-scoped reporting period creation (reporting boundary, start date, end date).
- Interactive workflow transition controls based on active status:
  - **DRAFT** &rarr; Submit for Review (Contributor / Admin)
  - **SUBMITTED** &rarr; Approve Report or Request Changes with required feedback (Reviewer / Admin)
  - **CHANGES_REQUESTED** &rarr; Resubmit with corrections (Contributor / Admin)
  - **APPROVED** &rarr; Read-only immutable final disclosure status.
- Real-time client-side search across periods and boundaries.

### 4. ESG Metric Definitions Catalogue
- Comprehensive catalogue classifying indicators into Environmental, Social, and Governance pillars.
- Pillar-based tab filtering and live keyword search.
- Administrator interface to register custom metric definitions with units and descriptions.

### 5. Metric Entry Data Recording
- Data entry interface linked to specific organizations and reporting periods.
- Quantitative data logging against pre-defined metric definitions.

### 6. Supporting Evidence Document Upload
- File attachment interface for individual metric entries.
- Multipart form document upload (`POST /api/metric-entries/{metricEntryId}/evidence`) supporting PDF, Excel, spreadsheets, and invoices.
- Document inspection table showing filenames, file sizes, MIME types, and upload timestamps.

### 7. Interactive Carbon Emission Calculator
- Multi-tier GHG accounting covering:
  - **Scope 1 (Direct Fuel Combustion):** Diesel, Petrol/Gasoline, Natural Gas, LPG, Heavy Fuel Oil.
  - **Scope 2 (Indirect Electricity):** Grid electricity consumption with configurable emission factors.
  - **Scope 3 (Business Travel & Freight Logistics):** Passenger cars (petrol/diesel/EV), commercial vans, heavy freight trucks, rail, and flights.
- Dynamic row addition/removal for multi-fuel and multi-leg transport calculations.
- Live unit display toggling between **Metric Tonnes (t CO2e)** and **Kilograms (kg CO2e)**.
- Detailed calculation formula transparency and citation references.
- One-click **"Load Sample Activity Data"** feature for testing.
- Persistence to MySQL database (`POST /api/carbon-calculator/save`) linking calculations to organizations and periods.
- Saved calculations history viewer with filtering and Administrator deletion rights.

### 8. Immutable Audit Trail
- Timeline inspection viewer showing every status transition for a reporting period.
- Chronological event log displaying previous status, new status, actor username, ISO timestamp, and reviewer feedback notes.

### 9. Admin Data Cleanup & Management Workspace
- Dedicated administrative suite for test data sanitization and database consistency maintenance.
- **Impact Analysis Preview Modal:** Computes affected organizations, reporting periods, entries, and evidence files prior to execution.
- **Safety Safeguards:**
  - Preserves immutable workflow audit logs.
  - Enforces explicit safety override checkbox for approved reports.
  - Requires typing `"DELETE"` into a confirmation prompt to prevent accidental data loss.
- One-click **"Clean Demo / Test Data"** automated cleanup tool.

---

## Role-Based Access Control (RBAC)

The frontend dynamically adjusts navigation links, form visibility, and action buttons based on the authenticated user role:

| Feature / Action | Administrator (`ADMIN`) | Contributor (`DATA_ENTRY`) | Reviewer (`REVIEWER`) | Report Viewer (`VIEWER`) |
| :--- | :---: | :---: | :---: | :---: |
| **View Dashboard & Audit Trail** | Yes | Yes | Yes | Yes (Read-Only) |
| **Add Organizations** | Yes | No | No | No |
| **Create Reporting Periods** | Yes | Yes | No | No |
| **Define ESG Metrics** | Yes | No | No | No |
| **Record Metric Entries** | Yes | Yes | No | No |
| **Upload Evidence Files** | Yes | Yes | No | No |
| **Submit / Resubmit Report** | Yes | Yes | No | No |
| **Approve / Request Changes** | Yes | No | Yes | No |
| **Save Carbon Calculations** | Yes | Yes | No | No |
| **Delete Carbon Calculations** | Yes | No | No | No |
| **Data Cleanup & Purge Tools** | Yes | No | No | No |

---

## Technologies & Dependencies

| Category | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Core Framework** | [React](https://react.dev/) | `^19.3.1` | Component-based UI architecture |
| **Build Tooling** | [Vite](https://vitejs.dev/) | `^8.3.4` | Next-generation frontend bundler & dev server |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) | `^4.3.3` | Utility-first CSS styling engine |
| **Vite Integration** | `@tailwindcss/vite` | `^4.3.3` | Native Tailwind v4 Vite plugin integration |
| **HTTP Client** | [Axios](https://axios-http.com/) | `^1.20.0` | API communication with HTTP Basic Auth support |
| **Icons** | [Lucide React](https://lucide.dev/) | `^1.61.0` | Clean, modern SVG interface icons |
| **Notifications** | [React Hot Toast](https://react-hot-toast.com/) | `^2.6.1` | Lightweight toast notifications |
| **Linting** | [ESLint](https://eslint.org/) | `^10.13.0` | Code quality and React hooks linting |

---

## Prerequisites

Before running the frontend locally, ensure you have:

1. **Node.js:** `v18.20.0` or `v20.x`+ LTS (Run `node -v` to verify).
2. **npm:** `v9.x` or `v10.x`+ (Run `npm -v` to verify).
3. **Backend API:** Running instance of `esg-reporting-backend` on port `8081` (see [Backend README](../esg-reporting-backend/README.md)).

---

## Local Installation & Setup

1. **Clone the repository and navigate to the frontend directory:**
   ```bash
   git clone https://github.com/Deepith-03/esg-reporting-frontend.git
   cd esg-reporting-frontend
   ```

2. **Install project dependencies:**
   ```bash
   npm install
   ```

3. **Create local environment file:**
   ```bash
   cp .env.example .env
   ```

4. **Start the local development server:**
   ```bash
   npm run dev
   ```
   The application will boot at:
   ```
   http://localhost:5173
   ```

5. **Sign in with demonstration credentials:**
   The backend provides four pre-configured demonstration accounts (see [Backend README](../esg-reporting-backend/README.md#default-demo-accounts) for details):
   - **Administrator:** `admin` / `LocalDevOnly123!` (or value configured in `ESG_DEMO_PASSWORD`)
   - **Contributor:** `dataentry` / `DataEntry123!`
   - **Reviewer:** `reviewer` / `Reviewer123!`
   - **Viewer:** `viewer` / `Viewer123!`

---

## Environment Configuration

A template configuration file [`.env.example`](.env.example) is provided in the repository root:

```bash
# Backend REST API Base URL
VITE_API_BASE_URL=http://localhost:8081/api
```

---

## Configuring Backend API Base URL

In the current implementation, API connectivity is managed in [`src/api/axiosConfig.js`](src/api/axiosConfig.js):

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8081/api",
});

export default api;
```

### For Production or Custom Port Deployments
To point the frontend to a remote backend (e.g. AWS, Render, Heroku) without changing source code, update `src/api/axiosConfig.js` to utilize Vite environment variables:

```javascript
import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8081/api",
});

export default api;
```
Then define `VITE_API_BASE_URL=https://api.yourdomain.com/api` in your `.env` or CI/CD deployment environment.

> [!IMPORTANT]
> The backend Spring Security CORS configuration (`CorsConfig.java`) explicitly permits origins from `http://localhost:5173`. If you run the frontend on a different port or domain, you must update the permitted origins list in the backend `CorsConfig.java`.

---

## Available NPM Scripts

| Command | Purpose |
| :--- | :--- |
| `npm run dev` | Starts Vite local development server with Hot Module Replacement (HMR) |
| `npm run build` | Compiles and bundles production-ready assets into the `dist/` directory |
| `npm run preview` | Runs a local web server to preview the production build in `dist/` |
| `npm run lint` | Analyzes code for ESLint errors and React Hooks compliance |

---

## Application Screenshots

> *Screenshots below represent core user journeys in the FutureTrPr ESG Reporting Platform.*

| View | Screenshot Placeholder |
| :--- | :--- |
| **Authentication Screen** | ![Sign In Screen](https://via.placeholder.com/800x450.png?text=FutureTrPr+ESG+-+Sign+In+Screen) |
| **ESG Executive Dashboard** | ![Executive Dashboard](https://via.placeholder.com/800x450.png?text=EcoTrack+-+ESG+Executive+Dashboard) |
| **Reporting Periods & Workflow** | ![Workflow Action Table](https://via.placeholder.com/800x450.png?text=Reporting+Periods+Workflow+Actions) |
| **Carbon Emission Calculator** | ![Carbon Calculator](https://via.placeholder.com/800x450.png?text=Scope+1+2+3+Carbon+Emission+Calculator) |
| **Immutable Audit Trail** | ![Audit Trail](https://via.placeholder.com/800x450.png?text=Chronological+Workflow+Audit+Trail) |
| **Admin Data Cleanup Suite** | ![Data Management](https://via.placeholder.com/800x450.png?text=Data+Cleanup+Impact+Preview+Modal) |

---

## Deployment Instructions

### Building for Production
Run the production build script:
```bash
npm run build
```
This generates optimized static HTML, CSS, and JavaScript bundles in the `dist/` folder.

### Deployment Options

#### 1. Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` from `esg-reporting-frontend/`.
3. Set Build Command: `npm run build` and Output Directory: `dist`.
4. Configure Environment Variable: `VITE_API_BASE_URL=https://your-backend-api.com/api`.

#### 2. Netlify
1. Connect GitHub repository in Netlify dashboard.
2. Set Build Command to `npm run build` and Publish Directory to `dist`.
3. Add a `_redirects` file with `/*  /index.html  200` to support single-page client routing.

#### 3. Docker / Nginx
Build a lightweight static container:
```dockerfile
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

---

## Incomplete Features & Future Roadmap (TODOs)

- [ ] **TODO: Social Impact & Governance Dedicated Modules:** The sidebar includes entries for "Social Impact" and "Governance" which currently fallback to the primary ESG Overview. Dedicated analytics dashboards should be built for workforce demographics, training completion ratios, and board independence metrics.
- [ ] **TODO: Dynamic Base URL in `axiosConfig.js`:** Connect `src/api/axiosConfig.js` directly to `import.meta.env.VITE_API_BASE_URL` so rebuilds aren't needed across staging environments.
- [ ] **TODO: Token-Based Authentication (JWT):** Replace HTTP Basic credentials stored in memory with HTTP-only cookie JWT tokens or refresh-token session management.
- [ ] **TODO: Automated Testing Suite:** Add Vitest and React Testing Library (`@testing-library/react`) for component unit tests and user flow validation.
- [ ] **TODO: PDF / Excel Report Export:** Add automated report export capabilities allowing users to download board-ready ESG disclosure packages.
- [ ] **TODO: Direct File Download Link in Evidence View:** Add backend endpoint and frontend download button for stored evidence files.
