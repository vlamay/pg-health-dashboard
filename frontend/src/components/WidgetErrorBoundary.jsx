import React from 'react';
import { AlertCircle, RotateCw } from 'lucide-react';

class WidgetErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Widget error caught:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="glass-card p-6 border border-red-500/20 bg-red-500/5">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-300 mb-1">Failed to load widget</h3>
              <p className="text-xs text-red-200/70 mb-3">
                {this.state.error?.message || 'An error occurred while rendering this widget'}
              </p>
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium bg-red-500/20 text-red-300 hover:bg-red-500/30 transition-colors"
              >
                <RotateCw className="w-3 h-3" />
                Retry
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
