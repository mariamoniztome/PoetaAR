import { useState, useEffect } from 'react';

interface MotionPermissionPromptProps {
  onRequestPermission: () => void;
  isVisible: boolean;
}

export function MotionPermissionPrompt({ onRequestPermission, isVisible }: MotionPermissionPromptProps) {
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(/iPad|iPhone|iPod/.test(navigator.userAgent));
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-xl font-bold mb-4 text-gray-900">
          Enable Motion Interaction
        </h2>
        
        <div className="space-y-3 text-sm text-gray-600 mb-6">
          <p>
            This experience uses your device's motion sensors to create interactive effects.
          </p>
          
          {isIOS ? (
            <div className="bg-blue-50 border border-blue-200 rounded p-3">
              <p className="font-medium text-blue-900 mb-1">iOS Users:</p>
              <p className="text-blue-800">
                Tap the button below and then "Allow" when prompted to enable motion sensors.
              </p>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded p-3">
              <p className="font-medium text-green-900 mb-1">Android Users:</p>
              <p className="text-green-800">
                Motion sensors will be enabled automatically when you tap the button below.
              </p>
            </div>
          )}
          
          <p className="text-xs text-gray-500">
            If you don't see the permission prompt, try refreshing the page and tapping again.
          </p>
        </div>

        <button
          onClick={onRequestPermission}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
        >
          Enable Motion Sensors
        </button>
        
        <p className="text-xs text-gray-400 text-center mt-4">
          You can change this anytime in your browser settings
        </p>
      </div>
    </div>
  );
}
