# Finance Dashboard UI

A React.js + JavaScript finance dashboard built for the assignment requirements. It uses mock data, frontend-only role simulation, local state management with React hooks, and local storage persistence for transactions and the selected role.

## Features Implemented

- Dashboard overview with summary cards for total balance, income, and expenses
- Time-based visualization with a balance trend chart
- Categorical visualization with a spending breakdown donut chart
- Transaction list showing date, amount, category, description, and type
- Transaction filtering by type and category
- Transaction sorting by date and amount
- Transaction search by description or category
- Role-based UI with `Viewer` and `Admin`
- Insights section with highest spending category and monthly comparison
- State management using React `useState`, `useEffect`, and derived state
- Responsive design for desktop, tablet, and mobile layouts
- Empty-state handling when filters return no results
- Local storage persistence for role and transaction changes

## Tech Stack

- React.js
- JavaScript
- Vite
- Plain CSS

## Run In VS Code

1. Open VS Code.
2. Open the project folder:
   `/Users/adipudisreekrishnaashrith/Desktop/Financial Dashboard`
3. Open the integrated terminal in VS Code.
4. Install dependencies:

```bash
npm install
```

5. Start the development server:

```bash
npm run dev
```

6. Open the local URL shown in the terminal, usually:

```text
http://localhost:5173
```

## Build For Production

```bash
npm run build
```

The production files will be generated in the `dist/` folder.

## GitHub Repository URL Steps

1. Create a new empty GitHub repository.
2. In the VS Code terminal, run:

```bash
git init
git add .
git commit -m "Build finance dashboard UI assignment"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME.git
git push -u origin main
```

3. Your GitHub Repository URL will be:

```text
https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME
```

## Live Demo URL Steps

### Option 1: Vercel

1. Push the project to GitHub.
2. Go to `https://vercel.com`.
3. Import the GitHub repository.
4. Framework preset: `Vite`
5. Build command: `npm run build`
6. Output directory: `dist`
7. Deploy.

Your Live Demo URL will look like:

```text
https://your-project-name.vercel.app
```

### Option 2: Netlify

1. Push the project to GitHub.
2. Go to `https://app.netlify.com`.
3. Add a new project from GitHub.
4. Build command: `npm run build`
5. Publish directory: `dist`
6. Deploy.

Your Live Demo URL will look like:

```text
https://your-project-name.netlify.app
```

## Suggested Submission Format

- Primary framework: `React.js with JavaScript`
- GitHub Repository URL: `https://github.com/YOUR_USERNAME/YOUR_REPOSITORY_NAME`
- Live Demo URL: `https://your-project-name.vercel.app`
- Features implemented:
  - Dashboard Overview with Summary Cards
  - Time Based Visualization
  - Categorical Visualization
  - Transaction List with Details
  - Transaction Filtering
  - Transaction Sorting or Search
  - Role Based UI
  - Insights Section
  - State Management
  - Responsive Design

## Notes

- Admin can add transactions from the dashboard UI.
- Viewer can inspect data but cannot add transactions.
- All data is mock data stored on the frontend only.
