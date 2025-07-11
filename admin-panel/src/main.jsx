import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthProvider.jsx';
import RouterWrapper from './RouterWrapper.jsx'; // new file

createRoot(document.getElementById('root')).render(
  <AuthProvider>
    <BrowserRouter>
      <RouterWrapper />
    </BrowserRouter>
  </AuthProvider>
);