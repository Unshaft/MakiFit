import { Component } from 'react';
import type { ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center">
          <p className="font-syne font-extrabold text-2xl text-(--ink) mb-2">Oups !</p>
          <p className="text-(--muted) text-sm mb-6">Une erreur inattendue s'est produite.</p>
          <button
            type="button"
            onClick={() => { this.setState({ hasError: false, message: '' }); window.location.href = '/dashboard'; }}
            className="px-6 py-3 bg-(--ink) text-white rounded-xl font-syne font-bold text-sm touch-feedback"
          >
            Retour à l'accueil
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
