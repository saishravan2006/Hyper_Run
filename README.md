# HyperRun - Goal Execution System

A modern web application for solo founders to plan and execute long-term goals through structured timelines. Built with React, TypeScript, and a focus on productivity psychology.

## Features

### 🎯 Dual-Mode Interface

**General Mode** - Big Picture Planning
- Timeline visualization of all short runs
- Progress tracking at a glance
- Prevents overwhelm by hiding task details
- Quick navigation between phases

**Hyper Mode** - Deep Execution Focus
- Focused view on one short run at a time
- Today's Focus: limit yourself to 3 priority tasks
- Overdue task notifications
- Complete task management

### 📊 Data Structure

- **Long Runs**: Major goals (6-12 months)
- **Short Runs**: Key phases or milestones (2-8 weeks)
- **Micro Runs**: Optional smaller execution blocks (future feature)
- **Tasks**: Atomic work items with priorities and due dates

### 🎨 Design Highlights

- Clean, minimal aesthetics inspired by Linear and Notion
- Dark mode support with smooth transitions
- Glassmorphism and gradient accents
- Micro-animations for delightful interactions
- Fully responsive layout

### 💾 Persistence

- Local storage for data persistence
- No backend required
- Privacy-first (your data stays on your device)

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

### Usage

1. **Create a Long Run**
   - Click the "+" button in the sidebar
   - Set your goal, dates, and choose a color
   - Click "Create Long Run"

2. **Add Short Runs**
   - In General Mode, click "+ Add Short Run"
   - Define your milestones or phases
   - Set date ranges within your Long Run

3. **Execute in Hyper Mode**
   - Click "Open in Hyper Mode" on any Short Run
   - Add tasks for that phase
   - Select up to 3 tasks for Today's Focus
   - Check off tasks as you complete them

4. **Toggle Dark Mode**
   - Click the 🌙/☀️ icon in the top-right
   - Your preference is saved automatically

## Tech Stack

- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **State Management**: Zustand with persistence
- **Date Handling**: date-fns
- **Styling**: Custom CSS with design tokens
- **Icons**: Emoji (no icon library needed!)

## Project Structure

```
src/
├── components/
│   ├── ui/              # Reusable components (Button, Input, Modal, etc.)
│   ├── layout/          # App layout (Sidebar, TopBar)
│   ├── views/           # Mode views (GeneralMode, HyperMode)
│   └── forms/           # Data entry forms
├── store/               # Zustand state management
├── types/               # TypeScript type definitions
├── utils/               # Helper functions
│   ├── dates.ts         # Date formatting and calculations
│   ├── id.ts            # Unique ID generation
│   └── progress.ts      # Progress calculation logic
├── App.tsx              # Main app component
├── main.tsx             # App entry point
└── index.css            # Global styles and design system
```

## Future Enhancements

- [ ] Micro Runs UI implementation
- [ ] Drag-and-drop timeline editing
- [ ] Keyboard shortcuts (N for new task, etc.)
- [ ] Data export/import (JSON, CSV)
- [ ] Backend integration and sync
- [ ] Mobile app version
- [ ] Collaboration features
- [ ] Analytics dashboard
- [ ] Email/push notifications

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Code Style

- TypeScript strict mode enabled
- Type-only imports for types
- Functional components with hooks
- CSS modules per component
- Accessible HTML semantics

## License

MIT

## Acknowledgments

Design inspired by:
- Linear (project management)
- Notion (organization)
- Motion (calendar &amp; tasks)

Built with ♥ for solo founders who want to stay focused and avoid overwhelm.
