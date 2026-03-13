# To-Doit ⚡️

A high-performance, aesthetically bold task management application built with **Expo** and **React Native**. Featuring a striking **Neo-Brutalist** design language, To-Doit combines raw aesthetics with smooth user experience.

## ✨ Features

- **🎯 Precise Task Management**: Create, edit, and organize tasks with high-contrast priority levels.
- **🏗️ Neo-Brutalist UI**: A custom design system built with bold shadows, hard edges, and vibrant accents.
- **🗓️ Dynamic Scheduling**: Navigate your week with a functional week strip and a comprehensive calendar view.
- **🏷️ Category Management**: Organize your workflow with custom categories and a multi-layered category management system.
- **🔍 Advanced Search**: Find any task instantly with real-time filtering and status tracking.
- **🌓 Dark Mode**: Full support for both vibrant light and sleek dark themes.
- **⚡️ Smooth Interactions**: Powered by React Native Reanimated for high-frame-rate transitions and haptic-aligned feedback.
- **💾 Local Storage**: All data is stored locally on your device using AsyncStorage — no account or internet required.

## 🛠 Tech Stack

- **Framework**: [Expo](https://expo.dev/) (SDK 55+) / React Native
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Navigation**: [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Animation**: [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- **Styling**: Vanilla StyleSheet with a custom Neo-Brutalist design system.
- **Icons**: [Ionicons](https://ionic.io/ionicons) & [Lucide](https://lucide.dev/)
- **Date Handling**: [date-fns](https://date-fns.org/)
- **Persistence**: [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) (Local on-device storage)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS)
- npm or yarn
- Expo Go app on your mobile device or an emulator

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/to-doit.git
   cd to-doit
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Start the application**

   ```bash
   npm start
   ```

   Scan the QR code with your Expo Go app (Android) or Camera (iOS).

## 📂 Project Structure

```text
├── app/                  # Expo Router pages
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main application tab screens
│   └── index.tsx         # Entry point / Auth guard
├── src/
│   ├── components/       # Reusable UI components
│   │   └── ui/           # Core Atomic UI kit (Button, Input, etc.)
│   ├── context/          # State management (Auth, Theme)
│   ├── hooks/            # Custom React hooks (useTasks, useCategories)
│   ├── lib/              # Constants and configurations
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions
└── assets/               # Fonts and images
```

## 🎨 Design Philosophy

To-Doit embraces **Neo-Brutalism**. This means:

- **Thick Borders**: 3px solid borders on interactive elements.
- **Hard Shadows**: Unblurred black shadows for a blocky, physical feel.
- **Bold Typography**: Using "Kodchasan" for a unique, modern look.
- **High Contrast**: Using a palette that emphasizes visibility and action.

## 📄 License

This project is private and for personal use.

---

Built with ⚡️ by [gabriel pipia](https://github.com/gabriel-pipia)
