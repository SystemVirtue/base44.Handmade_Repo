import React, { useState, useEffect } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Settings, RefreshCw } from 'lucide-react';
import { getYtDlpService } from '../../services/yt-dlp-service.js';

export default function YouTubeServiceStatus({ compact = false }) {
  const [serviceStatus, setServiceStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkServiceStatus = async () => {
    try {
      const ytDlpService = getYtDlpService();
      const status = await ytDlpService.isServiceReady();
      const usage = ytDlpService.getUsageStatistics();

      setServiceStatus({
        ...status,
        usage: usage
      });
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
    
    // Refresh status every 30 seconds
    const interval = setInterval(checkServiceStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-2 ${compact ? 'text-sm' : ''}`}>
        <RefreshCw className="w-4 h-4 animate-spin text-gray-400" />
        <span className="text-gray-400">Checking YouTube service...</span>
      </div>
    );
  }

  if (!serviceStatus) return null;

  const getStatusIcon = () => {
    if (serviceStatus.ready) {
      return <CheckCircle className="w-4 h-4 text-green-400" />;
    } else if (serviceStatus.reason?.includes('quota')) {
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    } else {
      return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusText = () => {
    if (serviceStatus.ready) {
      return `YouTube Ready (yt-dlp)`;
    } else {
      return `YouTube: ${serviceStatus.reason}`;
    }
  };

  const getStatusColor = () => {
    if (serviceStatus.ready) return 'text-green-400';
    if (serviceStatus.reason?.includes('quota')) return 'text-yellow-400';
    return 'text-red-400';
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {getStatusIcon()}
        <span className={`text-sm ${getStatusColor()}`}>
          {serviceStatus.ready ? 'YouTube OK' : 'YouTube Issue'}
        </span>
      </div>
    );
  }

  return (
    <div className="bg-gray-800 rounded-lg p-4">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h4 className={`font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </h4>
            
            {serviceStatus.ready && (
              <div className="text-sm text-gray-400 mt-1">
                yt-dlp service available - no API quotas required
              </div>
            )}
            
            {!serviceStatus.ready && (
              <div className="text-sm text-gray-400 mt-1">
                {serviceStatus.reason}
              </div>
            )}
          </div>
        </div>

        {!serviceStatus.ready && (
          <div className="flex gap-2">
            <button
              onClick={checkServiceStatus}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Refresh status"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => window.location.href = '/settings'}
              className="p-1 text-gray-400 hover:text-white transition-colors"
              title="Go to settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {serviceStatus.ready && (
        <div className="mt-3 pt-3 border-t border-gray-700">
          <div className="text-xs text-gray-400">
            Service: yt-dlp (no API keys required)
          </div>
        </div>
      )}
    </div>
  );
}

export { YouTubeServiceStatus };
