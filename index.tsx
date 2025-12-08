import React, { ReactNode } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

interface ErrorBoundaryProps {
  children?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// Simple Error Boundary to catch crashes
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught error in application:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div style={{padding: '2rem', fontFamily: 'sans-serif', color: '#333', textAlign: 'center', marginTop: '50px'}}>
          <h1 style={{fontSize: '24px', fontWeight: 'bold', marginBottom: '16px'}}>Oops! Algo deu errado.</h1>
          <p style={{marginBottom: '20px'}}>O aplicativo encontrou um erro inesperado.</p>
          <div style={{background: '#f8d7da', color: '#721c24', padding: '1rem', borderRadius: '8px', textAlign: 'left', margin: '0 auto', maxWidth: '600px', overflow: 'auto', marginBottom: '20px'}}>
             <pre style={{whiteSpace: 'pre-wrap'}}>{this.state.error?.message || String(this.state.error)}</pre>
          </div>
          <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{padding: '10px 20px', background: '#d97706', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>
            Limpar Dados e Recarregar
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);