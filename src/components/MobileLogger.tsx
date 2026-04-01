import { useState, useEffect } from 'react';

interface LogEntry {
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success';
}

export function MobileLogger() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Intercept console.log
    const originalLog = console.log;
    const originalError = console.error;
    
    console.log = (...args) => {
      originalLog(...args);
      const message = args.join(' ');
      if (message.includes('Motion') || message.includes('Device') || message.includes('Touch')) {
        setLogs(prev => [...prev.slice(-9), {
          timestamp: new Date().toLocaleTimeString(),
          message,
          type: 'info'
        }]);
      }
    };
    
    console.error = (...args) => {
      originalError(...args);
      setLogs(prev => [...prev.slice(-9), {
        timestamp: new Date().toLocaleTimeString(),
        message: args.join(' '),
        type: 'error'
      }]);
    };

    return () => {
      console.log = originalLog;
      console.error = originalError;
    };
  }, []);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-2 rounded-lg z-50 text-xs"
      >
        📋 Logs
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-black/90 text-green-400 p-3 rounded-lg z-50 font-mono text-xs max-h-48 overflow-hidden">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white font-bold">Console Logs</span>
        <button
          onClick={() => setIsVisible(false)}
          className="text-white hover:text-red-400"
        >
          ✕
        </button>
      </div>
      <div className="space-y-1 overflow-y-auto max-h-32">
        {logs.length === 0 ? (
          <div className="text-gray-400">À espera de logs...</div>
        ) : (
          logs.map((log, i) => (
            <div key={i} className="flex gap-2">
              <span className="text-gray-500">{log.timestamp}</span>
              <span className={log.type === 'error' ? 'text-red-400' : 'text-green-400'}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
