# 🧳 TrackOurExpense — Smart Group Trip Expense Splitter

> A modern, mobile-friendly web app to track, split, and settle group trip expenses with real-time math, timeline feeds, debt minimization, and peer-approval settlements.

---

## ✨ Features

- **🏖️ Trip Management**: Create trips, generate 6-character short invite codes (e.g. `GOA2026`), and share one-click WhatsApp/direct invite links.
- **⚡ Rapid Expense Logging (<15s)**: Add spends with title, amount, category, payer, custom split participants, payment mode (**Online / UPI** vs. **Cash**), and remarks.
- **📋 Timeline View**: Chronological cards showing who paid, who was included, per-person share, and payment tags.
- **🚩 Raise Concern System**: Any member can flag an entry with a concern message if something looks odd (e.g. incorrect bill or exclusion from an activity) without destroying data. Concerns can be resolved transparently.
- **⚖️ Balances & AI Debt Minimization**: Automatically calculates net balances and runs a greedy debt minimization algorithm so the group settles with the absolute minimum number of payments (eliminating circular transfers like A→B, B→C, C→A).
- **💸 Peer-Approved Settlements**: When someone pays another person, they log it as a settlement. The recipient receives a pending approval notification. Once confirmed, balances update automatically!
- **📊 Real-time Analytics**: Total trip budget spent, average cost per person, spending by category (food, stay, travel, sightseeing), and cash vs. online distribution.
- **👤 Zero-Friction Profile Switching**: Switch profiles or onboard new friends on the fly without complex OAuth hurdles.

---

## 🚀 Getting Started

### 1. Run Locally
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your phone or browser.

---

## 🌐 Deploy to Vercel (1-Click)

1. Push your repository to GitHub (already linked to `agrawal-soham/TrackOurExpense`).
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import `TrackOurExpense` and click **"Deploy"**.

### Optional: Connect Supabase for Cloud PostgreSQL
If you want persistent multi-region cloud PostgreSQL:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to the SQL Editor and paste the contents of `supabase-schema.sql`.
3. Add your Supabase credentials in your Vercel project environment variables.

---

## 📐 Backend Mathematics

### Net Balance Calculation
For each member $u$:
$$\text{NetBalance}(u) = \sum \text{Paid}(u) - \sum \text{FairShare}(u) + \sum \text{SettlementsSent}(u) - \sum \text{SettlementsReceived}(u)$$

- **Positive balance (+₹X)**: The group owes this member money.
- **Negative balance (-₹X)**: This member owes money to the group.
- **Conservation of money**: The sum of all net balances across the group is always identically zero.
