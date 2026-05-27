import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Filter out noisy third-party upstream warnings
const originalWarn = console.warn;
console.warn = (...args) => {
  const msg = args[0] || '';
  if (typeof msg === 'string') {
    if (msg.includes('THREE.Clock: This module has been deprecated')) return;
    if (msg.includes('MouseEvent.mozPressure is deprecated')) return;
    if (msg.includes('MouseEvent.mozInputSource is deprecated')) return;
  }
  originalWarn(...args);
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)