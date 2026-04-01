import { useState, useEffect } from 'react';

export function ConnectionTest() {
  const [isSecure, setIsSecure] = useState(false);
  const [userAgent, setUserAgent] = useState('');

  useEffect(() => {
    setIsSecure(window.isSecureContext || window.location.protocol === 'https:');
    setUserAgent(navigator.userAgent);
  }, []);

  return (
    <div className="fixed top-4 left-4 bg-black/80 text-white p-3 rounded-lg z-50 font-mono text-xs max-w-xs">
      <div className="font-bold mb-2">Connection Test</div>
      <div className="space-y-1">
        <div>HTTPS: {isSecure ? '✅ Yes' : '❌ No'}</div>
        <div>Protocol: {window.location.protocol}</div>
        <div>Host: {window.location.host}</div>
        <div className="text-gray-400 text-xs mt-2 wrap-break-word">
          {userAgent.includes('iPhone') ? '📱 iOS' : 
           userAgent.includes('Android') ? '📱 Android' : 
           '💻 Desktop'}
        </div>
      </div>
      {!isSecure && (
        <div className="mt-2 text-yellow-400 text-xs">
          ⚠️ Motion sensors require HTTPS in most browsers
        </div>
      )}
    </div>
  );
}
