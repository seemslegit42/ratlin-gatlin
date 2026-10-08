
/**
 * @file index.tsx
 * @description The main entry point for the ΛΞVON OS C-HUD React application.
 * This file is responsible for initializing the React root and rendering the top-level `App` component.
 * It sets up crucial global context providers that underpin the entire application's functionality.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.js';
import ErrorBoundary from './components/ErrorBoundary.js';
import { installGlobalExceptionHandlers } from './services/appLogger.js';
import { initializeFileManagement } from './services/fileManagementService.js';
import { NotificationProvider } from './contexts/NotificationContext.js';
import { AuthProvider } from './contexts/AuthContext.js';
import { RouteGuardProvider } from './contexts/RouteGuardContext.js';
import './index.css';

/**
 * The root DOM element where the React application will be mounted.
 * This element is defined in `index.html`.
 * @throws {Error} If the root element with ID 'root' is not found in the DOM.
 */
const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Could not find root element to mount to');
}

installGlobalExceptionHandlers();
initializeFileManagement();

/**
 * Creates a React root and renders the main application.
 * The `App` component is wrapped with several essential providers:
 * - `React.StrictMode`: Activates additional checks and warnings for its descendants, helping to identify potential problems.
 * - `ErrorBoundary`: A component that catches JavaScript errors anywhere in its child component tree, logs those errors, and displays a fallback UI instead of a crashed component tree.
 * - `NotificationProvider`: Provides a global context for displaying transient notifications (e.g., success, error messages) to the user.
 * - `AuthProvider`: Manages user authentication state, including the current user and their associated Syndicate ID, making it available throughout the app.
 * - `HashRouter`: Enables routing capabilities using the URL hash, ensuring compatibility with static hosts and preview environments preventing 404s on refresh.
 */
const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <NotificationProvider>
        <AuthProvider>
          <HashRouter>
            <RouteGuardProvider>
              <App />
            </RouteGuardProvider>
          </HashRouter>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
