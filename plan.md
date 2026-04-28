# TSP Maximizer Implementation Plan

## Goal
Build a TSP (Thrift Savings Plan) contribution maximizer web application using React, TypeScript, and Vite. The application will serve as an interactive calculator where the user can input their current pay, contributions so far, and agency matches. It will reactively display the optimal contribution rate for the rest of the year to maximize agency matches without exceeding the annual IRS limit.

We will use **pnpm** as the package manager and configure the development server to bind to an OS-free port (`0`).

## Architecture & Framework
- **Framework**: Vite + React + TypeScript
- **Package Manager**: pnpm
- **Styling**: Vanilla CSS with modern aesthetics (glassmorphism, CSS variables, dark-mode palette, and micro-animations).

## Application Logic (Inputs & Outputs)
### Inputs
- Base pay (defaults to 6177.30)
- How much you have contributed so far (defaults 8524.69)
- Current rate of contribution (defaults to 33%)
- Current agency auto contribution (defaults to 247.08)
- Current agency match contribution (defaults to 988.36)
- Maximum annual contribution (defaults to 24500)
- Maximum match (defaults to 4%)
- Auto contribution (defaults to 1%)
- Total pay periods per year (assumed 26, customizable in UI)

### Derived Values & Logic
- **Past Pay Periods**: Inferred from `agency auto contribution / (base pay * auto contribution rate)`.
- **Remaining Pay Periods**: `Total Pay Periods - Past Pay Periods`.
- **Remaining Contribution Limit**: `Maximum annual contribution - Contributions so far`.
- **Maximized Target Per Period**: Ensures the user contributes exactly enough to hit the annual limit but not exceed it prematurely, spread across remaining pay periods.

### Outputs
- The recommended rate of contribution for the rest of the year to maximize the match.
- The projected total value (contributions + matches) by year-end if the recommended rate is followed.

## Execution Steps
1. Scaffold project: `pnpm create vite ./ --template react-ts`
2. Configure `vite.config.ts` to use `port: 0` for the server.
3. Replace the contents of `src/App.tsx` with the reactive form and computation logic.
4. Replace the contents of `src/index.css` and `src/App.css` to build a premium, visually stunning user interface.
5. Boot the development server with `pnpm run dev`.
