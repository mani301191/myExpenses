# myExpenses — Detailed Functionality

This document describes every functional area of the **myExpenses** application, mapped to the source components and services that implement them.

## Application Architecture Overview

The application is a single-page Angular 17 app using **standalone components**, Angular Material, CanvasJS charts, and a REST backend at `http://localhost:8003/api/`.

- **Navigation** lives in the root component (`src/app/app.component.ts`) with a Material toolbar, nav tabs, a notification (bell) icon, and a profile setting button.
- **Routing** is defined in `src/app/app.routes.ts`.
- **HTTP services** live in `src/app/service/`. Most extend `BaseService`, which provides the shared SnackBar message helper and a date formatter.
- **Shared utilities**:
  - `pipes/indian-currency.pipe.ts` — `InrFormatPipe` formats numbers as Indian ₹ currency (e.g., `₹12,34,567.00`).
  - `directive/ngx-print.directive.ts` — `ngxPrint` opens a print window with formatted content, optional charts, and a copyright footer.
  - `service/export-service.ts` — `ExcelServicesService` exports JSON data to `.xlsx` locally.

---

## 1. Dashboard

**Files:** `src/app/dashboard/dashboard.component.ts`, `.html`, `dashboard.ts`

**Purpose:** A single landing/overview screen aggregating data across the whole app (fetched via `SummaryService.fetchDashboardData()`).

Functionality:
- **Expense overview** — current month's income, estimate (budget), expense total, and the month name.
- **Fitness summary** — per-person weight cards (min weight, max weight, current weight, each with its date).
- **Insurance expiries** — insurance policies with expiry dates; policies expiring this month are flagged (`isExpiringThisMonth`).
- **Assets** — list of assets with values.
- **Day-wise expenses** — daily expense figures rendered as a CanvasJS chart.
- **Navigation carousel** — a horizontally scrollable row of card widgets controlled by left/right scroll buttons.
- Uses the Indian currency pipe for all monetary values and CanvasJS for charts.

---

## 2. Expense Tracking (Core)

The expense area is managed through the `Home` container and the `CommonService`.

### 2.1 Home / View Switcher

**Files:** `src/app/component/home/home.component.ts`, `.html`

- Hosts the three expense views: **Summary**, **Monthly**, **Yearly**.
- The active view is controlled by the `?view=` query parameter (`summary` | `monthly` | `yearly`), defaulting to `summary`.

### 2.2 Expense Monthly Table

**Files:** `src/app/component/expense/expense-monthly-table/`

- **Monthly expense data table** with pagination, sorting, in-place editing, and deletion. Columns: date, expense type, expense-of (category), description, amount, actions.
- **Month/year picker**, also driven by route params (`/month/:month/:year`).
- **CanvasJS charts**:
  - Day-wise bar chart of expenses for the selected month.
  - Pie chart of expenses by category with amount and percentage labels.
- **Buttons / dialogs**:
  - **Add Expense** dialog (`expense-add`) — reactive form (date, type: Planned/UnPlanned/Investment, category, description, amount). When the date changes, the category dropdown refreshes.
  - **Add Income** dialog (`income-add`) — form with date, source, amount.
  - **Estimate / Budget** dialog (`estimate-add`) — monthly budget planning (see below).
- **Export to Excel** — sorts and exports the month's expenses to `MonthlyExpense-<Month><Year>.xlsx`.
- **Import bank statement** — file upload that posts the statement to `expenseTracker/uploadStatement`, then refreshes expense/income/status data.
- **Print** support via the `ngxPrint` directive.

### 2.3 Estimate / Budget (Dialog)

**Files:** `src/app/component/expense/estimate-add/`

- Manage a monthly **budget estimate** (monthly target).
- Add/delete budget rows (date, description, amount), switch estimate month via a month picker.
- **Clone feature** — copy or average the estimate from a prior month into the current one (`monthlyTarget/clone`).

### 2.4 Expense Monthly (Container)

**Files:** `src/app/component/expense/expense-monthly/`

- Composition page that embeds two children:
  - `MonthlyIncomeComponent` — income summary banner.
  - `ExpenseMonthlyTableComponent` — expense table + charts.

### 2.5 Monthly Income Banner / Widget

**Files:** `src/app/component/monthly-income/monthly-income.component.ts`, `monthly-income.ts`

- Shows month-to-date **total income, total expense, and savings**.
- Breaks expenses down by type: **planned, unPlanned, investment**.
- Shows the **estimate (budget) total** for the month.
- Lists **top 5 expenses** sorted by amount.
- **Planned expense status** list.
- **Progress bar** of total expense vs. estimate, color-coded (`updateColor`): primary < 80%, warn 80–100%, accent > 100%.
- Supports deleting income records.

### 2.6 Expense Summary Table

**Files:** `src/app/component/expense/expense-summary-table/`

- **Historical monthly summary** of finances: year, month, income, expense, estimated, savings, actions.
- **CanvasJS grouped bar chart** comparing Estimate vs. Expense by month, with ₹-formatted labels and chart export.
- Filtering, sorting, pagination on the table.
- **Drill-down navigation** — clicking a row navigates to the yearly (`/year/:year`) or monthly (`/month/:month/:year`) detail page.
- Print support.

### 2.7 Expense Yearly

**Files:** `src/app/component/expense/expense-yearly/`

- **Yearly expense analytics** page.
- Summary table of planned, unPlanned, investment, income, savings, and estimated per year.
- **CanvasJS pie chart** of expenses by category.
- **Expandable monthly matrix table** — category rows across all 12 months (Jan–Dec) with per-category totals.
- **Print / report generation** — opens a formatted yearly expense report including the summary table, category matrix, and chart image with a copyright footer.

---

## 3. Fitness & Health Tracking

**Files:** `src/app/component/fitness/` (fitness, add-person-fitness, add-weight-details, add-medical-details, fitness-detail, weight-details, medical-details)

Backed by `FitnessService` (`/api/fitness/`).

- **Main Fitness page** — family member ("person") cards with photo and weight trend, plus controls to add/delete persons and open per-person dialogs.
- **Add Person (Dialog)** — add a family member with a profile photo upload (base64 preview).
- **Weight Details (Dialog)** — per-person weight history table (date, height, weight) with in-place editing, deletion, sorting, pagination, filtering, and an embedded weight-trend line chart.
- **Medical Details (Dialog)** — per-patient medical history table (date, problem, hospital, doctor, diagnosis, other details) with editing, deletion, and print.
- **Add Weight (Dialog)** — log a weight entry (date, person, height, weight). Keeps the form open so consecutive entries can be logged quickly.
- **Add Medical Details (Dialog)** — record a medical visit/consultation.
- **Fitness Detail** — a reusable CanvasJS line chart of the last 12 weight entries for a person.

---

## 4. Assets

**Files:** `src/app/component/assets/assets.component.ts`, `asset-data.ts`

Backed by `AssetService`.

- Track **movable and non-movable assets**, grouped by asset type.
- **Add / Edit asset** with a custom dialog/form: name, status (dropdown), comments, image (file upload with image preview and a default fallback image).
- Save, edit, delete operations.
- **Print** (sets page title to `MyAssets<date>` and calls `window.print()`).

---

## 5. Investments & Fixed Deposits

### 5.1 Investments

**Files:** `src/app/component/investments/investments.component.ts`, `investment-data.ts`

Backed by `InvestmentService`.

- Investment data table (investment, detail, vendor account number, nominee, status, additional details) with sorting, pagination, filtering, in-place editing, and deletion.
- **Active investments** summary filter.
- Add investment form with dropdowns for investment type and status.
- Print support.

### 5.2 Fixed Deposit (FD)

**Files:** `src/app/component/investments/fixed-deposit/fixed-deposit.component.ts`, `fixed-deposit.ts`

- **FD cards** for each fixed deposit showing bank, account number, dates, interest rate, nominee, and deposit amount.
- Add / edit / delete FD records with a custom **date-range validator** (maturity must be ≥ opened date).
- **Auto calculations**:
  - Expected **maturity amount** (simple interest).
  - **Current value** based on linear interest progress to today.
- **Footer totals** — total deposit and total current value across all FDs.
- FD cards sorted by maturity date, ₹-formatted.

---

## 6. Insurance

**Files:** `src/app/component/insurance/insurance.component.ts`, `insurance-data.ts`

Backed by `InsuranceService`.

- Insurance policy table (type, provider, policy number, nominee, start/end dates, additional details) with sorting, pagination, filtering, in-place editing, and deletion.
- **Active insurance filter** — lists policies whose end date is today or later.
- **Smart flagging/sorting** (`sortAndMarkInsurance`) — expired policies are marked and pushed below current ones.
- Add insurance form with insurance type dropdown.
- Print support.

---

## 7. Appliances

**Files:** `src/app/component/appliances/appliances.component.ts`, `appliances-data.ts`

Backed by `AppliancesService`.

- Appliance table (name, AMC, AMC end date, last serviced date, additional details) with sorting, pagination, filtering, in-place editing, and deletion.
- **Active AMC filter** — only appliances with AMC enabled whose AMC end date is on/after today (warranty / service contract reminders).
- Add appliance form with date pickers for AMC end and last-serviced dates.
- Print support.

---

## 8. Career

**Files:** `src/app/component/career/career.component.ts`, `career-data.ts`

Backed by `CareerService`.

- Career / employment record table (record type, org name, record id, designation, start/end dates, comments) with sorting, pagination, filtering, in-place editing, and deletion.
- **Employment history highlight** — employment records sorted by end date (descending).
- **Duration calculation** — years/months/days between start and end dates (or up to today if still employed).
- Add career record form.
- Print support.

---

## 9. Reminders & Alerts

### 9.1 Reminders

**Files:** `src/app/component/reminders/reminders.component.ts`, `event-data.ts`

Backed by `EventsService`.

- Event/reminder table (event date, type, detail, recurrence) with sorting, pagination, filtering, and deletion.
- **Current-month events** filter for quick visibility.
- **Icon rendering** — each event type maps to a Material icon and color (e.g., birthday → cake, travel → flight).
- Add event form (date, type dropdown, detail, recurrence dropdown: none/daily/weekly/monthly/yearly).

### 9.2 Alerts Dialog (Notifications)

**Files:** `src/app/component/alerts-dialog/alerts-dialog.component.ts`

- Global notification popup, triggered from the navigation bell icon.
- Displays current-month upcoming events (birthdays, meetings, holidays, payments, festivals, travel) with icon color coding and a close button.
- In the root component, the bell badge count is computed from events in the current month on/after today.

---

## 10. Configuration & Profile

### 10.1 App Configuration

**Files:** `src/app/component/config/config.component.ts`

Backed by `AppConfigService`.

- Editable **key/value config table**.
- **Add config row**, delete row, and save all rows.
- **Save default config** — restores default configuration values (`config/default`).
- Dropdown data for the app is served from `config/dropDown?key=...` endpoints.

### 10.2 Profile Settings

**Files:** `src/app/component/profile-setting/profile-setting.component.ts`, `profile-data.ts`

Backed by `CommonService`.

- Set up/edit the user **profile name** and **profile photo** (upload with base64 preview) via the `ProfileSetting` dialog.

---

## Cross-Cutting Utilities

| Utility | Location | Purpose |
|---------|----------|---------|
| `InrFormatPipe` | `src/app/pipes/indian-currency.pipe.ts` | Formats numbers as Indian ₹ currency. |
| `NgxPrintDirective` | `src/app/directive/ngx-print.directive.ts` | Opens a print window for a section, includes charts, optional paginator handling, and a copyright footer. |
| `ExcelServicesService` | `src/app/service/export-service.ts` | Exports JSON data to `.xlsx` using `xlsx` + `file-saver`. |
| `BaseService` | `src/app/service/base.service.ts` | Base class providing SnackBar message helper and date formatter. |

## Service / API Reference

All services hit `http://localhost:8003/api/` (fitness additionally under `fitness/`). See `src/app/service/` for full method signatures. Featured groupings:

- **`CommonService`** — expense, income, estimate, summary, yearly summary, category breakdown, planned expense/status, daily summary, profile, statement upload.
- **`FitnessService`** — persons, weights, medical details.
- **`InsuranceService`**, **`InvestmentService`**, **`AssetService`**, **`AppliancesService`**, **`CareerService`**, **`EventsService`**, **`AppConfigService`** — CRUD for their respective entities.
- **`SummaryService`** — combined dashboard data.
- **`ExcelServicesService`** — client-side Excel export.

---

*Documented from source: Angular 17, Material 17, CanvasJS charts.*
