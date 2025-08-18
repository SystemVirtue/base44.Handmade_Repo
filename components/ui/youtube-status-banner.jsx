import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Settings, RefreshCw, ExternalLink } from 'lucide-react';
import { getYtDlpService } from '../../services/yt-dlp-service.js';

export default function YouTubeStatusBanner({ onDismiss }) {
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  const checkServiceStatus = async () => {
    try {
      const ytDlpService = getYtDlpService();
      const status = await ytDlpService.isServiceReady();
      setServiceStatus(status);
    } catch (error) {
      setServiceStatus({
        ready: false,
        reason: 'Service unavailable',
        error: error.message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkServiceStatus();
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    if (onDismiss) onDismiss();
  };

  if (isLoading || serviceStatus?.ready || isDismissed) {
    return null;
  }

  const getStatusInfo = () => {
    if (serviceStatus.reason.includes('API keys')) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        title: "YouTube API Setup Required",
        message: "Configure YouTube Data API v3 keys to enable video search and playback.",
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
        actionText: "Configure API Keys",
        actionUrl: "/settings"
      };
    } else if (serviceStatus.reason.includes('quota')) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: "YouTube API Quota Exceeded",
        message: "Daily API quota limit reached. Try again tomorrow or add more API keys.",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        actionText: "Add More Keys",
        actionUrl: "/settings"
      };
    } else if (serviceStatus.reason.includes('valid')) {
      return {
        icon: <XCircle className="w-5 h-5 text-red-500" />,
        title: "Invalid YouTube API Keys",
        message: "Current API keys are invalid or don't have proper permissions.",
        bgColor: "bg-red-50 border-red-200",
        textColor: "text-red-800",
        actionText: "Update API Keys",
        actionUrl: "/settings"
      };
    } else {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        title: "YouTube Service Unavailable",
        message: serviceStatus.reason || "YouTube API service is currently unavailable.",
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
        actionText: "Check Settings",
        actionUrl: "/settings"
      };
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={`border rounded-lg p-4 mb-6 ${statusInfo.bgColor}`}>
      <div className="flex items-start gap-3">
        {statusInfo.icon}
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-medium ${statusInfo.textColor}`}>
            {statusInfo.title}
          </h3>
          <p className={`text-sm mt-1 ${statusInfo.textColor} opacity-75`}>
            {statusInfo.message}
          </p>
          
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={() => window.location.href = statusInfo.actionUrl}
              className={`inline-flex items-center gap-1 text-sm font-medium ${statusInfo.textColor} hover:underline`}
            >
              {statusInfo.actionText}
              <ExternalLink className="w-3 h-3" />
            </button>
            
            <button
              onClick={checkServiceStatus}
              className={`inline-flex items-center gap-1 text-sm ${statusInfo.textColor} opacity-75 hover:opacity-100`}
            >
              <RefreshCw className="w-3 h-3" />
              Refresh Status
            </button>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className={`${statusInfo.textColor} opacity-50 hover:opacity-75`}
        >
          <XCircle className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
