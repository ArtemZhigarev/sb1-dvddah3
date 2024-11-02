import React, { useState, useEffect } from 'react';
import { AlertCircle, ChevronDown, ChevronRight } from 'lucide-react';
import { testERPNextConnection } from '../../services/erpnext';

interface DebugInfo {
  timestamp: string;
  step: string;
  details: Record<string, unknown>;
}

const ERPNextSettings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; details?: Record<string, unknown> } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugLog, setDebugLog] = useState<DebugInfo[]>([]);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const savedUrl = localStorage.getItem('erpnext_url');
    const savedApiKey = localStorage.getItem('erpnext_api_key');
    const savedApiSecret = localStorage.getItem('erpnext_api_secret');

    if (savedUrl) setUrl(savedUrl);
    if (savedApiKey) setApiKey(savedApiKey);
    if (savedApiSecret) setApiSecret(savedApiSecret);
  }, []);

  const addDebugLog = (step: string, details: Record<string, unknown> = {}) => {
    setDebugLog(prev => [...prev, {
      timestamp: new Date().toISOString(),
      step,
      details
    }]);
  };

  const handleSave = () => {
    try {
      addDebugLog('Saving settings', { url });
      localStorage.setItem('erpnext_url', url);
      localStorage.setItem('erpnext_api_key', apiKey);
      localStorage.setItem('erpnext_api_secret', apiSecret);
      setError(null);
      setTestResult({ success: true, message: 'Settings saved successfully!' });
      addDebugLog('Settings saved successfully');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      addDebugLog('Error saving settings', { error: errorMessage });
      setError('Failed to save settings. Please try again.');
    }
  };

  const clearDebugLog = () => {
    setDebugLog([]);
  };

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    setError(null);
    clearDebugLog();

    try {
      const result = await testERPNextConnection(url, apiKey, apiSecret, addDebugLog);
      setTestResult(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      addDebugLog('Connection test failed', { error: errorMessage });
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg overflow-hidden">
      <div className="px-6 py-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ERPNext Settings</h2>
        
        {error && (
          <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
            <div className="flex">
              <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
              <div>
                <p className="font-bold">Error</p>
                <p>{error}</p>
              </div>
            </div>
          </div>
        )}

        {testResult && (
          <div className={`mb-4 ${testResult.success ? 'bg-green-100 border-green-500 text-green-700' : 'bg-red-100 border-red-500 text-red-700'} border-l-4 p-4`}>
            {testResult.message}
          </div>
        )}

        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-4">
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">
              ERPNext URL
            </label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              placeholder="https://your-erpnext-instance.com"
              required
            />
          </div>

          <div>
            <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
              API Key
            </label>
            <input
              type="text"
              id="apiKey"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div>
            <label htmlFor="apiSecret" className="block text-sm font-medium text-gray-700">
              API Secret
            </label>
            <input
              type="password"
              id="apiSecret"
              value={apiSecret}
              onChange={(e) => setApiSecret(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Settings
            </button>
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isLoading}
              className="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {isLoading ? 'Testing...' : 'Test Connection'}
            </button>
          </div>
        </form>

        <div className="mt-8">
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="flex items-center text-sm text-gray-600 hover:text-gray-900"
          >
            {showDebug ? <ChevronDown className="w-4 h-4 mr-1" /> : <ChevronRight className="w-4 h-4 mr-1" />}
            Debug Information
          </button>
          
          {showDebug && debugLog.length > 0 && (
            <div className="mt-4 bg-gray-50 rounded-md p-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Connection Test Log</h3>
                <button
                  onClick={clearDebugLog}
                  className="text-sm text-red-600 hover:text-red-800"
                >
                  Clear Log
                </button>
              </div>
              <div className="space-y-2">
                {debugLog.map((log, index) => (
                  <div key={index} className="text-sm">
                    <div className="flex items-start">
                      <span className="text-gray-500 min-w-[180px]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="font-medium text-gray-700">{log.step}</span>
                    </div>
                    {Object.keys(log.details).length > 0 && (
                      <pre className="mt-1 ml-[180px] text-xs bg-gray-100 p-2 rounded overflow-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ERPNextSettings;