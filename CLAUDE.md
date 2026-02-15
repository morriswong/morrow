# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Morrow is a cross-platform alarm clock app built with React Native + Expo. Key differentiators: personalized voice notifications with configurable personality/language, smart snoozing, and holiday calendar integration.

## Development Commands

```bash
# Start Expo dev server (press i for iOS, a for Android, w for web)
npm start

# Run on specific platforms
npm run ios        # expo run:ios (requires iOS simulator / Xcode)
npm run android    # expo run:android
npm run web        # expo start --web

# Landing page (separate Astro project in /landing)
cd landing && npm run dev      # local dev server
cd landing && npm run build    # production build
```

There are no linting or test commands configured — the project has no linter or test runner set up.

## Architecture

### Navigation (Expo Router — file-based)

The `app/` directory defines all routes via Expo Router:

- `app/index.tsx` — Home screen (alarm list)
- `app/ring.tsx` — Full-screen alarm ring (fade transition, back-gesture disabled)
- `app/wakeup.tsx` — Post-alarm confirmation (same modal behavior as ring)
- `app/(modal)/` — Modal group (slides up from bottom):
  - `alarm/new.tsx` and `alarm/[id].tsx` — Create/edit alarm
  - `sound/index.tsx` and `sound/language.tsx` — Voice/sound settings
  - `holidays/index.tsx` and `holidays/calendar.tsx` — Holiday skip configuration

Root layout (`app/_layout.tsx`) wraps everything in `GestureHandlerRootView`, loads Outfit fonts, and manages a custom shimmer splash overlay.

### State Management (Zustand)

Two stores in `stores/alarmStore.ts`:

- **`useAlarmStore`** — Persisted to AsyncStorage (`morrow-alarms` key) with Zustand `persist` middleware. Has versioned migrations (currently v2). Contains alarm CRUD actions and seed data for new users.
- **`useDraftAlarmStore`** — In-memory only. Holds a draft `Alarm` during create/edit flows, cleared on save/cancel.

### Design System (`constants/`)

- **Colors:** Dark purple theme. Background `#221A2E`, surface `#27213A`, accent `#511EE3`.
- **Typography:** Outfit font family (Regular/Medium/SemiBold/Bold). Sizes from Caption (12px) to Display (80px).
- **Spacing:** Token scale from `xs` (4) to `6xl` (64). Border radii from `sm` (8) to `full` (9999).

All design tokens live in `constants/` and are imported via barrel `constants/index.ts`.

### Type System (`types/index.ts`)

Core types: `Alarm`, `SoundSettings`, `VoicePersonality`, `SnoozeDuration`, `Holiday`, `HolidayCalendar`.

Key conventions:
- `repeatDays` uses 0-6 for Mon-Sun (not JS Date's 0=Sunday)
- `snoozeDuration` is a union type: `0 | 5 | 10 | 15 | 20 | 30`
- `isAM` boolean for 12-hour display (not 24-hour storage)

### Utilities (`utils/helpers.ts`)

Alarm scheduling logic: `getNextAlarmTime()`, `formatTimeUntilAlarm()`, `getNextEnabledAlarm()`, `sortAlarmsByTimeAndDay()`. Uses `date-fns` for date math.

### Component Organization

- `components/ui/` — Generic reusable primitives (Button, Toggle, Card, TopNav, DayPicker, etc.)
- `components/alarm/` — Alarm-specific (AlarmCard, TimePicker, SnoozePicker)
- `components/ring/` — Ring screen components (SlideToWake, NoSnoozeStreak)
- All component groups have barrel exports via `index.ts`

### Landing Page (`landing/`)

Separate Astro project with its own `package.json`. Deployed to GitHub Pages via `.github/workflows/deploy-landing.yml`. Has its own `node_modules` — run `npm install` inside `landing/` separately.

## Key Conventions

- Use `StyleSheet.create()` for all React Native styles (not inline objects)
- Import design tokens from `@/constants` (path alias `@/*` → project root)
- Components use functional style with hooks; no class components
- Animations use `react-native-reanimated` (shared values + animated styles)
- Icons come from `@expo/vector-icons` (Ionicons and Feather)
- When adding Zustand store migrations, increment the `version` number and handle all prior versions in `migrate`
