import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { ArticleFeed } from './pages/ArticleFeed';
import { ArticleDetail } from './pages/ArticleDetail';
import { ArticleForm } from './pages/ArticleForm';
import { AuthorPanel } from './pages/AuthorPanel';
import './style.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <ArticleFeed />
          </PrivateRoute>
        }
      />
      <Route
        path="/articles/new"
        element={
          <PrivateRoute>
            <ArticleForm />
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
        <a href="/">Blog Técnico</a>
      </div>
      <div className="nav-links">
        <a href="/">Inicio</a>
        {user?.role === 'author' && <a href="/author">Mi Panel</a>}
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

createRoot(document.getElementById('root')!).render(<App />);