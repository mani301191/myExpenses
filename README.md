# myExpenses

A personal **expense and life-management dashboard** built with **Angular 17** and **Angular Material**. This application helps you track your finances (expenses, income, budgets, investments, insurance, assets), fitness/health data for family members, household appliances, career history, and reminders/events.

The built output is deployed to a Spring Boot backend (`expenseTrackerService`) so the app runs as a single integrated web application.

## Features at a Glance

- **Dashboard** – Real-time overview of finances, fitness, insurance expiries, assets, and day-wise expenses with charts.
- **Expense Tracker** – Monthly & yearly expense tracking with per-category breakdowns, budgets (estimates), income, savings, charts, Excel export, and bank-statement upload.
- **Fitness Tracker** – Track weight, medical records, and health details per family member.
- **Assets** – Track movable and non-movable assets with photos.
- **Investments & Fixed Deposits** – Manage investments and fixed deposits with maturity / current-value calculations.
- **Insurance** – Track insurance policies with expiry alerts.
- **Appliances** – Track household appliances and their AMC / service contracts.
- **Career** – Track employment history with duration calculations.
- **Reminders** – Upcoming events (birthdays, meetings, holidays, payments, festivals, travel) with notification alerts.
- **Configuration & Profile** – Manage app key-value config, profile name and photo.

> See [FUNCTIONS.md](./FUNCTIONS.md) for a detailed breakdown of every feature area.

## Tech Stack

- **Angular 17** (standalone components, reactive forms, routing)
- **Angular Material 17** (tables, dialogs, datepickers, progress bars, chips)
- **CanvasJS Angular Charts** (`@canvasjs/angular-charts`) for data visualization
- **xlsx + file-saver** for Excel export
- **RxJS** for reactive data flows
- **TypeScript 5.4**

## Prerequisites

- **Node.js** (18.x or later recommended)
- **npm**
- An instance of the backend REST API (default base URL: `http://localhost:8003/api/`) — this project is designed to build into a Spring Boot static-resource folder.

## Getting Started

### Install dependencies

```bash
npm install
```

### Run the development server

```bash
npm start
# or
ng serve
```

Navigate to `http://localhost:4200/`. The app automatically reloads on source changes.

### Build

```bash
npm run build
# or
ng build
```

The production build outputs to `D://src/expenseTrackerService/src/main/resources/static` (configured in `angular.json`), so the compiled app is served by the Spring Boot backend at its root.

### Run tests

```bash
npm test
# or
ng test
```

Runs unit tests with Karma + Jasmine in a headless Chrome browser.

## Project Structure

```
src/app/
├── app.component.*            # Root component (navigation, notifications, profile)
├── app.config.ts              # Application providers
├── app.routes.ts              # Route definitions
├── config-data.ts             # Shared config/dropdown interfaces
├── component/                 # Feature components (expense, fitness, assets, etc.)
├── dashboard/                 # Dashboard overview component
├── directive/ngx-print.directive.ts   # Print-to-pdf/print directive
├── pipes/indian-currency.pipe.ts      # Indian ₹ currency formatting pipe
└── service/                   # HTTP services (expense, inbox, fitness, etc.)
```

## Routes

| Route | Feature |
|-------|---------|
| `/` | Redirects to `/dashboard` |
| `/dashboard` | Overview dashboard |
| `/expense` | Expense tracker (summary / monthly / yearly views via `?view=` query param) |
| `/fitness` | Fitness & health tracking |
| `/asset` | Assets tracking |
| `/investment` | Investments tracking |
| `/investment/fixed-deposit` | Fixed deposit accounts |
| `/insurance` | Insurance policies |
| `/appliance` | Household appliances |
| `/career` | Career / employment history |
| `/reminders` | Events & reminders |
| `/config` | App configuration |
| `/year/:year` | Yearly expense analytics |
| `/month/:month/:year` | Monthly expense detail |
| `**` | Wildcard → redirects to `/dashboard` |

## Backend Integration

All services communicate with a REST backend at:

```
http://localhost:8003/api/
```

Key API groups (see `src/app/service/` for full method-level details):

- `expenseTracker/*`, `incomeTracker/*`, `monthlyTarget`, `monthlySummary`, `yearlySummary`, `monthlyExpByCatagory`, `plannedExpense`, `monthlyStatus`, `dailySummary`, `summary`, `profile/*`
- `fitness/*` (person / weight / medical details)
- `insurance/*`, `investment/*` (incl. `fixedDeposit`), `asset/*`, `appliances/*`, `career/*`, `event/*`, `config/*`

## Author

Manikandan Narasimhan (2024 – 2030)
