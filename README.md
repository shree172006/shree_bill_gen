# Shree Sai Classes — Automated Billing & Fee Management Suite

An institutional billing, installment tracking, and fee management platform built for **Shree Sai Classes** with **React 18 + Vite**, **Express.js (Node.js)**, and **Supabase Cloud PostgreSQL**.

Designed for desktop, tablets, and mobile devices as an installable **Progressive Web App (PWA)** with a high-contrast institutional ERP theme.

---

## 🌟 Key Features

### 1. 🧾 Automated Bill & Fee Receipt Generator
- **High-Resolution A4 PDF Generation**: Pixel-perfect vector PDF fee receipt with standard margins and crisp typography.
- **Academy Header & Branding**:
  - Official emblem, Nallasopara branch address, and Student's Care Helpline numbers.
  - Category Banner: *6th to 10th (CBSE • ICSE • IGCSE • SSC) & 11th/12th Commerce (FYJC • SYJC)*.
- **Payment & Cleared Receipts Breakdown**:
  - Lists only cleared payments with date, mode, transaction details, and amount.
  - Clearly displays Gross Yearly Fees, Scholarship/Discounts, Total Paid, and Outstanding Balance Due.
- **One-Click Sharing & Export**:
  - 🖨️ **Print Receipt**: Direct printer preview with dedicated print styles.
  - 📥 **Save PDF**: Downloads crisp, true-to-scale `.pdf` fee receipts.
  - 📲 **Share PDF (Mobile)**: Uses native mobile Web Share API to attach and send the actual PDF file directly via WhatsApp or any chat app.
  - 💬 **WhatsApp Quick Chat**: Direct deep-link with pre-formatted bill summary message.

---

### 2. 🎓 Academy Academic Curriculum & Admission Console
- **Junior College Section (Commerce Stream Only)**:
  - `SYJC (12th Commerce)` — Auto-suggests: *BK, Accounts, Maths, Eco, OCM*
  - `FYJC (11th Commerce)` — Auto-suggests: *BK, Accounts, Maths, Eco, OCM*
- **School Section (Classes 6th to 10th)**:
  - `Class 10` | `Class 9` | `Class 8` | `Class 7` | `Class 6`
  - Board Selectors: `CBSE`, `ICSE`, `IGCSE`, `SSC (State Board)`, `HSC (Commerce)`
- **Dynamic Installment Builder**:
  - 1-click quick-split presets (1 to 7 installments).
  - Indian standard `DD/MM/YYYY` date picker with calendar popups.
  - Live calculation of Net Payable, Total Paid, and Outstanding Balance Due.

---

### 3. 📊 Official Multi-Installment Excel Ledger Sync
Fully integrated with Shree Sai Classes' official spreadsheet schema:

```
Sr.No. | Reg No. | * | Name of Student | Std | Date Of Admission | Yearly Fees | Actual Fees | 
RECEIVED FROM PARENTS 1 | RECEIVED DATE 1 | RECEIPT NO. 1 | 
RECEIVED FROM PARENTS 2 | RECEIVED DATE 2 | RECEIPT NO. 2 | 
RECEIVED FROM PARENTS 3 | RECEIVED DATE 3 | RECEIPT NO. 3 | 
RECEIVED FROM PARENTS 4 | RECEIVED DATE 4 | RECEIPT NO. 4 | 
RECEIVED FROM PARENTS 5 | RECEIVED DATE 5 | RECEIPT NO. 5 | 
PENDING | REMARK | DUE DATE | Mode Of Payment 1..4
```

- **Export**: One-click download of the complete student financial roster to `.xlsx`.
- **Import**: Bulk-imports spreadsheets matching the ledger format and saves to the database.
- **Template**: Downloadable pre-formatted sample Excel template.

---

### 4. 🗄️ Supabase Cloud PostgreSQL Database
- Direct connection to Supabase PostgreSQL cloud database.
- Real-time `INSERT`, `UPDATE`, and `DELETE` operations.
- Clean SQL schema script included in [`server/schema.sql`](./server/schema.sql) with Row Level Security (RLS).
- Automated local caching in `server/data/` for high performance and offline resilience.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend Framework** | **React 18 + Vite** | High-performance SPA with instant HMR and PWA support |
| **Styling** | **Tailwind CSS** | Custom institutional theme, mobile card layouts & responsive tables |
| **Backend Framework** | **Express.js (Node.js)** | RESTful API, Excel parsing/generation & full-stack production server |
| **Database** | **Supabase (PostgreSQL)** | Cloud-hosted relational database with JSONB multi-installment storage |
| **PDF & Canvas Engine** | **`jspdf` + `html2canvas`** | Pixel-perfect PDF Fee Receipt generator |
| **Spreadsheet Engine** | **`xlsx` (SheetJS)** | Excel ledger import, export, and template generation |
| **Date Standard** | **`DD/MM/YYYY`** | Indian standard localized formatting across all inputs and views |

---

## 📁 Project Structure

```
shree_bill_gen/
├── client/                      # React 18 + Vite Frontend Application
│   ├── public/
│   │   ├── manifest.json        # PWA Web App Manifest
│   │   ├── sw.js                # Auto-updating Service Worker (Network-First)
│   │   └── icon.svg             # Institutional Emblem Icon
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx           # Top branding, navigation & action buttons
│   │   │   ├── StatCards.jsx        # Key metrics (Total Revenue, Paid, Due)
│   │   │   ├── StudentTable.jsx     # Responsive table (desktop) & card feed (mobile)
│   │   │   ├── StudentModal.jsx     # Admission & multi-installment console
│   │   │   ├── ReceiptModal.jsx     # Printable A4 Bill & PDF sharing modal
│   │   │   ├── DateInput.jsx        # Indian DD/MM/YYYY custom date picker
│   │   │   ├── ConfirmModal.jsx     # Custom in-app delete confirmation dialog
│   │   │   ├── Toast.jsx            # Custom in-app floating notifications
│   │   │   ├── ExcelImportModal.jsx # Excel file import modal
│   │   │   └── SettingsModal.jsx    # Institute profile & receipt terms editor
│   │   ├── services/
│   │   │   └── api.js               # Axios API client
│   │   ├── utils/
│   │   │   └── formatters.js        # Currency (₹ INR) & DD/MM/YYYY formatters
│   │   ├── App.jsx                  # Main application container
│   │   ├── index.css                # Tailwind CSS root styles
│   │   └── main.jsx                 # Client entry point
│   └── package.json
├── server/                      # Express.js Backend API
│   ├── schema.sql               # Official Supabase PostgreSQL Database Schema
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js          # Supabase client & connection validator
│   │   ├── controllers/
│   │   │   ├── studentController.js # Student CRUD endpoints
│   │   │   ├── excelController.js   # Multi-installment Excel import/export
│   │   │   └── settingController.js # Institute settings endpoints
│   │   ├── models/
│   │   │   └── store.js             # Supabase cloud sync & calculation engine
│   │   ├── routes/
│   │   │   ├── studentRoutes.js     # Student routes
│   │   │   ├── excelRoutes.js       # Excel routes
│   │   │   └── settingRoutes.js     # Settings routes
│   │   └── server.js                # Express app entry & static production server
│   └── package.json
├── package.json                 # Root project scripts
├── start.js                     # Unified dev runner (auto-port clearing & parallel start)
└── README.md
```

---

## 🚀 Running Locally

### 1. Install Dependencies
```bash
npm install
npm --prefix server install
npm --prefix client install
```

### 2. Start Application (Server + Client in Parallel)
```bash
npm start
```
- **Web App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

---

## 🌐 Deploying to Render.com (1-Click Full-Stack)

1. Connect your repository (`shree172006/shree_bill_gen`) to **[Render.com](https://render.com)** as a **Web Service**.
2. Set configuration:
   - **Environment**: `Node`
   - **Build Command**:
     ```bash
     npm install && npm --prefix server install && npm --prefix client install && npm run build
     ```
   - **Start Command**:
     ```bash
     npm run prod
     ```
3. Set Environment Variables:
   - `SUPABASE_URL`: `https://fatjyhbkvpsqbyrtvvjy.supabase.co`
   - `SUPABASE_PUBLISHABLE_KEY`: `sb_publishable_...`
   - `SUPABASE_SECRET_KEY`: `sb_secret_...`
4. Click **Deploy**!

---

## 📄 License
© 2024-2026 **Shree Sai Classes**. All rights reserved.
