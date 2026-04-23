import { StrictMode, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ArticleFeed } from './pages/ArticleFeed';
import { ArticleDetail } from './pages/ArticleDetail';
import { ArticleForm } from './pages/ArticleForm';
import { AuthorPanel } from './pages/AuthorPanel';
import { Modal } from './components/Modal';
import './style.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  const [showNewArticle, setShowNewArticle] = useState(false);

  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ArticleFeed onNewArticle={() => setShowNewArticle(true)} />
            <Modal
              isOpen={showNewArticle}
              onClose={() => setShowNewArticle(false)}
              title="Nuevo Artículo"
            >
              <ArticleForm isOpen={showNewArticle} onClose={() => setShowNewArticle(false)} embedded />
            </Modal>
          </PrivateRoute>
        }
      />
      <Route
        path="/articles/:slug"
        element={
          <PrivateRoute>
            <ArticleDetail />
          </PrivateRoute>
        }
      />
      <Route
        path="/articles/:slug/edit"
        element={
          <PrivateRoute>
            <ArticleForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/author"
        element={
          <PrivateRoute>
            <AuthorPanel />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();

  if (!isAuthenticated) return null;

  return (
    <nav className="navbar">
      <div className="nav-brand">
        <Link to="/">Blog Técnico</Link>
      </div>
      <div className="nav-links">
        <Link to="/">Inicio</Link>
        {user?.role === 'author' && <Link to="/author">Mi Panel</Link>}
        <button onClick={logout}>Cerrar Sesión</button>
      </div>
    </nav>
  );
}

function App() {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <Navigation />
          <main className="container">
            <AppRoutes />
          </main>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}

createRoot(document.getElementById('app')!).render(<App />);