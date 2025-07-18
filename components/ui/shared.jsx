import React from "react";
import {
  AlertTriangle,
  RefreshCw,
  Wifi,
  WifiOff,
  Server,
  X,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Music,
  Monitor,
  Users,
  Settings,
  Calendar,
  Search,
  MessageSquare,
  Palette,
  Database,
} from "lucide-react";

// Loading Spinner Component
export const LoadingSpinner = ({ size = "medium", text = "Loading..." }) => {
  const sizeClasses = {
    small: "w-4 h-4",
    medium: "w-8 h-8",
    large: "w-12 h-12",
    xl: "w-16 h-16",
  };

  return (
    <div className="flex flex-col items-center justify-center p-8">
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-blue-500 mb-4`}
      />
      <p className="text-gray-400 text-sm">{text}</p>
    </div>
  );
};

// Full Page Loading
export const PageLoading = ({ message = "Loading page..." }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
        <p className="text-lg font-medium mb-2">{message}</p>
        <p className="text-gray-400 text-sm">
          Please wait while we load the content
        </p>
      </div>
    </div>
  );
};

// Error Display Component
export const ErrorDisplay = ({
  title = "Something went wrong",
  message = "An unexpected error occurred. Please try again.",
  onRetry = null,
  onDismiss = null,
  type = "error", // error, warning, info
}) => {
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="w-8 h-8 text-yellow-500" />;
      case "info":
        return <Info className="w-8 h-8 text-blue-500" />;
      default:
        return <AlertCircle className="w-8 h-8 text-red-500" />;
    }
  };

  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-yellow-600/10 border-yellow-600/20";
      case "info":
        return "bg-blue-600/10 border-blue-600/20";
      default:
        return "bg-red-600/10 border-red-600/20";
    }
  };

  return (
    <div className={`rounded-lg border p-6 ${getBgColor()}`}>
      <div className="flex items-start gap-4">
        {getIcon()}
        <div className="flex-1">
          <h3 className="font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{message}</p>
          <div className="flex gap-2">
            {onRetry && (
              <button
                onClick={onRetry}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
            )}
            {onDismiss && (
              <button
                onClick={onDismiss}
                className="bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded transition-colors"
              >
                Dismiss
              </button>
            )}
          </div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
};

// Empty State Component
export const EmptyState = ({
  icon: Icon = Music,
  title = "No data available",
  description = "There's nothing to show here yet.",
  actionLabel = null,
  onAction = null,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Icon className="w-16 h-16 text-gray-600 mb-4" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 mb-4 max-w-md">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Network Status Indicator
export const NetworkStatus = ({ isOnline = true, showText = false }) => {
  if (isOnline) {
    return (
      <div className="flex items-center gap-2 text-green-400">
        <Wifi className="w-4 h-4" />
        {showText && <span className="text-sm">Online</span>}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-400">
      <WifiOff className="w-4 h-4" />
      {showText && <span className="text-sm">Offline</span>}
    </div>
  );
};

// Status Badge Component
export const StatusBadge = ({ status, size = "medium" }) => {
  const getStatusConfig = (status) => {
    switch (status.toLowerCase()) {
      case "online":
      case "connected":
      case "active":
      case "playing":
        return {
          color: "bg-green-600",
          text: "text-green-100",
          dot: "bg-green-400",
        };
      case "offline":
      case "disconnected":
      case "inactive":
      case "stopped":
        return { color: "bg-red-600", text: "text-red-100", dot: "bg-red-400" };
      case "pending":
      case "loading":
      case "buffering":
        return {
          color: "bg-yellow-600",
          text: "text-yellow-100",
          dot: "bg-yellow-400",
        };
      case "paused":
      case "scheduled":
        return {
          color: "bg-blue-600",
          text: "text-blue-100",
          dot: "bg-blue-400",
        };
      default:
        return {
          color: "bg-gray-600",
          text: "text-gray-100",
          dot: "bg-gray-400",
        };
    }
  };

  const config = getStatusConfig(status);
  const sizeClasses = {
    small: "px-2 py-1 text-xs",
    medium: "px-3 py-1 text-sm",
    large: "px-4 py-2 text-base",
  };

  return (
    <div
      className={`inline-flex items-center gap-2 rounded-full ${config.color} ${config.text} ${sizeClasses[size]}`}
    >
      <div
        className={`w-2 h-2 rounded-full ${config.dot} ${status.toLowerCase() === "playing" ? "animate-pulse" : ""}`}
      ></div>
      <span className="font-medium capitalize">{status}</span>
    </div>
  );
};

// Toast Notification Component
export const Toast = ({
  type = "info",
  title,
  message,
  onClose,
  autoHide = true,
  duration = 5000,
}) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(() => onClose && onClose(), 300);
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onClose]);

  const getConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: CheckCircle,
          bgColor: "bg-green-600",
          textColor: "text-green-100",
          borderColor: "border-green-500",
        };
      case "error":
        return {
          icon: AlertCircle,
          bgColor: "bg-red-600",
          textColor: "text-red-100",
          borderColor: "border-red-500",
        };
      case "warning":
        return {
          icon: AlertTriangle,
          bgColor: "bg-yellow-600",
          textColor: "text-yellow-100",
          borderColor: "border-yellow-500",
        };
      default:
        return {
          icon: Info,
          bgColor: "bg-blue-600",
          textColor: "text-blue-100",
          borderColor: "border-blue-500",
        };
    }
  };

  const config = getConfig();
  const Icon = config.icon;

  if (!isVisible) return null;

  return (
    <div
      className={`fixed top-4 right-4 z-50 max-w-sm w-full transform transition-all duration-300 ${
        isVisible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
    >
      <div
        className={`${config.bgColor} ${config.textColor} rounded-lg shadow-lg border ${config.borderColor} p-4`}
      >
        <div className="flex items-start gap-3">
          <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            {title && <p className="font-semibold mb-1">{title}</p>}
            <p className="text-sm opacity-90">{message}</p>
          </div>
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose && onClose(), 300);
            }}
            className="text-current hover:opacity-70 transition-opacity"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Progress Bar Component
export const ProgressBar = ({
  value = 0,
  max = 100,
  showValue = true,
  color = "bg-blue-500",
  size = "medium",
  animated = false,
}) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const sizeClasses = {
    small: "h-1",
    medium: "h-2",
    large: "h-3",
  };

  return (
    <div className="w-full">
      <div
        className={`w-full bg-gray-700 rounded-full overflow-hidden ${sizeClasses[size]}`}
      >
        <div
          className={`h-full ${color} transition-all duration-300 ${animated ? "animate-pulse" : ""}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showValue && (
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

// Skeleton Loader Component
export const SkeletonLoader = ({ lines = 3, avatar = false, card = false }) => {
  if (card) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 animate-pulse">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gray-700 rounded-lg"></div>
          <div className="flex-1">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
        <div className="space-y-2">
          {Array.from({ length: lines }).map((_, i) => (
            <div
              key={i}
              className="h-3 bg-gray-700 rounded"
              style={{ width: `${Math.random() * 30 + 70}%` }}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-pulse">
      <div className="flex items-center gap-4 mb-4">
        {avatar && <div className="w-10 h-10 bg-gray-700 rounded-full"></div>}
        <div className="flex-1">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-gray-700 rounded"
            style={{ width: `${Math.random() * 30 + 70}%` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

// System Health Indicator
export const SystemHealth = ({
  cpu = 0,
  memory = 0,
  disk = 0,
  network = "good",
}) => {
  const getHealthColor = (value) => {
    if (value > 80) return "text-red-400";
    if (value > 60) return "text-yellow-400";
    return "text-green-400";
  };

  const getNetworkColor = (status) => {
    switch (status) {
      case "excellent":
        return "text-green-400";
      case "good":
        return "text-blue-400";
      case "poor":
        return "text-yellow-400";
      case "offline":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  return (
    <div className="grid grid-cols-4 gap-2 text-xs">
      <div className="text-center">
        <Server className={`w-4 h-4 mx-auto mb-1 ${getHealthColor(cpu)}`} />
        <div className={`font-medium ${getHealthColor(cpu)}`}>{cpu}%</div>
        <div className="text-gray-400">CPU</div>
      </div>
      <div className="text-center">
        <Database
          className={`w-4 h-4 mx-auto mb-1 ${getHealthColor(memory)}`}
        />
        <div className={`font-medium ${getHealthColor(memory)}`}>{memory}%</div>
        <div className="text-gray-400">RAM</div>
      </div>
      <div className="text-center">
        <Monitor className={`w-4 h-4 mx-auto mb-1 ${getHealthColor(disk)}`} />
        <div className={`font-medium ${getHealthColor(disk)}`}>{disk}%</div>
        <div className="text-gray-400">Disk</div>
      </div>
      <div className="text-center">
        <Wifi className={`w-4 h-4 mx-auto mb-1 ${getNetworkColor(network)}`} />
        <div className={`font-medium ${getNetworkColor(network)} capitalize`}>
          {network}
        </div>
        <div className="text-gray-400">Net</div>
      </div>
    </div>
  );
};

// Feature Flag Component (for incomplete features)
export const FeatureFlag = ({ enabled = false, children, fallback = null }) => {
  if (enabled) {
    return children;
  }

  if (fallback) {
    return fallback;
  }

  return (
    <div className="bg-yellow-600/10 border border-yellow-600/20 rounded-lg p-4">
      <div className="flex items-center gap-2 text-yellow-400 mb-2">
        <Settings className="w-4 h-4" />
        <span className="font-medium">Feature Coming Soon</span>
      </div>
      <p className="text-gray-300 text-sm">
        This feature is currently under development and will be available in a
        future update.
      </p>
    </div>
  );
};

// Quick Actions Component
export const QuickActions = ({ actions = [] }) => {
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
            action.variant === "danger"
              ? "bg-red-600 hover:bg-red-700"
              : action.variant === "success"
                ? "bg-green-600 hover:bg-green-700"
                : "bg-blue-600 hover:bg-blue-700"
          }`}
          title={action.tooltip}
        >
          {action.icon && <action.icon className="w-4 h-4" />}
          <span className="text-sm font-medium">{action.label}</span>
        </button>
      ))}
    </div>
  );
};

// Export all components
export default {
  LoadingSpinner,
  PageLoading,
  ErrorDisplay,
  EmptyState,
  NetworkStatus,
  StatusBadge,
  Toast,
  ProgressBar,
  SkeletonLoader,
  SystemHealth,
  FeatureFlag,
  QuickActions,
};
