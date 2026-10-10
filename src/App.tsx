import React, { useState, useEffect } from 'react';
import { SaraProvider, useSara } from './context/SaraContext';
import { Header } from './components/layout/Header';
import { BottomNavigation, TabType } from './components/navigation/BottomNavigation';
import { DesktopSidebar } from './components/navigation/DesktopSidebar';
import { HomeView } from './components/home/HomeView';
import { ChatView } from './components/chat/ChatView';
import { AvatarSelectionView } from './components/avatar/AvatarSelectionView';
import { CoinsAndPassView } from './components/coins/CoinsAndPassView';
import { SettingsView } from './components/settings/SettingsView';
import { AutomationsView } from './components/automations/AutomationsView';
import { ActivityView } from './components/activity/ActivityView';
import { PermissionCenterView } from './components/permissions/PermissionCenterView';
import { VoiceCompanionModal } from './components/voice/VoiceCompanionModal';
import { WakeWordIndicator } from './components/voice/WakeWordIndicator';
import { useWakeWord } from './hooks/useWakeWord';
import { Download, Sparkles } from 'lucide-react';
import { FloatingScreenControlOrb } from './components/home/FloatingScreenControlOrb';

const MainLayout: React.FC = () => {
  const { userProfile, speakText } = useSara();
  const [activeTab, setActiveTab] = useState<TabType | 'memories' | 'automations' | 'permissions' | 'activity'>('home');
  const [isVoiceOpen, setIsVoiceOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState<boolean>(false);
  const [wakeWordAlert, setWakeWordAlert] = useState<string | null>(null);

  // Background Hands-Free Wake Word Detection System
  const { isHandsFreeActive, toggleHandsFree, isSupported, lastDetected } = useWakeWord({
    wakeWords: [
      userProfile.wakeWord || 'hey sara',
      'hey sara',
      'sara',
      'সারা',
      'hello hello',
      'hey zara',
      'zara',
    ],
    onWakeWordDetected: (word) => {
      setWakeWordAlert(`"${word}" detected! Opening Sara hands-free...`);
      setIsVoiceOpen(true);
      speakText('হ্যাঁ বাবু! আমি শুনছি ❤️ কী সাহায্য করতে পারি?', 'romantic');
      setTimeout(() => setWakeWordAlert(null), 3000);
    },
    isVoiceModalOpen: isVoiceOpen,
  });

  // Register PWA Service Worker and handle beforeinstallprompt
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => console.log('Service Worker registered:', reg.scope))
        .catch((err) => console.warn('Service Worker registration failed:', err));
    }

    const handleBeforeInstall = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  const handleInstallApp = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    }
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'home':
        return <HomeView onNavigate={(tab) => setActiveTab(tab)} onOpenVoice={() => setIsVoiceOpen(true)} />;
      case 'chat':
        return <ChatView />;
      case 'avatar':
        return <AvatarSelectionView />;
      case 'coins':
        return <CoinsAndPassView />;
      case 'settings':
      case 'memories':
        return <SettingsView />;
      case 'automations':
        return <AutomationsView />;
      case 'permissions':
        return <PermissionCenterView />;
      case 'activity':
        return <ActivityView />;
      default:
        return <HomeView onNavigate={(tab) => setActiveTab(tab)} onOpenVoice={() => setIsVoiceOpen(true)} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#05050f] text-slate-100">
      {/* Desktop Sidebar */}
      <DesktopSidebar
        activeTab={activeTab as any}
        onTabChange={(tab) => setActiveTab(tab)}
        onOpenVoice={() => setIsVoiceOpen(true)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        {/* Top Header */}
        <Header />

        {/* Hands-Free Wake Word Banner */}
        <div className="mx-4 mb-2">
          <WakeWordIndicator
            isHandsFreeActive={isHandsFreeActive}
            onToggle={toggleHandsFree}
            wakeWord={userProfile.wakeWord || 'Hey SARA'}
            isSupported={isSupported}
          />
        </div>

        {/* Wake Word Trigger Pop-up Alert */}
        {wakeWordAlert && (
          <div className="mx-4 mb-2 p-2.5 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(255,46,147,0.7)] animate-bounce">
            <Sparkles className="w-4 h-4 animate-spin" />
            <span>{wakeWordAlert}</span>
          </div>
        )}

        {/* PWA Install Banner */}
        {showInstallBanner && (
          <div className="mx-4 mb-2 p-3 rounded-2xl bg-gradient-to-r from-pink-900/60 to-purple-900/60 border border-pink-500/40 flex items-center justify-between text-xs animate-in slide-in-from-top-4">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-pink-400" />
              <span>Install SARA AI as native app on your phone / desktop</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowInstallBanner(false)}
                className="text-slate-400 hover:text-white px-2 py-1"
              >
                Dismiss
              </button>
              <button
                onClick={handleInstallApp}
                className="px-3 py-1 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs"
              >
                Install
              </button>
            </div>
          </div>
        )}

        {/* Dynamic Main View */}
        <main className="flex-1 px-4 max-w-4xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <BottomNavigation
          activeTab={activeTab as any}
          onTabChange={(tab) => setActiveTab(tab)}
          onOpenVoice={() => setIsVoiceOpen(true)}
        />

        {/* Fullscreen Voice Companion Modal */}
        <VoiceCompanionModal
          isOpen={isVoiceOpen}
          onClose={() => setIsVoiceOpen(false)}
        />

        {/* Floating Screen Control Background Orb */}
        <FloatingScreenControlOrb onOpenVoice={() => setIsVoiceOpen(true)} />
      </div>
    </div>
  );
};

export default function App() {
  return (
    <SaraProvider>
      <MainLayout />
    </SaraProvider>
  );
}
