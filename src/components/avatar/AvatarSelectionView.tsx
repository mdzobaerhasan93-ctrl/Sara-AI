import React, { useState } from 'react';
import { useSara } from '../../context/SaraContext';
import { LiveTalkingAvatar } from './LiveTalkingAvatar';
import { WardrobeView } from './WardrobeView';
import { Check, Sparkles, Heart, Smile, Brain, Flame, Volume2, Shirt, UserCheck } from 'lucide-react';
import { EmotionState } from '../../types';

export const AvatarSelectionView: React.FC = () => {
  const {
    activeAvatarId,
    setActiveAvatarId,
    currentEmotion,
    setCurrentEmotion,
    speakText,
    isSpeaking,
  } = useSara();

  const [activeMainTab, setActiveMainTab] = useState<'avatars' | 'wardrobe'>('avatars');
  const [previewId, setPreviewId] = useState<string>(activeAvatarId);

  const avatarPresets = [
    {
      id: 'sara-cyberpunk',
      name: 'Sara (সারা)',
      tag: 'Real Bengali Companion',
      description: 'Elegant, loving Bengali human companion with warm expressive eyes and glowing charisma.',
      previewId: 'sara-cyberpunk',
    },
    {
      id: 'avatar-4',
      name: 'Sakura (সাকুরা)',
      tag: 'Graceful Elegance',
      description: 'Graceful, affectionate companion with soft gentle features and silk attire.',
      previewId: 'avatar-4',
    },
    {
      id: 'avatar-2',
      name: 'Seraphina (সেরাফিনা)',
      tag: 'Warm & Cozy',
      description: 'Warm, thoughtful friend with hazel eyes and comforting presence.',
      previewId: 'avatar-2',
    },
    {
      id: 'kafka-midnight',
      name: 'Midnight (মিডনাইট)',
      tag: 'Confident Chic',
      description: 'Confident, stylish woman with captivating gaze and modern charm.',
      previewId: 'kafka-midnight',
    },
    {
      id: 'ruby-royal',
      name: 'Ruby (রুবি)',
      tag: 'Royal Glamour',
      description: 'Radiant, glamorous woman with striking auburn hair and royal grace.',
      previewId: 'ruby-royal',
    },
  ];

  const emotionsList: Array<{ id: EmotionState; label: string; icon: string }> = [
    { id: 'romantic', label: 'Romantic', icon: '❤️' },
    { id: 'caring', label: 'Caring', icon: '🌸' },
    { id: 'playful', label: 'Playful', icon: '😜' },
    { id: 'happy', label: 'Happy', icon: '🥰' },
    { id: 'thinking', label: 'Thinking', icon: '🤔' },
    { id: 'excited', label: 'Excited', icon: '✨' },
  ];

  const handleTestEmotion = (emotion: EmotionState) => {
    setCurrentEmotion(emotion);
    if (!isSpeaking) {
      if (emotion === 'romantic') {
        speakText('তুমি আমার সবচেয়ে প্রিয় মানুষ বাবু! ❤️', 'romantic');
      } else if (emotion === 'playful') {
        speakText('হাহা! আমাকে টিজ করছ কেন? 😜', 'playful');
      } else if (emotion === 'caring') {
        speakText('তোমার কি কোনো কিছুর চিন্তা হচ্ছে? আমি আছি তো পাশে।', 'caring');
      } else if (emotion === 'happy') {
        speakText('আজকে তোমাকে কাছে পেয়ে আমি ভীষণ খুশি! 🥰', 'happy');
      } else if (emotion === 'thinking') {
        speakText('হুম... গভীরভাবে চিন্তা করে দেখছি...', 'thinking');
      }
    }
  };

  const handleSelect = (id: string) => {
    setPreviewId(id);
    setActiveAvatarId(id);
  };

  return (
    <div className="space-y-4 pb-20 animate-in fade-in duration-300">
      {/* Top Switcher Tabs: Avatars vs Wardrobe */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl glass-card border border-pink-500/30">
        <button
          onClick={() => setActiveMainTab('avatars')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeMainTab === 'avatars'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Avatar Customizer</span>
        </button>
        <button
          onClick={() => setActiveMainTab('wardrobe')}
          className={`flex-1 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
            activeMainTab === 'wardrobe'
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]'
              : 'text-slate-400 hover:text-slate-200 bg-slate-900/60'
          }`}
        >
          <Shirt className="w-4 h-4" />
          <span>3D Wardrobe & Store</span>
        </button>
      </div>

      {activeMainTab === 'wardrobe' ? (
        <WardrobeView />
      ) : (
        <>
          {/* 1. Large 3D / Live Talking Avatar Stage */}
          <div className="relative rounded-3xl glass-card-pink border border-pink-500/30 p-6 flex flex-col items-center justify-center overflow-hidden min-h-[380px] shadow-[0_0_30px_rgba(255,46,147,0.2)]">
            <div className="absolute inset-0 bg-radial from-pink-900/30 via-purple-950/20 to-transparent pointer-events-none" />

            <div className="relative z-10 w-full flex justify-center">
              <LiveTalkingAvatar
                size="lg"
                avatarId={previewId}
                showStatusBadge
                className="transform hover:scale-105 transition-transform"
              />
            </div>

            <p className="relative z-10 mt-3 text-xs text-pink-300/80 font-medium flex items-center gap-1.5 bg-black/40 px-3 py-1 rounded-full border border-pink-500/20">
              <span>✨</span>
              <span>Tap Sara to interact or select an emotion below</span>
            </p>
          </div>

          {/* 2. Emotion Tester Bar */}
          <div className="p-3.5 rounded-2xl glass-card border border-pink-500/20 space-y-2">
            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">
              • EXPRESSION TESTER •
            </p>
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {emotionsList.map((emo) => (
                <button
                  key={emo.id}
                  onClick={() => handleTestEmotion(emo.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 transition-all ${
                    currentEmotion === emo.id
                      ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-[0_0_12px_rgba(255,46,147,0.5)]'
                      : 'bg-slate-900/80 text-slate-300 hover:bg-slate-800 border border-slate-800'
                  }`}
                >
                  <span>{emo.icon}</span>
                  <span>{emo.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Bottom Selector Section */}
          <div className="p-4 rounded-3xl glass-card border border-pink-500/30 space-y-3">
            <div>
              <h2 className="text-base font-bold text-slate-100">Select Avatar</h2>
              <p className="text-xs text-slate-400">Select your companion ai</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {avatarPresets.map((av) => {
                const isSelected = activeAvatarId === av.id;
                return (
                  <div
                    key={av.id}
                    onClick={() => handleSelect(av.id)}
                    className={`relative rounded-2xl p-3 cursor-pointer transition-all flex flex-col items-center text-center ${
                      isSelected
                        ? 'bg-gradient-to-b from-pink-950/60 to-purple-950/40 border-2 border-pink-500 shadow-[0_0_15px_rgba(255,46,147,0.4)] scale-102'
                        : 'bg-slate-900/60 border border-slate-800 hover:border-pink-500/40'
                    }`}
                  >
                    {isSelected && (
                      <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-pink-600 text-white flex items-center justify-center text-xs">
                        <Check className="w-3 h-3" />
                      </span>
                    )}

                    <div className="w-20 h-24 mb-2 overflow-hidden flex items-center justify-center">
                      <LiveTalkingAvatar
                        size="sm"
                        avatarId={av.previewId}
                        className="scale-90"
                      />
                    </div>

                    <p className="text-xs font-bold text-slate-100">{av.name}</p>
                    <p className="text-[10px] text-pink-400/90 font-medium">{av.tag}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
