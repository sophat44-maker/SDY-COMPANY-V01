import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { LanguageProvider } from './components/LanguageContext.tsx';
import { HomepageProvider } from './components/HomepageContext.tsx';
import { ServicesProvider } from './components/ServicesContext.tsx';
import { AboutProvider } from './components/AboutContext.tsx';
import { CompanyProvider } from './context/CompanyContext.tsx';

// Catch benign Vite HMR / WebSocket rejections and prevent uncaught overlay popups
window.addEventListener('unhandledrejection', (event) => {
  const reasonStr = String(event.reason?.message || event.reason || '');
  if (
    reasonStr.includes('WebSocket') ||
    reasonStr.includes('vite') ||
    reasonStr.includes('Failed to fetch')
  ) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CompanyProvider>
      <LanguageProvider>
        <HomepageProvider>
          <ServicesProvider>
            <AboutProvider>
              <App />
            </AboutProvider>
          </ServicesProvider>
        </HomepageProvider>
      </LanguageProvider>
    </CompanyProvider>
  </StrictMode>,
);

