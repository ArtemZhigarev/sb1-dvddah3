import React, { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ChatwootData {
  conversation?: {
    id: number;
    messages: any[];
  };
  [key: string]: any;
}

const ChatwootDebug: React.FC = () => {
  const [chatwootData, setChatwootData] = useState<ChatwootData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    window.addEventListener("message", handleChatwootMessage);
    return () => {
      window.removeEventListener("message", handleChatwootMessage);
    };
  }, []);

  const handleChatwootMessage = (event: MessageEvent) => {
    try {
      let eventData: ChatwootData;
      if (typeof event.data === 'string') {
        eventData = JSON.parse(event.data);
      } else if (typeof event.data === 'object') {
        eventData = event.data;
      } else {
        throw new Error('Invalid data format');
      }
      
      setChatwootData(eventData);
      setError(null);
      setIsLoading(false);
    } catch (err) {
      console.error("Error handling Chatwoot data:", err);
      setError("Failed to process Chatwoot data. Please try again.");
      setIsLoading(false);
    }
  };

  const fetchChatwootData = () => {
    setIsLoading(true);
    setError(null);
    try {
      window.parent.postMessage('chatwoot-dashboard-app:fetch-info', '*');
      setTimeout(() => {
        if (!chatwootData) {
          setError("No response received from Chatwoot. Please try again.");
          setIsLoading(false);
        }
      }, 5000); // 5-second timeout
    } catch (err) {
      console.error("Error requesting Chatwoot data:", err);
      setError("Failed to request Chatwoot data. Please try again.");
      setIsLoading(false);
    }
  };

  const renderChatwootData = () => {
    if (!chatwootData) return <p>No Chatwoot data received yet.</p>;

    return (
      <div>
        {chatwootData.conversation ? (
          <>
            <p>Conversation ID: {chatwootData.conversation.id}</p>
            <p>Number of messages: {chatwootData.conversation.messages.length}</p>
          </>
        ) : (
          <p>No conversation data available.</p>
        )}
        <h3 className="mt-4 font-semibold">Received Data:</h3>
        <pre className="mt-2 bg-gray-100 p-4 rounded-md overflow-auto">
          {JSON.stringify(chatwootData, null, 2)}
        </pre>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Chatwoot Debug</h1>
      
      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4" role="alert">
          <div className="flex">
            <AlertCircle className="h-6 w-6 text-red-500 mr-4" />
            <div>
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow-md rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Chatwoot Data</h2>
        {renderChatwootData()}
        <button
          onClick={fetchChatwootData}
          disabled={isLoading}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isLoading ? (
            <RefreshCw className="animate-spin h-5 w-5 mr-2 inline-block" />
          ) : (
            <RefreshCw className="h-5 w-5 mr-2 inline-block" />
          )}
          Fetch Chatwoot Data
        </button>
      </div>
    </div>
  );
};

export default ChatwootDebug;