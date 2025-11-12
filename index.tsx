
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { resetDemoDataIfNeeded } from './services/demoCleanup';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

resetDemoDataIfNeeded();

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
