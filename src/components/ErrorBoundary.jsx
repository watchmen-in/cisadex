import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      info: null,
      showDetails: false 
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("[ErrorBoundary]", error, info);
    this.setState({ info });
    
    // Log to external service in production
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'exception', {
        description: error.toString(),
        fatal: false
      });
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const isDev = process.env.NODE_ENV === 'development';
      
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
            <div className="text-red-500 text-6xl mb-4">💥</div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-gray-600 mb-6">
              We're sorry, but something unexpected happened. The error has been logged and we'll look into it.
            </p>
            
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-medium"
              >
                Reload Page
              </button>
              
              <button
                onClick={this.handleGoHome}
                className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
              
              {isDev && (
                <button
                  onClick={this.toggleDetails}
                  className="w-full px-4 py-2 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200 transition-colors text-sm"
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </button>
              )}
            </div>
            
            {isDev && this.state.showDetails && (
              <div className="mt-6 p-4 bg-gray-100 rounded text-left">
                <h3 className="font-bold text-sm mb-2">Error Details (Development Only)</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap overflow-auto max-h-48">
                  {String(this.state.error)}
                  {this.state.info?.componentStack && (
                    "\n\nComponent Stack:\n" + this.state.info.componentStack
                  )}
                </pre>
              </div>
            )}
            
            <div className="mt-6 text-xs text-gray-500">
              Error ID: {Date.now().toString(36)}
            </div>
          </div>
        </div>
      );
    }
    
    return this.props.children;
  }
}
