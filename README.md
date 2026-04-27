# SmartLocalTalent

![GitHub stars](https://img.shields.io/github/stars/Anshkr/SmartLocalTalent?style=for-the-badge&logo=github) ![GitHub forks](https://img.shields.io/github/forks/Anshkr/SmartLocalTalent?style=for-the-badge&logo=github) ![GitHub issues](https://img.shields.io/github/issues/Anshkr/SmartLocalTalent?style=for-the-badge&logo=github) ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)

## 📑 Table of Contents

- [Description](#description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start](#quick-start)
- [Key Dependencies](#key-dependencies)
- [Run Commands](#run-commands)
- [Screenshots](#screenshots)
- [Project Structure](#project-structure)
- [Development Setup](#development-setup)
- [Contributing](#contributing)

## 📝 Description

SmartLocalTalent is a dynamic web-based platform designed to bridge the gap between skilled individuals and local opportunities within their community. Built with a modern React frontend, this application provides a seamless and responsive user experience. It features a secure authentication system to ensure user privacy and personalized profiles, making it easy for local professionals to showcase their expertise and for users to discover and connect with the right talent right in their neighborhood.

## ✨ Features

- 🔐 Auth
- 🕸️ Web

## 🛠️ Tech Stack

- ⚛️ React

## ⚡ Quick Start

```bash

# Clone the repository
git clone https://github.com/Anshkr/SmartLocalTalent.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## 📦 Key Dependencies

```
@tailwindcss/vite: ^4.2.2
axios: ^1.13.6
lucide-react: ^0.577.0
react: ^19.2.4
react-dom: ^19.2.4
react-router-dom: ^7.13.1
socket.io-client: ^4.8.3
tailwindcss: ^4.2.2
zustand: ^5.0.12
```

## 🚀 Run Commands

- **dev**: `npm run dev`
- **build**: `npm run build`
- **lint**: `npm run lint`
- **preview**: `npm run preview`


## 📁 Project Structure

```
.
├── eslint.config.js
├── firestore.rules
├── index.html
├── package.json
├── public
│   ├── favicon.svg
│   └── icons.svg
├── src
│   ├── App.css
│   ├── App.jsx
│   ├── additions.css
│   ├── admin.css
│   ├── assets
│   │   ├── hero.png
│   │   ├── react.svg
│   │   └── vite.svg
│   ├── auth-additions.css
│   ├── components
│   │   ├── ProtectedRoute.jsx
│   │   ├── admin
│   │   │   └── AdminLayout.jsx
│   │   ├── customer
│   │   │   └── CustomerLayout.jsx
│   │   ├── shared
│   │   │   ├── NotificationBell.jsx
│   │   │   └── PhotoUpload.jsx
│   │   └── worker
│   │       └── WorkerLayout.jsx
│   ├── customer.css
│   ├── hooks
│   │   └── useNotifications.js
│   ├── index.css
│   ├── lib
│   │   ├── api.js
│   │   ├── mockAdmin.js
│   │   └── mockWorkers.js
│   ├── location.css
│   ├── main.jsx
│   ├── pages
│   │   ├── LandingPage.jsx
│   │   ├── admin
│   │   │   ├── AdminAccounts.jsx
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── AdminCustomers.jsx
│   │   │   ├── AdminDisputes.jsx
│   │   │   ├── AdminJobs.jsx
│   │   │   ├── AdminOverview.jsx
│   │   │   ├── AdminSettings.jsx
│   │   │   ├── AdminWithdrawals.jsx
│   │   │   └── AdminWorkers.jsx
│   │   ├── auth
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── customer
│   │   │   ├── CustomerActiveJob.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── CustomerOrderHistory.jsx
│   │   │   ├── CustomerProfile.jsx
│   │   │   ├── CustomerRequests.jsx
│   │   │   ├── CustomerSearch.jsx
│   │   │   ├── CustomerSearchWithMap.jsx
│   │   │   ├── CustomerSettings.jsx
│   │   │   ├── PaymentPage.jsx
│   │   │   ├── SendRequest.jsx
│   │   │   ├── TransactionHistory.jsx
│   │   │   └── WorkerProfilePage.jsx
│   │   └── worker
│   │       ├── WorkerActiveJob.jsx
│   │       ├── WorkerDashboard.jsx
│   │       ├── WorkerEarnings.jsx
│   │       ├── WorkerHistory.jsx
│   │       ├── WorkerProfile.jsx
│   │       ├── WorkerRequests.jsx
│   │       └── WorkerSettings.jsx
│   ├── phase10.css
│   ├── phase8.css
│   ├── phase9.css
│   ├── settings.css
│   ├── store
│   │   └── authStore.js
│   └── worker.css
├── vercel.json
└── vite.config.js
```

## 🛠️ Development Setup

### Node.js/JavaScript Setup
1. Install Node.js (v18+ recommended)
2. Install dependencies: `npm install` or `yarn install`
3. Start development server: (Check scripts in `package.json`, e.g., `npm run dev`)

## 👥 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Clone** your fork: `git clone https://github.com/Anshkr/SmartLocalTalent.git`
3. **Create** a new branch: `git checkout -b feature/your-feature`
4. **Commit** your changes: `git commit -am 'Add some feature'`
5. **Push** to your branch: `git push origin feature/your-feature`
6. **Open** a pull request

Please ensure your code follows the project's style guidelines and includes tests where applicable.

---
*This README was generated with ❤️ by [ReadmeBuddy](https://readmebuddy.com)*
