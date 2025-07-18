import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast } from "../../components/ui/shared.jsx";

const ErrorContext = createContext();

export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};

export const ErrorProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: "info",
      autoHide: true,
      duration: 5000,
      ...notification,
    };

    setNotifications((prev) => [...prev, newNotification]);
    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const showError = useCallback(
    (message, title = "Error") => {
      return addNotification({
        type: "error",
        title,
        message,
        autoHide: true,
        duration: 8000,
      });
    },
    [addNotification],
  );

  const showSuccess = useCallback(
    (message, title = "Success") => {
      return addNotification({
        type: "success",
        title,
        message,
        autoHide: true,
        duration: 4000,
      });
    },
    [addNotification],
  );

  const showWarning = useCallback(
    (message, title = "Warning") => {
      return addNotification({
        type: "warning",
        title,
        message,
        autoHide: true,
        duration: 6000,
      });
    },
    [addNotification],
  );

  const showInfo = useCallback(
    (message, title = "Info") => {
      return addNotification({
        type: "info",
        title,
        message,
        autoHide: true,
        duration: 5000,
      });
    },
    [addNotification],
  );

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    clearAll,
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}

      {/* Toast Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            type={notification.type}
            title={notification.title}
            message={notification.message}
            onClose={() => removeNotification(notification.id)}
            autoHide={notification.autoHide}
            duration={notification.duration}
          />
        ))}
      </div>
    </ErrorContext.Provider>
  );
};

// Error Boundary Component
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error Boundary caught an error:", error, errorInfo);
    }

    // In production, you would send this to an error reporting service
    // this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // This would integrate with services like Sentry, LogRocket, etc.
    console.log("Logging error to service:", { error, errorInfo });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8">
          <div className="max-w-md w-full bg-gray-800 rounded-lg p-6 border border-red-600/20">
            <div className="text-center">
              <div className="w-16 h-16 bg-red-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>

              <h2 className="text-xl font-semibold text-red-400 mb-2">
                Something went wrong
              </h2>

              <p className="text-gray-300 mb-6">
                An unexpected error occurred. We apologize for the
                inconvenience.
              </p>

              {process.env.NODE_ENV === "development" && this.state.error && (
                <details className="text-left mb-6 bg-gray-900 rounded p-4">
                  <summary className="cursor-pointer text-red-400 font-medium mb-2">
                    Error Details (Development)
                  </summary>
                  <pre className="text-xs text-gray-400 overflow-auto max-h-32">
                    {this.state.error.toString()}
                    {this.state.errorInfo &&
                      this.state.errorInfo.componentStack}
                  </pre>
                </details>
              )}

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => window.location.reload()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
                >
                  Reload Page
                </button>

                <button
                  onClick={() => {
                    this.setState({
                      hasError: false,
                      error: null,
                      errorInfo: null,
                    });
                  }}
                  className="flex-1 bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors"
                >
                  Try Again
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-4">
                If this problem persists, please contact support.
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for async error handling
export const withErrorHandling = (Component) => {
  return function ErrorHandledComponent(props) {
    const { showError } = useError();

    const handleAsyncError = useCallback(
      (error, context = "") => {
        console.error(`Error in ${context}:`, error);

        let userMessage = "An unexpected error occurred";

        // Customize error messages based on error type
        if (error.name === "NetworkError" || error.message.includes("fetch")) {
          userMessage =
            "Network error. Please check your connection and try again.";
        } else if (error.name === "ValidationError") {
          userMessage =
            error.message || "Please check your input and try again.";
        } else if (error.status === 404) {
          userMessage = "The requested resource was not found.";
        } else if (error.status === 403) {
          userMessage = "You do not have permission to perform this action.";
        } else if (error.status === 500) {
          userMessage = "Server error. Please try again later.";
        }

        showError(userMessage, context || "Error");
      },
      [showError],
    );

    return <Component {...props} onError={handleAsyncError} />;
  };
};

// Hook for handling async operations with error handling
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showError } = useError();

  const execute = useCallback(
    async (asyncFunction, options = {}) => {
      const {
        loadingMessage = null,
        successMessage = null,
        errorMessage = null,
        context = "Operation",
      } = options;

      setLoading(true);
      setError(null);

      try {
        const result = await asyncFunction();

        if (successMessage) {
          // Success notifications would be handled by the component
        }

        return result;
      } catch (err) {
        console.error(`Error in ${context}:`, err);
        setError(err);

        const message =
          errorMessage || err.message || "An unexpected error occurred";
        showError(message, context);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [showError],
  );

  return { execute, loading, error };
};

export default ErrorProvider;
