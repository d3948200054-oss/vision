import React, { useState, useEffect } from 'react';
import { Download, Smartphone, CheckCircle, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const InstallAppModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);

  useEffect(() => {
    // Detect iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // Detect if already installed (standalone mode)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setDeferredPrompt(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-60 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-slate-950 via-teal-950 to-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center shadow-xs">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black tracking-tight">Install Vision App</h3>
              <p className="text-[11px] text-teal-200">Progressive Web Application</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white p-2 rounded-xl hover:bg-white/10 transition-all active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-slate-800">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto shadow-inner">
              <Smartphone className="w-8 h-8 text-teal-600" />
            </div>
            <h4 className="text-lg font-black text-slate-900">
              {isInstalled ? 'App Already Installed!' : 'Get the Full App Experience'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-xs mx-auto">
              Install Vision Classes to your phone or desktop home screen for instant access to classes, homework, timetable, and quick QR fee payments.
            </p>
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Full screen native mobile experience</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Offline caching & fast response</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Fast 1-tap QR fee payments & screenshot uploads</span>
            </div>
          </div>

          {isIOS ? (
            <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-xs space-y-2 text-teal-950">
              <p className="font-bold flex items-center gap-1.5 text-teal-900">
                <Share className="w-4 h-4 text-teal-600" />
                To install on iPhone or iPad:
              </p>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-teal-900 font-medium pl-1">
                <li>Tap the <strong>Share</strong> button at bottom of Safari (<Share className="w-3 h-3 inline mx-0.5" />)</li>
                <li>Scroll down and tap <strong>Add to Home Screen</strong> (<PlusSquare className="w-3 h-3 inline mx-0.5" />)</li>
                <li>Tap <strong>Add</strong> in the top right corner!</li>
              </ol>
            </div>
          ) : (
            <div className="pt-2">
              {deferredPrompt ? (
                <button
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>Install App to Home Screen</span>
                </button>
              ) : (
                <div className="text-center">
                  <button
                    onClick={() => {
                      alert('To install, tap your browser menu (⋮ or Share) and select "Install app" or "Add to Home Screen"');
                      onClose();
                    }}
                    className="w-full py-3 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-black shadow-md shadow-teal-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Add to Device Home Screen</span>
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="text-center">
            <button
              onClick={onClose}
              className="text-xs font-bold text-slate-500 hover:text-slate-800"
            >
              Maybe Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
