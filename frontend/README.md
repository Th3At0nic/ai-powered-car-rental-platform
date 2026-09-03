# React TypeScript Dashboard Boilerplate 🚀

This is a **fully structured, scalable, and production-ready** React + TypeScript boilerplate, built with Ant Design, Redux Toolkit, and React Router DOM. It serves as a base for admin dashboards and web applications, reducing setup time for future projects.

---

## ⚡ Features

- **Hybrid Folder Structure** for better scalability.
- **TypeScript** for better type safety.
- **Redux Toolkit** for efficient state management.
- **React Router DOM** for dynamic routing.
- **Ant Design** for a modern UI.
- **React Hook Form** with custom form components.
- **Authentication System** (Login & Logout with Redux).
- **Role-based Dashboard** (Admin & User Dashboard Demo).
- **Custom Utilities** for cleaner code structure.

---

## 🏗 Project Structure

📦 react-ts-dashboard-boilerplate
├── 📂 src
│ ├── 📂 components
│ │ ├── 📂 Layout
│ │ │ ├── MainLayout.tsx
│ │ │ ├── Navbar.tsx
│ │ │ ├── Sidebar.tsx
│ │ │ ├── Footer.tsx
│ │ ├── 📂 Form (Custom Form Components)
│ │ ├── 📂 UI (Reusable UI components)
│ │ │  
│ ├── 📂 pages
│ │ ├── Dashboard.tsx
│ │ ├── Login.tsx
│ │ ├── AdminDashboard.tsx
│ │ ├── UserDashboard.tsx
│ ├── 📂 redux
│ │ ├── store.ts
│ │ ├── hooks.ts
│ │ ├── 📂 features
│ │ │ ├── authSlice.ts
│ │ │ ├── userSlice.ts
│ ├── 📂 routes
│ │ ├── ProtectedRoute.tsx
│ ├── 📂 utils
│ │ ├── authUtils.ts (Token management)
│ │ ├── api.ts (API helper functions)
│ ├── 📂 assets
│ │ ├── 📂 images
│ │ ├── 📂 styles
│ │ │ ├── global.css
│ │ │ ├── tailwind.css
│ ├── App.tsx
│ ├── index.tsx
├── 📜 .gitignore
├── 📜 package.json
├── 📜 README.md
├── 📜 tsconfig.json
└── 📜 vite.config.ts

---

## 🛠 Tech Stack

- **React + TypeScript**
- **Redux Toolkit**
- **React Router DOM**
- **Ant Design**
- **React Hook Form**
- **Vite / Webpack (Choose based on preference)**

---

## ⚙️ Installation & Setup

```bash
git clone https://github.com/Th3At0nic/frontend-setup-advanced
cd frontend-setup-advanced
npm install
npm run dev



🔐 Authentication & Protected Routes
Uses Redux for authentication state management.

ProtectedRoute.tsx ensures only logged-in users can access certain routes.

Dynamic role-based rendering (Admin/User).

📁 Future Enhancements
✅ More Role-Based Access Control (RBAC)
✅ Backend Integration

```

# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ["./tsconfig.node.json", "./tsconfig.app.json"],
      tsconfigRootDir: import.meta.dirname,
    },
  },
});
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from "eslint-plugin-react-x";
import reactDom from "eslint-plugin-react-dom";

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    "react-x": reactX,
    "react-dom": reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs["recommended-typescript"].rules,
    ...reactDom.configs.recommended.rules,
  },
});
```
