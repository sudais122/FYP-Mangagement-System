# FYP Management System — Complete Technical Documentation
**Abdul Wali Khan University Mardan (AWKUM) — Department of Computer Science**
**Developed by:** Muhammad Sudais & Mahboob Ali | **Academic Year:** 2025–2026

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Technology Stack](#2-technology-stack)
3. [System Architecture](#3-system-architecture)
4. [User Roles & Access Control](#4-user-roles--access-control)
5. [Module 1 — Authentication](#5-module-1--authentication)
6. [Module 2 — Student Dashboard](#6-module-2--student-dashboard)
7. [Module 3 — Admin Dashboard](#7-module-3--admin-dashboard)
8. [Module 4 — Supervisor Dashboard](#8-module-4--supervisor-dashboard)
9. [Module 5 — Chairman Dashboard](#9-module-5--chairman-dashboard)
10. [Module 6 — Team Management](#10-module-6--team-management)
11. [Module 7 — Proposal System](#11-module-7--proposal-system)
12. [Module 8 — Marks & Evaluation](#12-module-8--marks--evaluation)
13. [Module 9 — Internship Module](#13-module-9--internship-module)
14. [Module 10 — Deadline Management](#14-module-10--deadline-management)
15. [Module 11 — Document Management](#15-module-11--document-management)
16. [Module 12 — Public Landing Page](#16-module-12--public-landing-page)
17. [Module 13 — Maintenance Mode](#17-module-13--maintenance-mode)
18. [Database Schema](#18-database-schema)
19. [API Reference](#19-api-reference)
20. [File Storage — AWS S3](#20-file-storage--aws-s3)
21. [Email System — Resend](#21-email-system--resend)
22. [Security Implementation](#22-security-implementation)
23. [Deployment Guide](#23-deployment-guide)
24. [Environment Variables](#24-environment-variables)

---

## 1. System Overview

The FYP Management System is a full-stack web application built to digitize and streamline the Final Year Project process at AWKUM's Computer Science Department. It replaces manual paper-based workflows with a centralized digital platform.

### Key Problems Solved

| Before | After |
|--------|-------|
| Manual proposal submission via physical forms | Digital PDF upload with real-time status tracking |
| No centralized marks system | Supervisor enters marks online, students see live updates |
| No deadline visibility | Deadlines visible on public homepage and student dashboard |
| Manual internship letter distribution | Download, fill, and upload digitally |
| No document organization | All documents in one place with S3 cloud storage |
| Email-based supervisor assignment | Admin assigns supervisors via dashboard |

### System Users

- **Students** — Submit proposals, track marks, manage team, upload documents
- **Supervisors** — Enter marks for assigned teams, communicate with students
- **Chairman / HOD** — Overview of all supervisors and teams
- **Admin** — Full system control, user management, settings
- **Public** — View deadlines, FAQs, Coursera info, submit internship letters

---

## 2. Technology Stack

### Backend
| Technology | Version | Purpose |
|-----------|-----|---------|
| Node.js   | 18+ | Runtime environment |
| Express.js| 4.x | Web framework |
| MongoDB   | 6.x | Database |
| Mongoose  | 7.x | ODM for MongoDB |
| JWT       | 9.x | Authentication tokens |
| Bcrypt    | 5.x | Password hashing |
| Multer    | 1.x | File upload handling |
| Multer-S3 | 3.x | Direct S3 upload |
| AWS SDK v3| 3.x | S3 client |
| Resend    | 2.x | Email delivery |
| Winston   | 3.x | Audit logging |
| CORS      | 2.x | Cross-origin requests |
| Dotenv    | -   | Environment variables |

### Frontend
| Technology | Purpose |
|-----------|---------|
| HTML5 | Structure |
| CSS3 + CSS Variables | Styling and theming |
| Vanilla JavaScript | Interactivity |
| Chart.js | Marks visualization |
| SweetAlert2 | Alert dialogs |
| Google Fonts (Playfair Display, DM Sans) | Typography |

### Infrastructure
| Service | Purpose |
|---------|---------|
| AWS S3 (eu-north-1) | File storage (CVs, proposals, certificates) |
| MongoDB Atlas | Cloud database |
| Resend | Transactional emails |
| PM2 | Process management |

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐  │
│  │ Public   │ │ Student  │ │ Admin    │ │Supervisor│  │
│  │ Landing  │ │Dashboard │ │Dashboard │ │Dashboard │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘  │
└─────────────────────────────────────────────────────────┘
                          │ HTTP/REST
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    API LAYER (Express)                    │
│  Auth │ Students │ Groups │ Admin │ Uploads │ Internship │
└─────────────────────────────────────────────────────────┘
         │                │               │
         ▼                ▼               ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│  MongoDB     │  │   AWS S3     │  │   Resend     │
│  Atlas       │  │  eu-north-1  │  │   Email      │
└──────────────┘  └──────────────┘  └──────────────┘
```

### Folder Structure

```
FYP-Mangagement-System/
├── Server/
│   ├── server.js                 # Entry point
│   ├── ecosystem.config.cjs      # PM2 configuration
│   ├── .env                      # Environment variables
│   ├── Models/
│   │   ├── student.js            # Student schema
│   │   ├── supervisor.js         # Supervisor schema
│   │   ├── admin.js              # Admin schema
│   │   ├── group.js              # Team/Group schema
│   │   ├── internship.js         # Internship schema
│   │   ├── deadline.js           # Deadline schema
│   │   ├── markToggle.js         # Mark permissions schema
│   │   └── Counter.js            # Auto-increment IDs
│   ├── controllers/
│   │   ├── authController.js     # Login, register, OTP
│   │   ├── adminController.js    # Admin operations
│   │   ├── groupController.js    # Team operations
│   │   ├── internshipController.js
│   │   └── uploadController.js   # File uploads
│   ├── Routes/
│   │   ├── authRoutes.js
│   │   ├── adminRoutes.js
│   │   ├── groupRoutes.js
│   │   ├── internshipRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── deadlineRoutes.js
│   ├── middleware/
│   │   ├── auth.js               # JWT protect middleware
│   │   ├── upload.js             # Multer-S3 config
│   │   ├── uploadProposal.js     # Local disk fallback
│   │   └── rateLimiter.js        # Rate limiting
│   ├── config/
│   │   └── s3.js                 # AWS S3 client
│   └── utils/
│       ├── generateToken.js      # JWT generation
│       ├── generateStudentId.js  # STD-YYYYXXXX format
│       ├── sendEmail.js          # Resend wrapper
│       ├── auditLogger.js        # Winston logger
│       ├── s3Delete.js           # S3 file deletion
│       └── s3GetSignedUrl.js     # Presigned URL generator
└── Client/
    ├── index.html                # Public landing page
    ├── shared/
    │   ├── css/
    │   │   ├── theme.css         # CSS variables & global styles
    │   │   └── global.css        # Landing page styles
    │   └── js/
    │       └── script.js         # Landing page JS
    ├── Auth/
    │   ├── login.html
    │   ├── register.html
    │   └── js/auth.js
    └── Dashboards/
        ├── Admin/
        │   ├── index.html
        │   ├── js/admin.js
        │   └── css/admin.css
        ├── Student/
        │   ├── index.html
        │   ├── js/student.js
        │   └── css/student.css
        ├── Supervisor/
        │   ├── index.html
        │   └── js/supervisor.js
        └── Chairman/
            ├── index.html
            └── js/chairman.js
```

---

## 4. User Roles & Access Control

### Role Hierarchy

```
Admin (Full Control)
  └── Chairman / HOD (Read-only overview)
       └── Supervisor (Marks entry for assigned teams)
            └── Student (Personal team & documents)
                 └── Public (Landing page + internship submission)
```

### Permission Matrix

| Feature | Public | Student | Supervisor | Chairman | Admin |
|---------|--------|---------|-----------|---------|-------|
| View deadlines | ✅ | ✅ | ✅ | ✅ | ✅ |
| Submit internship letter | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create team | ❌ | ✅ | ❌ | ❌ | ❌ |
| Submit proposal | ❌ | ✅ | ❌ | ❌ | ❌ |
| Enter marks | ❌ | ❌ | ✅ | ❌ | ✅ |
| Approve/Reject proposals | ❌ | ❌ | ❌ | ❌ | ✅ |
| Add supervisors | ❌ | ❌ | ❌ | ❌ | ✅ |
| Toggle maintenance mode | ❌ | ❌ | ❌ | ❌ | ✅ |
| View all students | ❌ | ❌ | ❌ | ✅ | ✅ |

---

## 5. Module 1 — Authentication

### Overview
Handles login, registration, password reset via OTP, and profile retrieval for all user types.

### 5.1 Student Registration

**Endpoint:** `POST /api/auth/register`

Students register with:
- Full name, email, WhatsApp, gender, password
- CV file (PDF, max 5MB) — uploaded to AWS S3
- Certificates file (PDF, optional, max 10MB) — uploaded to AWS S3

**S3 Storage Path:**
```
Student_Info/{First_Last}/{firstname}-cv.pdf
Student_Info/{First_Last}/{firstname}-certificates.pdf
```

**Student ID Format:** `STD-YYYY1234` (auto-generated, sequential)

**Process Flow:**
```
1. Frontend validates fields + PDF type
2. Multer-S3 uploads files directly to S3
3. Backend hashes password with bcrypt (10 rounds)
4. Student ID generated via Counter model
5. Student document created in MongoDB
6. Response returns student data (no password)
```

### 5.2 Login

**Endpoint:** `POST /api/auth/login`

Supports three user types in one endpoint:
1. Checks Student collection first
2. Then Supervisor collection
3. Then Admin collection

Returns JWT token + role-specific data.

**Student login returns:**
```json
{
  "_id": "...",
  "name": "Muhammad Sudais",
  "email": "sudais@email.com",
  "role": "student",
  "student_code": "STD-20261001",
  "gender": "male",
  "group": "...",
  "token": "eyJhbGc..."
}
```

**Supervisor login returns additional fields:**
```json
{
  "sup_code": "SUP-20260001",
  "prefix": "Dr",
  "designation": "Assistant Professor",
  "force_password_change": false,
  "is_chairman": false,
  "whatsapp": "03001234567",
  "avatar_url": "https://s3.amazonaws.com/..."
}
```

### 5.3 Password Reset (OTP Flow)

**Step 1 — Request OTP:**
`POST /api/auth/forgot-password`
- Finds user by email across all collections
- Generates 6-digit OTP
- Stores OTP + 15-minute expiry in user document
- Sends email via Resend

**Step 2 — Verify OTP:**
`POST /api/auth/verify-otp`
- Checks OTP matches and hasn't expired

**Step 3 — Reset Password:**
`POST /api/auth/reset-password`
- Hashes new password with bcrypt
- Clears OTP fields

### 5.4 Rate Limiting

| Endpoint | Limit |
|----------|-------|
| Login | 5 requests / 15 minutes |
| Register | 3 requests / hour |
| Forgot Password | 3 requests / 15 minutes |

### 5.5 JWT Configuration

- Algorithm: HS256
- Expiry: 30 days
- Payload: `{ id, role, email }`

---

## 6. Module 2 — Student Dashboard

### Overview
The student dashboard is a single-page application with tabbed navigation. Students access it after login.

### 6.1 Tabs

| Tab | Purpose |
|----|---------|
| Home | Overview cards, deadlines, quick stats |
| My Team | Team members, add member button |
| My Project | Proposal upload, project details |
| Supervisor | Supervisor contact info |
| Progress | Marks table + pie chart |
| Documents | CV, certificates, proposal links |

### 6.2 Home Tab

Displays:
- Personalized greeting with gender-based title (`Mr.` / `Ms.`) and time-based message
- Live clock showing day, date, time
- Team ID, project title, supervisor name
- Upcoming deadlines fetched from API
- Quick action buttons

**Greeting Logic:**
```
Morning (5-12):   "Good Morning, Mr. Sudais ☀️"
Afternoon (12-17): "Good Afternoon, Ms. Sara 🌤️"
Evening (17-21):  "Good Evening, Mr. Ali 🌆"
Night (21-5):     "Good Night, Ms. Zara 🌙"
```

### 6.3 Team Tab

Shows all team members with gender-based avatars:
- Female students: female avatar image
- Male students: male avatar image

**Team Leader can:**
- View all members with roles (Leader / Member)
- Add new member (if team has < 3 members and proposal not approved)
- Search member by student code (format: STD-YYYYXXXX)

**Add Member Flow:**
```
1. Leader opens Add Member modal
2. Searches by student code
3. Backend checks: student exists? in a team? team full?
4. If valid → displays student info
5. Leader clicks Add
6. Backend adds to group.members array
7. UI updates immediately
```

### 6.4 My Project Tab

Displays:
- Team ID, project title, category, supervisor
- Proposal submission area (state-based UI)
- Edit button (Leader only, before proposal approval)

**Proposal States:**

| State | UI Shown |
|-------|----------|
| idle | Drag & drop upload zone |
| pending | "Under Review" message |
| approved | "Approved" success state |
| rejected | Error message + re-upload zone |

### 6.5 Progress Tab

Displays marks entered by supervisor:

**Mark Categories:**

| Category | Components | Max Marks |
|---------|-----------|-----------|
| Monthly Meetings | Oct, Nov, Dec, Feb, Mar | 10 each = 50 |
| Submissions | Proposal, Progress Report, Progress Similarity | 10+20+5 = 35 |
| Documentation | Thesis/Final Report, Thesis Similarity | 20+5 = 25 |
| Practical | Code/Practical Work | 10 |
| Viva | Internal 1, Internal 2, External | 25+25+30 = 80 |
| **Total** | | **200** |

Features:
- Student tab switcher (shows all team members)
- Doughnut pie chart per section
- Progress bar per section
- Color coding: Green ≥75%, Yellow ≥50%, Red <50%

### 6.6 Documents Tab

Shows all student documents:

| Document | Source | Viewable When |
|---------|--------|--------------|
| CV | Uploaded at registration | Always |
| Certificates | Uploaded at registration | Always |
| Project Proposal | Uploaded by team | Only when approved |

All S3 documents use **presigned URLs** (15-minute expiry) for secure access.

---

## 7. Module 3 — Admin Dashboard

### Overview
Full administrative control panel. Only accessible with admin role JWT.

### 7.1 Dashboard Overview

Stat cards showing:
- Total Students
- Total Supervisors
- Active Teams
- Internship Letters count

Recent Teams table (last 3 teams with proposal actions).

### 7.2 Supervisor Management

**Add Supervisor:**
- Fields: Prefix (Dr/Prof/Mr/Ms/Mrs/Engr), Full Name, Email, WhatsApp, Role, Password
- Auto-generated Supervisor ID: `SUP-YYYY0001`
- Force password change on first login option
- Preview shows formatted name (e.g., "Dr. Naila Khan")

**Edit Supervisor:**
- All fields editable except password
- Role can be changed between Supervisor and Chairman

**Delete Supervisor:**
- Confirmation modal
- All assigned teams become unassigned

**Supervisor Cards show:**
- Avatar (photo or initials fallback)
- Supervisor code, designation, team count, WhatsApp

### 7.3 Team Management

Table with columns: Team ID | Title | Supervisor | Proposal | Actions

**Proposal Filter Buttons:**
- All | Pending | Approved | Rejected

**Search:** Filter by team code, project title, supervisor name

**Proposal Actions (per team):**
- View proposal (opens S3 presigned URL)
- Accept → sets status to "approved", notifies student
- Reject → opens confirmation modal with optional reason, **permanently deletes file from S3**, increments attempt counter

**Reassign Supervisor:**
- Modal with dropdown of all supervisors
- Updates team's supervisor reference

### 7.4 Student Management

Table with columns: Student | Student ID | Supervisor | Marks | Documents | Actions

**Actions per student (3 stacked buttons):**

1. **View** — Read-only modal showing:
   - Name, Student ID, Email, WhatsApp, Gender
   - Supervisor, Project Title
   - View CV button, View Proposal button

2. **Edit** — Opens supervisor's marks page for that student's team

3. **Delete** — Removes student; if team leader, deletes entire team

**Documents column shows:**
- CV badge (with view eye button)
- Proposal badge (with status color)
- Certificates badge (with view eye button)

### 7.5 Mark Settings

Toggle ON/OFF for each mark component globally. When a component is OFF, supervisors cannot edit that mark.

Mark permission matrix stored in `MarkToggle` collection.

### 7.6 Deadline Management

Create/Edit/Delete deadlines with:
- Type (Proposal Submission, SRS, Documentation, Presentation, Final Report, Other)
- Custom name (if "Other")
- Description
- Due date (time auto-set to 11:59 PM)

Status badges:
- Green: More than 2 days left
- Amber: 1-2 days left
- Red: Expired

### 7.7 Student Lookup

Advanced search across all students by:
- Name, Email, Student ID, Team ID, Project Title, Supervisor Name

Results show full profile card with marks progress bar.

### 7.8 Internship Submissions

Table showing all public internship submissions with:
- Full Name, CNIC (formatted: XXXXX-XXXXXXX-X), Discipline, Date, View Letter button

Search bar filters by student name.

### 7.9 Maintenance Mode

Toggle to lock out all non-admin users:
- Students, supervisors, chairman see maintenance page
- Admin can still access dashboard
- Custom reason message shown to locked-out users
- Started timestamp recorded

---

## 8. Module 4 — Supervisor Dashboard

### Overview
Supervisors access teams assigned to them and enter marks.

### Key Features
- View assigned teams and their students
- Enter marks per student per component
- Live total calculation as marks are typed
- Save marks to backend
- Avatar upload (profile picture)
- Force password change on first login

### Marks Entry

Each student row has input cells for all 14 mark components. Input validation:
- Cannot exceed max marks for component
- Red highlight on invalid entry
- Live running total updates as you type

### Password Change Flow

If `force_password_change = true`:
1. After login, redirect to change-password page
2. Must set new password before accessing dashboard
3. Flag set to `false` after successful change

---

## 9. Module 5 — Chairman Dashboard

### Overview
Read-only elevated view. Chairman sees everything supervisors see plus department-wide overview.

**Chairman is a Supervisor with `is_chairman: true`**

Additional access:
- View all supervisors and their teams
- View all students across all teams
- Cannot modify marks or settings (read-only)

---

## 10. Module 6 — Team Management

### Team Creation (Student Flow)

**Step 1 — Project Details:**
- Project title (required)
- Category (Web Dev, Mobile, AI/ML, Data Science, Cybersecurity, Embedded, Other)
- Auto-generated team ID displayed

**Step 2 — Add Members:**
- Leader is auto-added
- Search additional members by student code
- Maximum 3 students per team (1 leader + 2 members)
- Cannot add students already in a team

**Step 3 — Choose Supervisor:**
- Dropdown with all available supervisors
- Preview shows supervisor name and research areas

**Team ID Format:** `TEAM-YYYYXXXX` (e.g., TEAM-20260009)

### Team Data Model

```
Group {
  team_code: String (unique)
  project_title: String
  category: String
  leader: ObjectId → Student
  members: [ObjectId → Student]
  supervisor: ObjectId → Supervisor
  proposal_url: String (S3 URL)
  proposal_status: "pending" | "approved" | "rejected"
  proposal_attempt: Number
  proposal_filename: String
  proposal_uploaded_by: ObjectId → Student
  proposal_uploaded_at: Date
  rejection_reason: String
  proposal_history: [{ url, uploaded_at, rejected_at, reason }]
  createdAt, updatedAt
}
```

---

## 11. Module 7 — Proposal System

### Upload Flow

1. Student (any team member) selects PDF file
2. Frontend validates: PDF only, max 20MB
3. File uploaded to S3:
   ```
   proposals/{TEAM-CODE}-attempt{N}-{timestamp}.pdf
   ```
4. Group document updated with URL and status "pending"
5. Student sees "Pending Review" state

### Admin Review Flow

**Approve:**
- Status → "approved"
- Student can now view proposal in Documents tab
- Email notification sent to team

**Reject:**
- Confirmation modal with optional reason
- File permanently deleted from S3
- Status → "rejected", `proposal_url` set to null
- Attempt counter incremented
- Student sees rejection message and re-upload zone

### Second Attempt

When student re-uploads after rejection:
- New unique S3 key generated with new timestamp
- Attempt counter visible in admin table
- Previous attempt history stored in `proposal_history`

---

## 12. Module 8 — Marks & Evaluation

### Mark Schema

```
Mark {
  student: ObjectId → Student
  group: ObjectId → Group
  monthly: {
    oct, nov, dec, feb, mar  (0-10 each)
  }
  submissions: {
    proposal: 0-10
    progress: 0-20
    prog_sim: 0-5
    thesis_sim: 0-5
    code: 0-10
  }
  documentation: {
    final: 0-20  (Thesis/Final Report)
  }
  viva: {
    internal1: 0-25
    internal2: 0-25
    external: 0-30
  }
  total: Number (computed)
  updatedAt: Date
}
```

### Mark Toggles

Admin controls which marks supervisors can edit. Stored as:
```
MarkToggle {
  toggles: {
    oct: Boolean,
    nov: Boolean,
    proposal: Boolean,
    iv1: Boolean,
    ...
  }
}
```

If toggle is OFF, supervisor's input is disabled for that component.

### Visualization

**Pie Chart (Doughnut):**
- Color-coded by section
- Tooltip shows section marks and percentage

**Progress Bars:**
- Per section
- Color: Green ≥75%, Amber ≥50%, Red <50%

**Summary Card:**
- Total obtained / 200
- Overall percentage ring

---

## 13. Module 9 — Internship Module

### Public Submission (No Login Required)

Students fill out the form on the landing page:

| Field | Validation |
|-------|-----------|
| Full Name | Required |
| CNIC | 13 digits, formatted as XXXXX-XXXXXXX-X |
| Discipline | One of 4 CS disciplines |
| Acceptance Letter | PDF only, max 10MB |

**File stored at:** `internships/acceptance/{timestamp}-{safeName}`

**Disciplines accepted:**
- BS Computer Science (Hons)
- Software Engineering
- Artificial Intelligence
- Cyber Security

### Download Request Letter

`GET /api/internship/download-letter`

Returns the official internship request letter as a `.docx` file, stored in `Server/static/`.

### Student View Own Submission

`GET /api/internship/my` (requires login)

Students can check if their submission was received.

### Admin View

Table showing all submissions with pagination (25 per page), search by name, and view letter button.

---

## 14. Module 10 — Deadline Management

### Admin Creates Deadlines

Types available:
- Proposal Submission
- SRS Submission
- Documentation
- Presentation
- Final Report
- Other (with custom name)

All deadlines auto-set to **11:59 PM** on the selected date.

### Student View

Deadlines appear in:
1. **Public homepage** — decorative date cards with status badges
2. **Student dashboard home tab** — compact list with color coding

### Status Logic

```
diffDays < 0     → "Expired" (red)
diffDays === 0   → "Due Today!" (amber)
diffDays <= 2    → "{N} days left" (amber)
diffDays > 2     → "{N} days left" (green)
```

---

## 15. Module 11 — Document Management

### S3 Storage Structure

```
fyp-management-system/
├── Student_Info/
│   └── {First_Last}/
│       ├── {firstname}-cv.pdf
│       └── {firstname}-certificates.pdf
├── proposals/
│   └── {TEAM-CODE}-attempt{N}-{timestamp}.pdf
├── avatar/
│   └── {timestamp}-{userId}.{ext}
└── internships/
    └── acceptance/
        └── {timestamp}-{safeName}.pdf
```

### Presigned URLs

All S3 files are private. To view a document:

1. Frontend calls: `GET /api/uploads/signed-url?url={s3_url}`
2. Backend generates presigned URL (valid 15 minutes)
3. Frontend opens presigned URL in new tab

This ensures files are never publicly accessible by guessing URLs.

### File Size Limits

| File Type | Max Size |
|-----------|---------|
| CV | 5 MB |
| Certificates | 10 MB |
| Proposal | 20 MB |
| Avatar | 3 MB |
| Internship Letter | 10 MB |

---

## 16. Module 12 — Public Landing Page

### Pages/Sections

| Section | Content |
|---------|---------|
| Home | Hero slider, overview cards, statistics, deadlines |
| Coursera | Approved course list by category (accordion) |
| FAQs | Common questions (accordion) |
| Messages | Chairman and FYP Coordinator messages |
| Internship | Download request letter + upload acceptance letter |
| Developers | Team profile cards |

### Hero Slider

Auto-rotating image slider (4 slides, 4-second interval). Pauses on hover.

### Statistics (Static)

```
320+ Enrolled Students
48   Faculty Supervisors
150+ Active Projects
96%  Submission Rate
```

### Deadlines on Homepage

Fetched live from `GET /api/deadlines` (public endpoint, no auth).

### PiP Video Player

Picture-in-picture demo video player with:
- Drag to reposition
- Expand to fullscreen
- Mute/unmute, play/pause
- Seek bar
- Keyboard shortcuts (← → for seeking, Esc to minimize)

---

## 17. Module 13 — Maintenance Mode

### How It Works

Admin toggles maintenance mode ON:
1. All API requests return `503` with `{ maintenance_mode: true }`
2. Frontend interceptor (on all dashboards) detects 503
3. User redirected to `maintenance.html`
4. Admin's own token bypasses maintenance check

### Implementation

**Frontend interceptor (in all dashboard JS files):**
```javascript
const _origFetch = window.fetch;
window.fetch = async function(...args) {
  const res = await _origFetch(...args);
  if (res.status === 503) {
    const data = await res.clone().json();
    if (data.maintenance_mode) {
      window.location.href = "../../maintenance.html";
    }
  }
  return res;
};
```

### Maintenance Data Stored

```
Admin {
  maintenance_mode: Boolean
  maintenance_reason: String
  maintenance_started_at: Date
}
```

---

## 18. Database Schema

### Student Model

```javascript
{
  name:              String (required)
  email:             String (unique, required)
  whatsapp:          String
  gender:            String ('male' | 'female')
  password:          String (hashed, selected: false)
  student_code:      String (unique, e.g., STD-20261001)
  cv_url:            String (S3 URL)
  certificates_url:  String (S3 URL)
  group:             ObjectId → Group
  team_role:         String ('Leader' | 'Member')
  avatar_url:        String
  resetPasswordToken:   String
  resetPasswordExpire:  Date
  createdAt, updatedAt
}
```

### Supervisor Model

```javascript
{
  name:                  String
  email:                 String (unique)
  password:              String (hashed)
  sup_code:              String (unique, e.g., SUP-20260001)
  prefix:                String (Dr/Prof/Mr/Ms/Mrs/Engr)
  designation:           String
  whatsapp:              String
  research_areas:        [String]
  office:                String
  office_hours:          String
  avatar_url:            String
  is_chairman:           Boolean
  role:                  String ('supervisor' | 'chairman')
  force_password_change: Boolean
  resetPasswordToken:    String
  resetPasswordExpire:   Date
  createdAt, updatedAt
}
```

### Group Model

```javascript
{
  team_code:             String (unique, e.g., TEAM-20260009)
  project_title:         String
  category:              String
  leader:                ObjectId → Student
  members:               [ObjectId → Student]
  supervisor:            ObjectId → Supervisor
  proposal_url:          String
  proposal_status:       String ('pending'|'approved'|'rejected')
  proposal_attempt:      Number (default: 1)
  proposal_filename:     String
  proposal_file_deleted: Boolean
  proposal_uploaded_by:  ObjectId → Student
  proposal_uploaded_at:  Date
  rejection_reason:      String
  proposal_history:      [{ url, uploaded_at, rejected_at, reason }]
  createdAt, updatedAt
}
```

### Internship Model

```javascript
{
  full_name:                   String
  cnic:                        String (13 digits)
  discipline:                  String (enum)
  acceptance_letter_url:       String
  acceptance_letter_filename:  String
  acceptance_letter_uploaded_at: Date
  student:                     ObjectId → Student
  createdAt, updatedAt
}
```

### Deadline Model

```javascript
{
  type:       String (enum)
  customName: String
  description: String
  dueDate:    Date
  createdAt, updatedAt
}
```

---

## 19. API Reference

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | No | Login for all users |
| POST | `/register` | No | Student registration |
| POST | `/forgot-password` | No | Request OTP |
| POST | `/verify-otp` | No | Verify OTP |
| POST | `/reset-password` | No | Set new password |
| GET | `/profile` | Yes | Get current user profile |

### Admin Routes (`/api/admin`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stats` | Dashboard statistics |
| GET | `/supervisors` | List all supervisors |
| POST | `/supervisors` | Add supervisor |
| PUT | `/supervisors/:id` | Update supervisor |
| DELETE | `/supervisors/:id` | Delete supervisor |
| GET | `/supervisors/:id` | Supervisor + teams detail |
| GET | `/students` | List all students |
| DELETE | `/student/:id` | Delete student |
| POST | `/marks` | Save student marks |
| GET | `/marks/group/:id` | Get group marks |
| GET | `/mark-toggles` | Get toggle settings |
| POST | `/mark-toggles` | Save toggle settings |
| GET | `/maintenance` | Get maintenance status |
| POST | `/maintenance` | Toggle maintenance |

### Group Routes (`/api/groups`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/` | Student | Create team |
| GET | `/` | Admin/Sup | List all groups |
| GET | `/next-id` | Student | Get next team ID |
| PUT | `/:id/add-member` | Student | Add member |
| PUT | `/:id/reassign` | Admin | Reassign supervisor |
| PUT | `/:id/proposal-status` | Admin | Approve/Reject proposal |
| PUT | `/:id/update-project` | Student | Update title/category |

### Student Routes (`/api/students`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/dashboard` | Student dashboard data |
| GET | `/search` | Search by student code |
| GET | `/team-marks` | Get team's marks |
| GET | `/available` | Available supervisors |

### Upload Routes (`/api/uploads`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/student/cv` | Upload student CV |
| POST | `/student/avatar` | Upload student avatar |
| POST | `/admin/avatar` | Upload admin avatar |
| POST | `/supervisor/avatar` | Upload supervisor avatar |
| POST | `/group/:id/proposal` | Upload proposal |
| GET | `/signed-url` | Get S3 presigned URL |

### Internship Routes (`/api/internship`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/download-letter` | No | Download request letter |
| POST | `/submit` | No | Submit acceptance letter |
| GET | `/my` | Student | View own submission |
| GET | `/admin/all` | Admin | All submissions |
| GET | `/admin/:id` | Admin | Single submission |
| PUT | `/admin/:id/status` | Admin | Update status |
| DELETE | `/admin/:id` | Admin | Delete submission |

### Deadline Routes (`/api/deadlines`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/` | No | List all deadlines |
| POST | `/` | Admin | Create deadline |
| PUT | `/:id` | Admin | Update deadline |
| DELETE | `/:id` | Admin | Delete deadline |

---

## 20. File Storage — AWS S3

### Configuration

- **Bucket:** `fyp-management-system`
- **Region:** `eu-north-1` (Stockholm)
- **Access:** Private (no public access)

### Upload Configuration (Multer-S3)

Files are uploaded directly from the Node.js server to S3 using streaming — no temporary local storage except for proposals (local disk fallback).

### Content Type Detection

`multerS3.AUTO_CONTENT_TYPE` automatically sets the correct MIME type based on the file.

### File Deletion

When a proposal is rejected, the file is permanently deleted from S3:
```javascript
await s3Client.send(new DeleteObjectCommand({
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: extractKeyFromUrl(url)
}));
```

### Presigned URL Generation

```javascript
const command = new GetObjectCommand({
  Bucket: process.env.AWS_BUCKET_NAME,
  Key: key,
});
const url = await getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 minutes
```

---

## 21. Email System — Resend

### Templates

**OTP Email (Student):**
- Subject: "Your OTP Code — FYP Management System"
- Contains 6-digit OTP, 15-minute validity warning

**OTP Email (Supervisor):**
- Branded with supervisor-specific content
- Same OTP mechanism

### Integration

```javascript
const resend = new Resend(process.env.RESEND_API_KEY);
await resend.emails.send({
  from: 'FYP Management <noreply@yourdomain.com>',
  to: email,
  subject: template.subject,
  html: template.html,
});
```

### Current Status

Resend is configured in testing mode. To send to all recipients, a domain must be verified at resend.com/domains. Currently only sends to the registered Resend account email.

---

## 22. Security Implementation

### Authentication

- JWT tokens with 30-day expiry
- Bcrypt password hashing (10 salt rounds)
- Role-based route protection via `protect` middleware

### Rate Limiting

Prevents brute force attacks on auth endpoints using `express-rate-limit`.

### Input Validation

- File type checking (MIME type + extension)
- File size limits enforced at middleware level
- Required field validation on all endpoints

### CORS

Whitelist-based CORS policy. Only configured frontend origins can make API requests.

### Audit Logging

Admin actions are logged to `logs/audit.log` using Winston:
- Supervisor added/updated/deleted
- Marks toggled
- Maintenance mode changed

### S3 Security

- Bucket is completely private
- Files accessed only via short-lived presigned URLs (15 minutes)
- IAM user has minimal required permissions (PutObject, GetObject, DeleteObject)

---

## 23. Deployment Guide

### Local Development

```bash
# Start backend
cd Server
npm install
pm2 start ecosystem.config.cjs

# Frontend
# Open Client/index.html in browser
# Or use Live Server VS Code extension
```

### Production Deployment

**Backend → Render.com**
- Connect GitHub repo
- Root directory: `Server`
- Build: `npm install`
- Start: `node server.js`
- Add all environment variables

**Frontend → Vercel.com**
- Connect GitHub repo
- Root directory: `Client`
- No build command needed

**DNS Records:**
```
CNAME  fyp  →  cname.vercel-dns.com
CNAME  api  →  your-app.onrender.com
```

---

## 24. Environment Variables

```env
# Server
PORT=5001
NODE_ENV=development

# Database
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/fyp_db

# Authentication
JWT_SECRET=your_very_long_random_secret_key_here

# AWS S3
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_BUCKET_NAME=fyp-management-system
AWS_REGION=eu-north-1

# Email
RESEND_API_KEY=re_...

# Frontend (for CORS in production)
FRONTEND_URL=https://fyp.awkum.edu.pk
```

---

## Appendix A — Default Admin Account

On first run, seed the admin account:

```bash
cd Server
node seedAdmin.js
```

Default credentials (change immediately):
- Email: `admin@awkum.edu.pk`
- Password: set in seedAdmin.js

---

## Appendix B — Glossary

| Term | Meaning |
|------|---------|
| FYP | Final Year Project |
| STD Code | Student identification code (STD-YYYYXXXX) |
| SUP Code | Supervisor identification code (SUP-YYYY0001) |
| Team Code | Group identifier (TEAM-YYYYXXXX) |
| OTP | One-Time Password (for password reset) |
| S3 | Amazon Simple Storage Service |
| Presigned URL | Temporary S3 access URL (15 min expiry) |
| JWT | JSON Web Token (authentication) |
| PM2 | Process Manager 2 (keeps server running) |
| HOD | Head of Department (Chairman role) |

---

*Documentation Version 1.0 | FYP Management System | AWKUM CS Department | 2025–2026*
*Developed by Muhammad Sudais (Full Stack) & Mahboob Ali (Frontend)*