
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from './contexts/AuthContext'
import { SoulOrbProvider } from './contexts/SoulOrbContext'

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <SoulOrbProvider>
      <App />
    </SoulOrbProvider>
  </AuthProvider>
);
