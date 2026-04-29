# TSP Contribution Maximizer

[![CI](https://github.com/the-hcma/tsp-maximizer/actions/workflows/ci.yml/badge.svg)](https://github.com/the-hcma/tsp-maximizer/actions/workflows/ci.yml)
[![Release](https://github.com/the-hcma/tsp-maximizer/actions/workflows/release-please.yml/badge.svg)](https://github.com/the-hcma/tsp-maximizer/actions/workflows/release-please.yml)
[![npm](https://img.shields.io/npm/v/%40the-hcma%2Ftsp-maximizer)](https://www.npmjs.com/package/@the-hcma/tsp-maximizer)
[![npm downloads](https://img.shields.io/npm/dm/%40the-hcma%2Ftsp-maximizer)](https://www.npmjs.com/package/@the-hcma/tsp-maximizer)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A lightweight, highly accurate React/TypeScript web utility designed to optimize Thrift Savings Plan (TSP) contribution rates for federal employees (BRS/FERS).

![TSP Maximizer — light mode](docs/tsp-maximizer.png)

> **⚠️ Disclaimer: Not Financial Advice**
>
> This tool is provided for informational and educational purposes only. It is **not** financial, tax, or investment advice. The calculations are based on publicly available payroll rules and may not reflect your specific situation, agency payroll system, or plan changes. Always consult your agency's HR/payroll office or a qualified financial advisor before making contribution changes.
>
> **Use this application at your own risk.** The authors assume no responsibility for any financial decisions made based on its output.
>
> **Learn more about the TSP and BRS/FERS programs:**
> - [Thrift Savings Plan — Official Website](https://www.tsp.gov)
> - [TSP Contribution Limits](https://www.tsp.gov/making-contributions/contribution-limits/)
> - [Blended Retirement System (BRS) Overview](https://militarypay.defense.gov/BlendedRetirement/)
> - [FERS Retirement Information — OPM](https://www.opm.gov/retirement-services/fers-information/)

Federal payroll systems strictly calculate agency matching on a per-pay-period basis. If you contribute too much early in the year and hit the annual IRS limit, your contributions will be abruptly cut off—meaning you lose out on the free 4% agency match for the remaining pay periods. 

This tool dynamically simulates the exact mathematical mechanics of federal payroll processors (like DFAS and NFC) to help you choose the precise contribution percentage needed to safely max out your IRS limit without leaving any matching money on the table.

## Features
- **Real-Time Strategy Comparison:** Compare your current contribution trajectory against the mathematically "Optimal" strategy and the "Capture the Max Match" (minimum impact) strategy side-by-side.
- **Fractional Pay Period Simulation:** Accurately models the exact edge cases of federal payroll, such as hitting the IRS limit mid-pay-period and evaluating if the fractional spillover is large enough to trigger the 5% matching threshold.
- **Dynamic Lost Match Alerts:** Explicitly calculates and warns you exactly how many dollars of agency matching you are leaving on the table if you undercontribute or overcontribute.
- **Premium Interface:** Built with a fully responsive, glassmorphic UI with dark and light mode support.

## Quick Start

Run directly from npm — no installation required:

```bash
npx @the-hcma/tsp-maximizer
```

This serves the app locally and **opens it automatically in your browser**. Requires Node.js 18+.

To expose the server on your local network (e.g. for mobile testing or a headless server):

```bash
npx @the-hcma/tsp-maximizer --host
```

## Getting Started (Development)

This section is for contributors who want to run or modify the source code locally.

### Prerequisites

Install Node.js (v18+) and the `pnpm` package manager.

**macOS**
1. Install [Homebrew](https://brew.sh/): `/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"`
2. Install Node.js: `brew install node`
3. Enable pnpm: `corepack enable pnpm`

**Windows**
1. Install [nvm-windows](https://github.com/coreybutler/nvm-windows/releases) (Node Version Manager).
2. Open PowerShell and install the latest Node: `nvm install lts` and then `nvm use lts`
3. Enable pnpm: `corepack enable pnpm`

**Linux (Ubuntu/Debian)**
1. Install Node.js via NodeSource:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```
2. Enable pnpm: `corepack enable pnpm`

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/the-hcma/tsp-maximizer.git
   cd tsp-maximizer
   ```

2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Start the development server — the app will open automatically in your browser:
   ```bash
   pnpm run dev
   ```

To expose the dev server on your local network (useful for testing on other devices, or when running headlessly):
```bash
pnpm run dev --host
```

### Building for Production

```bash
pnpm run build
```
The compiled assets will be placed in the `dist/` directory, ready to be deployed to any static hosting service.

## Tech Stack
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **Styling:** Vanilla CSS (CSS Variables, Flexbox/Grid)
- **Package Manager:** `pnpm`

## License
MIT License
