# Shree Sai Classes — Automated Billing & Fee Management System (Flutter & Dart)

A cross-platform institutional fee management and automated billing application built entirely with **Flutter 3.44.1** and **Dart 3.12.1** for **Shree Sai Classes**.

Designed for desktop (Windows), web browsers, and mobile platforms with a high-contrast **Royal Blue, Crimson Red, and Crisp White** institutional ERP theme.

---

## 🌟 Key Features

### 1. 🧾 Automated Bill & Fee Receipt Generator (PDF & Direct Print)
- **High-Resolution Vector PDF**: Faithful reproduction of the reference fee receipt format using Flutter's native `pdf` and `printing` engine.
- **Header & Monogram**: Official **SSC Crest Emblem** with deep Navy Blue styling and Crimson Red category banner (*FYJC • SYJC • B.COM • BMS • SCIENCE • COMMERCE*).
- **Tabular Installment Breakdown**:
  - `Sr.No.` | `Instalment Date` | `Paid Date` | `Status (PAID/PENDING)` | `Amount (Rs.)` | `Details` (Cash, UPI / GPay, Net Banking, Cheque).
- **Financial Analytics**: Total Fees, Scholarships/Discounts, Net Grand Total, Total Paid Amount, and Balance Left to Pay.
- **Legal Terms & Signatures**: Custom terms and formal `(Student/Parent Signature)` & `(Staff/Authorised Signature)` signature blocks.
- **One-Click Actions**:
  - 🖨️ **Print Receipt**: Direct hardware printer preview and print dialog.
  - 📥 **Save PDF**: Native file save dialog to export `.pdf` invoices.
  - 💬 **WhatsApp Notification**: Direct pre-filled WhatsApp message with student balance and payment status.

---

### 2. 💻 Interactive Student Admission & Billing Console
- **Manual Admission Form**:
  - Student Name, Roll / Reg No, Student Mobile, Parent Mobile, Standard / Class (SYJC, FYJC, Class 10, Class 12, Degree, etc.), Course / Subjects, Academic Year.
  - Gross Fees, Scholarship Discount, and auto-computed Net Grand Total.
- **Dynamic Installment Builder**:
  - Multi-installment split presets (1, 2, 3, 4, 5, 7, 10 installments).
  - Auto-distributes due dates (monthly intervals) and calculates split amounts.
  - Custom installment editor with instant status toggling (`PAID` / `PENDING`), payment modes, and transaction reference numbers.
  - Real-time balance and collection metrics.

---

### 3. 📊 Excel & CSV Bulk Synchronization
- **Spreadsheet Bulk Importer**:
  - Select `.xlsx`, `.xls`, or `.csv` files.
  - Automatically parses student particulars, gross fees, discounts, and installment schedules.
  - Batch saves directly to the local database.
- **Sample Excel Template Generator**: Download pre-formatted Excel template with sample guidance rows.
- **Fee Report Exporter**: Export complete student rosters or filtered lists to formatted `.xlsx` workbooks.

---

### 4. ⚙️ Institute Customization & Preferences
- Update Institute Name, Tagline, Address, Phone Numbers, Email, and Website.
- Configure Receipt Prefixes (e.g. `SSC-REC`) and GST Registration numbers.
- Add / Edit / Remove custom Receipt Terms & Conditions.

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Framework** | **Flutter 3.44.1** | Cross-platform UI toolkit for Windows, Web, Android & iOS |
| **Language** | **Dart 3.12.1** | Strongly-typed client logic and reactive state management |
| **State Management** | **`provider: ^6.1.5`** | Reactive ChangeNotifiers for CRUD, filters, and real-time metrics |
| **PDF & Print Engine** | **`pdf: ^3.12.0`** + **`printing: ^5.14.3`** | Pixel-perfect PDF Fee Receipt generator matching reference format |
| **Spreadsheets** | **`excel: ^4.0.6`** + **`file_picker: ^8.3.7`** | Excel bulk import, sample template creation, and ledger exports |
| **Persistence** | **`shared_preferences: ^2.5.5`** | Local resilient JSON data storage with pre-seeded student records |
| **Typography & UI** | **`google_fonts: ^6.3.3`** | Plus Jakarta Sans & Outfit institutional typography |
| **Communication** | **`url_launcher: ^6.3.2`** | Instant WhatsApp message sharing to parents |

---

## 📁 Project Structure

```
shree_bill_gen/
├── lib/
│   ├── models/
│   │   ├── student.dart             # Student model & calculation engine
│   │   ├── installment.dart         # Installment row model (status, dates, modes)
│   │   └── institute_settings.dart  # Academy branding, GST, terms & conditions
│   ├── services/
│   │   ├── storage_service.dart     # Resilient local JSON storage & seed loader
│   │   ├── excel_service.dart       # Excel bulk import, export & template creation
│   │   └── pdf_receipt_service.dart # Official PDF Fee Receipt generator
│   ├── providers/
│   │   └── billing_provider.dart    # Central state provider for CRUD, filters & stats
│   ├── screens/
│   │   └── dashboard_screen.dart    # Executive dashboard, stats & student table console
│   ├── widgets/
│   │   ├── stat_cards_widget.dart   # Metric cards (Revenue, Collected, Balance Due)
│   │   ├── student_table_widget.dart# Searchable student roster table
│   │   ├── student_form_dialog.dart # New Admission & Dynamic Installment Console
│   │   ├── receipt_preview_dialog.dart # PDF Receipt preview, print & WhatsApp modal
│   │   ├── excel_import_dialog.dart # Excel file picker & preview uploader
│   │   └── settings_dialog.dart     # Academy details & receipt customization
│   └── main.dart                    # App entry point with Blue, Red & White theme
├── test/
│   ├── billing_logic_test.dart      # Unit tests for calculations and Excel services
│   └── widget_test.dart             # Test runner
├── pubspec.yaml                     # Dependencies and assets
└── README.md
```

---

## 🚀 Running the Application

### 1. Run on Chrome (Web Browser)
```bash
flutter run -d chrome
```

### 2. Run on Windows Desktop
```bash
flutter run -d windows
```

### 3. Run Tests & Code Analysis
```bash
dart analyze
flutter test
```

### 4. Build for Production Web
```bash
flutter build web
```
