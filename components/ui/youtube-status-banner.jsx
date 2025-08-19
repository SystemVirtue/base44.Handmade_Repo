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
    if (serviceStatus.reason.includes('not available') || serviceStatus.reason.includes('not properly installed')) {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        title: "yt-dlp Service Unavailable",
        message: "yt-dlp is not properly installed or configured. YouTube video features may not work.",
        bgColor: "bg-yellow-50 border-yellow-200",
        textColor: "text-yellow-800",
        actionText: "Check Installation",
        actionUrl: "https://github.com/yt-dlp/yt-dlp#installation"
      };
    } else {
      return {
        icon: <AlertTriangle className="w-5 h-5 text-yellow-500" />,
        title: "YouTube Service Issue",
        message: serviceStatus.reason || "YouTube service is currently unavailable.",
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
