import React, { useState, useEffect } from 'react';
import { Bell, CloudSun, Clock, Volume2, VolumeX, X, Check } from 'lucide-react';
import { useSara } from '../../context/SaraContext';

interface HeaderProps {
  onOpenNotifications?: () => void;
}

export const Header: React.FC<HeaderProps> = () => {
  const {
    userProfile,
    voiceSettings,
    updateVoiceSettings,
    activityLogs,
    isSpeaking,
    stopSpeech,
  } = useSara();
  const [showNotificationModal, setShowNotificationModal] = useState<boolean>(false);

  const [liveTemp, setLiveTemp] = useState<number | null>(null);
  const [browserTimezone] = useState<string>(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch (e) {
      return userProfile.timezone || 'UTC+6';
    }
  });

  const fetchWeather = async () => {
    try {
      let lat = '23.8103';
      let lon = '90.4125';
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 3000 })
          );
          lat = pos.coords.latitude.toFixed(4);
          lon = pos.coords.longitude.toFixed(4);
        } catch (e) {}
      }
      const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
      const data = await res.json();
      if (data.success && data.temp !== undefined) {
        setLiveTemp(data.temp);
      }
    } catch (e) {
      setLiveTemp(28);
    }
  };

  useEffect(() => {
    fetchWeather();
  }, []);

  // Dynamic greeting based on current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 5) return { text: 'Good Night 🌙', color: 'text-indigo-400' };
    if (hour < 12) return { text: 'Good Morning ☀️', color: 'text-amber-400' };
    if (hour < 17) return { text: 'Good Afternoon 🌤️', color: 'text-cyan-400' };
    return { text: 'Good Evening 🌙', color: 'text-emerald-400' };
  };

  const greeting = getGreeting();

  return (
    <>
      <header className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className={`text-2xl font-bold tracking-tight ${greeting.color} drop-shadow-[0_0_10px_rgba(16,185,129,0.3)]`}>
              {greeting.text}
            </h1>
          </div>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-pink-500 font-extrabold text-sm tracking-wide">
              {userProfile.personality === 'GirlFriend' ? 'SARA' : 'SARA AI'}
            </span>
            <span className="text-pink-400 text-xs">❤️</span>
            <span className="text-[11px] font-semibold text-pink-400/90 tracking-wider">
              AI GIRLFRIEND
            </span>
            <span className="text-pink-400 text-xs">❤️</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Mute/Unmute audio button */}
          <button
            onClick={() => {
              if (isSpeaking) {
                stopSpeech();
              } else {
                updateVoiceSettings({ autoSpeak: !voiceSettings.autoSpeak });
              }
            }}
            title={voiceSettings.autoSpeak ? 'Voice enabled' : 'Voice muted'}
            className="w-10 h-10 rounded-full glass-card border border-pink-500/20 flex items-center justify-center text-slate-300 hover:text-pink-400 active:scale-95 transition-all"
          >
            {voiceSettings.autoSpeak ? (
              <Volume2 className="w-5 h-5 text-pink-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-slate-500" />
            )}
          </button>

          {/* Notification Button */}
          <button
            onClick={() => setShowNotificationModal(true)}
            aria-label="Notifications"
            className="w-10 h-10 rounded-full glass-card border border-pink-500/20 flex items-center justify-center text-slate-300 hover:text-pink-400 relative active:scale-95 transition-all"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          </button>
        </div>
      </header>

      {/* Subheader Real Weather & Timezone bar from screenshot #9 */}
      <div className="px-4 py-1 flex items-center justify-between text-xs text-slate-400 border-b border-pink-500/10 mb-3">
        <button
          onClick={fetchWeather}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors"
          title="Click to refresh live weather"
        >
          <CloudSun className="w-3.5 h-3.5 text-cyan-400" />
          <span>LIVE WEATHER</span>
          <span className="font-semibold text-cyan-400 font-mono">
            {liveTemp !== null ? `${liveTemp}°C` : 'Fetching...'}
          </span>
        </button>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-pink-400" />
          <span>TIMEZONE</span>
          <span className="font-semibold text-pink-400 font-mono truncate max-w-[150px]">
            {browserTimezone}
          </span>
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl glass-card-pink border border-pink-500/40 p-5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-pink-500/20">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-pink-400" />
                <h3 className="font-bold text-slate-100">Sara Notifications</h3>
              </div>
              <button
                onClick={() => setShowNotificationModal(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3 max-h-64 overflow-y-auto space-y-2">
              {activityLogs.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">No new notifications</p>
              ) : (
                activityLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-xl bg-slate-900/60 border border-pink-500/15 flex items-start gap-2.5 text-xs"
                  >
                    <span className="w-2 h-2 rounded-full bg-pink-500 shrink-0 mt-1" />
                    <div className="flex-1">
                      <p className="font-medium text-slate-200">{log.title}</p>
                      {log.details && (
                        <p className="text-slate-400 text-[11px] mt-0.5 line-clamp-1">{log.details}</p>
                      )}
                      <p className="text-[10px] text-slate-500 mt-1 font-mono">{log.timestamp}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setShowNotificationModal(false)}
              className="w-full mt-2 py-2 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-medium text-sm transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};
