# Everlight Homes Ethiopia — Premium Rental Marketplace

Everlight Homes Ethiopia is a production-grade, full-stack digital real estate rental marketplace designed specifically for the Ethiopian housing market (Addis Ababa, Bahir Dar, Hawassa, Adama, Mekelle, Dire Dawa).

Inspired by the Everlight Homes design language, the platform combines a Midnight Navy (`#0A1426`) and Champagne Gold (`#C59B38`) aesthetic with strict server-side authorization, role-based dashboards, honest verification tiers, an auditable commission tracking workflow, and persistent MongoDB Atlas storage.

---

## 1. Architecture & Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Runtime & Language**: Node.js `v22+`, TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with bespoke luxury design tokens, glassmorphism, and responsive grids
- **Database & ODM**: [MongoDB Atlas](https://www.mongodb.com/atlas) with [Mongoose](https://mongoosejs.com/)
- **Authentication**: `bcryptjs` (12 salt rounds), `jose` (cryptographically signed HTTP-only JWT cookies)
- **Validation**: [Zod](https://zod.dev/) request and payload schemas
- **Icons**: [Lucide React](https://lucide.dev/)
- **Image Storage**: Cloudinary Node.js SDK with automated base64/data URI fallback
- **Testing**: Built-in test runner (`tsx --test`) with 19 automated unit & security tests

---

## 2. Platform Roles & Permission Model

| Role | Access Permissions |
|---|---|
| **Public / Guest** | Browse verified marketplace listings, filter by Ethiopian city, property type, budget in ETB, bedrooms, and amenities. View full property details and transparent verification disclosures. |
| **Tenant** | Save bookmark favorites, submit rental inquiries and in-person viewing requests to landlords, review drafted rental agreements, record mutual confirmation, file dispute reports, and track status. |
| **Landlord** | Publish residential listings (with multi-image upload and primary photo selector), manage property availability (`available`, `rented`, `withdrawn`), inspect and respond to tenant viewing inquiries, draft rental agreement proposals with agreed rent and deposit, and review commission obligations. |
| **Administrator** | Central Operations Console (`/dashboard/admin`) with real database metrics, property moderation queue (approve/reject with reason), landlord/property verification queue (owner ID verification and physical inspection tracking), commission payment reconciliation with audit logging, and user dispute resolution. |

---

## 3. The Commission Business Model & Workflow

The platform operates as a licensed online rental agency, earning commission exclusively upon verified completion:

```
[Tenant Inquires / Requests Viewing]
                ↓
[Landlord Schedules & Conducts In-Person Viewing]
                ↓
[Parties Agree on Terms → Landlord Drafts Agreement Proposal]
                ↓
[Tenant Reviews & Confirms Proposal on Platform]
                ↓
[Agreement Marked COMPLETED]
                ↓
    ┌───────────────────────────┴───────────────────────────┐
    ↓                                                       ↓
[Property Set to "Rented"]              [Commission Record Generated]
                                        (Standard 50% first month rent,
                                         auditable due date & payer)
                                                            ↓
                                        [Admin Reconciles Payment]
                                        (CBE, Telebirr, or Bank Reference)
                                                            ↓
                                        [Immutable Audit Log Created]
```

- **Protection Against Duplicate Processing**: Unique compound constraints and database idempotency guards prevent duplicate commission generation for the same agreement.
- **Configurable Policy**: Commission percentages and payer rules are driven by `COMMISSION_PERCENTAGE`, `COMMISSION_PAYER`, and `COMMISSION_DUE_DAYS`.

---

## 4. Honest Verification Tiers

To preserve transparency, Everlight avoids generic "verified" badges. The platform distinguishes between:

1. **Unverified**: Property listed without identity verification or physical inspection.
2. **Owner ID Verified**: Landlord identity & ownership documents reviewed by Everlight moderators.
3. **Physically Inspected**: Property visited in-person by an Everlight field inspector to verify location and condition.
4. **Fully Verified & Inspected**: Both owner identity and physical property inspection verified.

---

## 5. Local Development Quickstart

### Prerequisites
- Node.js `v20` or `v22`
- npm `10+`
- MongoDB instance (MongoDB Atlas cluster or local MongoDB)

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Environment Configuration
Copy the template to your local environment file:
```bash
cp .env.example .env.local
```

Configure your variables in `.env.local`:
```ini
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/everlight_homes?retryWrites=true&w=majority
JWT_SECRET=your-random-32-character-secret-key-for-jwt-signing
AUTH_COOKIE_NAME=everlight_session

COMMISSION_PERCENTAGE=50
COMMISSION_PAYER=landlord
COMMISSION_DUE_DAYS=7

INITIAL_ADMIN_EMAIL=admin@everlight.et
INITIAL_ADMIN_PASSWORD=EverlightAdmin2026!
INITIAL_ADMIN_NAME=Everlight Head Moderator
```

### Step 3: Seed Test Data & Provision Initial Admin
```bash
npm run seed
```
This automatically seeds realistic Ethiopian properties in Addis Ababa (Bole, Old Airport, Sarbet, Kazanchis), Bahir Dar, and Hawassa, and provisions the initial administrator account.

### Step 4: Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Automated Testing & Production Build

### Run Test Suite
```bash
npm run test
```
Executes 19 automated tests covering:
- Commission percentage and minimum fee calculations
- Due date policy scheduling
- Password hashing salting and bcrypt verification
- JWT session token generation, verification, and tamper rejection
- Anti-privilege escalation (preventing self-assigned admin roles)
- Zod validation for properties, pricing, and official payment references

### Build for Production
```bash
npm run build
```

---

## 7. MongoDB Atlas & Vercel Deployment

1. **MongoDB Atlas**:
   - Create a free or dedicated cluster on MongoDB Atlas.
   - In **Network Access**, add `0.0.0.0/0` (or Vercel IP ranges) to the IP Access List.
   - In **Database Access**, create a user with read/write permissions to `everlight_homes`.
   - Copy the SRV connection string: `mongodb+srv://user:pass@cluster.mongodb.net/everlight_homes?retryWrites=true&w=majority`.

2. **Deploy to Vercel**:
   - Import the repository in the Vercel dashboard.
   - Under **Project Settings → Environment Variables**, add:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `AUTH_COOKIE_NAME`
     - `COMMISSION_PERCENTAGE`
     - `COMMISSION_PAYER`
     - `CLOUDINARY_CLOUD_NAME` (optional)
     - `CLOUDINARY_API_KEY` (optional)
     - `CLOUDINARY_API_SECRET` (optional)
   - Deploy. Vercel automatically runs `next build`.

---

## 8. Default Credentials for Testing

| Role | Email | Password |
|---|---|---|
| **Administrator** | `admin@everlight.et` | `EverlightAdmin2026!` |
| **Landlord 1** | `landlord1@everlight.et` | `Password123!` |
| **Landlord 2** | `landlord2@everlight.et` | `Password123!` |
| **Tenant** | `tenant1@everlight.et` | `Password123!` |
