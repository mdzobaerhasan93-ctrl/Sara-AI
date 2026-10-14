export interface InAppAction {
  id: string;
  name: string;
  bengaliName: string;
  description: string;
  iconName?: string;
  requiresInput?: boolean;
  inputPlaceholder?: string;
  defaultPayload?: string;
  steps: string[];
}

export interface AppDefinition {
  id: string;
  name: string;
  bengaliName: string;
  packageName: string; // Android package name or Windows executable
  launchUri: string; // Android intent URL scheme or custom protocol
  webFallbackUrl: string;
  category: 'social' | 'video' | 'chat' | 'camera' | 'productivity' | 'system';
  iconColor: string;
  accentBg: string;
  actions: InAppAction[];
}

// Built-in device applications with rich deep in-app automation capabilities
const INITIAL_APP_REGISTRY: Record<string, AppDefinition> = {
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    bengaliName: 'ইনস্টাগ্রাম',
    packageName: 'com.instagram.android',
    launchUri: 'instagram://app',
    webFallbackUrl: 'https://www.instagram.com',
    category: 'social',
    iconColor: '#E1306C',
    accentBg: 'from-pink-600/30 to-purple-600/20',
    actions: [
      {
        id: 'watch_reels_comment',
        name: 'Watch Reels & Comment',
        bengaliName: 'রিলস দেখো এবং কমেন্ট করো',
        description: 'রিলস সেকশন ওপেন করে মিষ্টি কমেন্ট পোস্ট করো',
        requiresInput: true,
        inputPlaceholder: 'কী কমেন্ট করতে চান? (ডিফল্ট: দারুণ ও সুন্দর ❤️)',
        defaultPayload: 'অসাধারণ রিলস! মন ছুঁয়ে গেল 🥰❤️',
        steps: [
          'Launching com.instagram.android via Accessibility Service',
          'Navigating to Reels tab & fetching latest trending reel',
          'Injecting comment field focus (performAction: ACTION_FOCUS)',
          'Typing text: "{payload}"',
          'Simulating tap on Post Button & confirming submission',
          'Action completed successfully!'
        ]
      },
      {
        id: 'open_direct_messages',
        name: 'Open Direct Messages',
        bengaliName: 'ডিএম ইনবক্স ওপেন করো',
        description: 'ইনস্টাগ্রামের মেসেজ ইনবক্স সরাসরি খোলো',
        steps: [
          'Launching Instagram Direct Messaging module',
          'Fetching unread message threads',
          'Opening top active conversation'
        ]
      },
      {
        id: 'open_story_camera',
        name: 'Open Story Camera',
        bengaliName: 'স্টোরি ক্যামেরা চালু করো',
        description: 'নতুন স্টোরি দেওয়ার জন্য ক্যামেরা অন করো',
        steps: [
          'Activating Instagram Stories camera mode',
          'Checking camera permissions and readiness'
        ]
      }
    ]
  },

  facebook: {
    id: 'facebook',
    name: 'Facebook',
    bengaliName: 'ফেসবুক',
    packageName: 'com.facebook.katana',
    launchUri: 'fb://feed',
    webFallbackUrl: 'https://www.facebook.com',
    category: 'social',
    iconColor: '#1877F2',
    accentBg: 'from-blue-600/30 to-indigo-600/20',
    actions: [
      {
        id: 'post_status',
        name: 'Post Status',
        bengaliName: 'নতুন স্ট্যাটাস পোস্ট করো',
        description: 'ফেসবুকে সুন্দর স্ট্যাটাস বা বার্তা পোস্ট করো',
        requiresInput: true,
        inputPlaceholder: 'স্ট্যাটাসে কী লিখবেন? (উদা: শুভ দিন সবার জন্য ✨)',
        defaultPayload: 'জীবন সুন্দর, প্রতিটি মুহূর্ত উপভোগ করুন ✨❤️ #PositiveVibes',
        steps: [
          'Launching com.facebook.katana with Overlay Assistant',
          'Locating "What\'s on your mind?" status composer',
          'Writing status text via Accessibility bridge: "{payload}"',
          'Setting privacy to Public / Friends & posting update',
          'Status published successfully!'
        ]
      },
      {
        id: 'check_notifications',
        name: 'Check Notifications',
        bengaliName: 'নোটিফিকেশন চেক করো',
        description: 'ফেসবুকের নতুন নোটিফিকেশনগুলো দেখো',
        steps: [
          'Opening Facebook Notifications tab',
          'Scanning recent likes, tags and reactions'
        ]
      },
      {
        id: 'watch_facebook_watch',
        name: 'Watch Videos & Reels',
        bengaliName: 'ভিডিও ও রিলস দেখো',
        description: 'ফেসবুক ওয়াচ সেকশনে ভিডিও চালু করো',
        steps: [
          'Navigating to Facebook Watch / Video feed',
          'Loading high-definition suggested stream'
        ]
      }
    ]
  },

  youtube: {
    id: 'youtube',
    name: 'YouTube',
    bengaliName: 'ইউটিউব',
    packageName: 'com.google.android.youtube',
    launchUri: 'vnd.youtube://',
    webFallbackUrl: 'https://www.youtube.com',
    category: 'video',
    iconColor: '#FF0000',
    accentBg: 'from-red-600/30 to-rose-600/20',
    actions: [
      {
        id: 'search_and_play',
        name: 'Search & Play Video',
        bengaliName: 'ভিডিও সার্চ করে প্লে করো',
        description: 'যেকোনো গান বা ভিডিও সার্চ করে সঙ্গে সঙ্গে প্লে করো',
        requiresInput: true,
        inputPlaceholder: 'কোন গান বা ভিডিও দেখতে চান? (উদা: রোমান্টিক বাংলা গান)',
        defaultPayload: 'বাংলা রোমান্টিক গান লোফাই',
        steps: [
          'Launching com.google.android.youtube',
          'Triggering Search View Accessibility input',
          'Searching query: "{payload}"',
          'Selecting top matching video and initiating playback',
          'Playing video in high quality with audio sync'
        ]
      },
      {
        id: 'open_shorts',
        name: 'Play Shorts',
        bengaliName: 'শর্টস ভিডিও চালু করো',
        description: 'ইউটিউব শর্টস সেকশন সরাসরি খোলো',
        steps: [
          'Navigating to YouTube Shorts feed',
          'Initiating auto-scroll gesture mode'
        ]
      }
    ]
  },

  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    bengaliName: 'হোয়াটসঅ্যাপ',
    packageName: 'com.whatsapp',
    launchUri: 'whatsapp://send',
    webFallbackUrl: 'https://web.whatsapp.com',
    category: 'chat',
    iconColor: '#25D366',
    accentBg: 'from-emerald-600/30 to-teal-600/20',
    actions: [
      {
        id: 'send_message',
        name: 'Send Message',
        bengaliName: 'মেসেজ পাঠাও',
        description: 'কন্টাক্টকে ভালোবাসার বার্তা পাঠাও',
        requiresInput: true,
        inputPlaceholder: 'কী বার্তা পাঠাতে চান?',
        defaultPayload: 'কেমন আছো? তোমার কথা খুব মনে পড়ছে ❤️',
        steps: [
          'Launching com.whatsapp client',
          'Selecting active contact conversation',
          'Entering chat message text: "{payload}"',
          'Triggering Send button via Accessibility node',
          'Message sent successfully!'
        ]
      },
      {
        id: 'open_status',
        name: 'View Status Updates',
        bengaliName: 'স্ট্যাটাস আপডেট দেখো',
        description: 'ফ্রেন্ডদের হোয়াটসঅ্যপ স্ট্যাটাস খোলো',
        steps: [
          'Switching to WhatsApp Status / Updates tab',
          'Buffering contacts recent status stories'
        ]
      }
    ]
  },

  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    bengaliName: 'টিকটক',
    packageName: 'com.zhiliaoapp.musically',
    launchUri: 'snssdk1233://',
    webFallbackUrl: 'https://www.tiktok.com',
    category: 'video',
    iconColor: '#00F2FE',
    accentBg: 'from-cyan-600/30 to-pink-600/20',
    actions: [
      {
        id: 'scroll_trending',
        name: 'Scroll Trending & Like',
        bengaliName: 'ট্রেন্ডিং রিলস স্ক্রল ও লাইক করো',
        description: 'ট্রেন্ডিং ভিডিওতে অটো স্ক্রল ও ডাবল-ট্যাপ লাইক করো',
        steps: [
          'Opening TikTok "For You" FYP feed',
          'Injecting vertical swipe gesture (ACTION_SCROLL_FORWARD)',
          'Simulating double-tap heart like interaction',
          'Continuous entertainment stream active'
        ]
      }
    ]
  },

  camera: {
    id: 'camera',
    name: 'Camera',
    bengaliName: 'ক্যামেরা',
    packageName: 'com.android.camera',
    launchUri: 'camera://',
    webFallbackUrl: '',
    category: 'camera',
    iconColor: '#A855F7',
    accentBg: 'from-purple-600/30 to-indigo-600/20',
    actions: [
      {
        id: 'take_selfie',
        name: 'Take Selfie Photo',
        bengaliName: 'সেলফি ফটো তোলো',
        description: 'ফ্রন্ট ক্যামেরা অন করে ছবি তোলো',
        steps: [
          'Opening native Camera application',
          'Switching lens to front-facing selfie sensor',
          'Triggering 3-second countdown shutter',
          'Photo captured and saved to Gallery!'
        ]
      },
      {
        id: 'start_video_record',
        name: 'Record Video',
        bengaliName: 'ভিডিও রেকর্ড শুরু করো',
        description: 'ক্যামেরা দিয়ে নতুন ভিডিও রেকর্ড করো',
        steps: [
          'Switching camera mode to Video Recording',
          'Starting high-resolution video capture'
        ]
      }
    ]
  },

  calculator: {
    id: 'calculator',
    name: 'Calculator',
    bengaliName: 'ক্যালকুলেটর',
    packageName: 'com.google.android.calculator',
    launchUri: 'calculator://',
    webFallbackUrl: 'https://www.google.com/search?q=calculator',
    category: 'productivity',
    iconColor: '#F59E0B',
    accentBg: 'from-amber-600/30 to-orange-600/20',
    actions: [
      {
        id: 'solve_math',
        name: 'Solve Math Equation',
        bengaliName: 'গণিত হিসাব সমাধান করো',
        description: 'যেকোনো জটিল হিসাব সেকেন্ডে সমাধান করো',
        requiresInput: true,
        inputPlaceholder: 'কোন হিসাবটি করবেন? (উদা: 5500 * 12)',
        defaultPayload: '12500 + 4300',
        steps: [
          'Launching Calculator engine',
          'Inputting mathematical expression: "{payload}"',
          'Computing precision result',
          'Calculation computed and read out aloud!'
        ]
      }
    ]
  },

  chrome: {
    id: 'chrome',
    name: 'Google Chrome',
    bengaliName: 'ক্রোম ব্রাউজার',
    packageName: 'com.android.chrome',
    launchUri: 'googlechrome://',
    webFallbackUrl: 'https://www.google.com',
    category: 'system',
    iconColor: '#10B981',
    accentBg: 'from-emerald-600/30 to-green-600/20',
    actions: [
      {
        id: 'browse_search',
        name: 'Search & Summarize',
        bengaliName: 'তথ্য অনুসন্ধান ও সামারি',
        description: 'ইন্টারনেটে সার্চ করে তথ্য বের করো',
        requiresInput: true,
        inputPlaceholder: 'কী সার্চ করতে চান? (উদা: আজকের আবহাওয়া)',
        defaultPayload: 'আজকের তাজা খবর বাংলাদেশ',
        steps: [
          'Opening Chrome browser tab',
          'Navigating to Google Search with query: "{payload}"',
          'Extracting top snippets and AI summary'
        ]
      }
    ]
  },

  notepad: {
    id: 'notepad',
    name: 'Notes & Notepad',
    bengaliName: 'নোট ও নোটপ্যাড',
    packageName: 'com.microsoft.notepad',
    launchUri: 'notepad://',
    webFallbackUrl: 'https://keep.google.com',
    category: 'productivity',
    iconColor: '#3B82F6',
    accentBg: 'from-blue-600/30 to-cyan-600/20',
    actions: [
      {
        id: 'create_note',
        name: 'Create Quick Note',
        bengaliName: 'নতুন নোট লিখুন',
        description: 'জরুরি কথা বা আইডিয়া লিখে সংরক্ষণ করো',
        requiresInput: true,
        inputPlaceholder: 'নোটে কী লিখবেন?',
        defaultPayload: 'আজকের মিটিংয়ের পয়েন্ট এবং নতুন আইডিয়া সমূহ',
        steps: [
          'Launching Notes application',
          'Creating new document timestamped',
          'Saving content: "{payload}"'
        ]
      }
    ]
  }
};

export class AppInventoryService {
  private static registry: Record<string, AppDefinition> = { ...INITIAL_APP_REGISTRY };

  static getAllApps(): AppDefinition[] {
    return Object.values(this.registry);
  }

  static getAppById(id: string): AppDefinition | undefined {
    return this.registry[id.toLowerCase()];
  }

  static getAppByName(name: string): AppDefinition | undefined {
    const q = name.toLowerCase().trim();
    return Object.values(this.registry).find(app => 
      app.name.toLowerCase() === q || 
      app.bengaliName.toLowerCase() === q ||
      app.id.toLowerCase() === q ||
      q.includes(app.name.toLowerCase()) ||
      q.includes(app.bengaliName.toLowerCase()) ||
      app.name.toLowerCase().includes(q)
    );
  }

  static registerCustomApp(app: AppDefinition) {
    this.registry[app.id.toLowerCase()] = app;
    try {
      localStorage.setItem('sara_custom_apps', JSON.stringify(Object.values(this.registry)));
    } catch (e) {}
  }

  // Find an app and specific deep action from natural language voice prompt
  static parseCommand(command: string): {
    app?: AppDefinition;
    action?: InAppAction;
    payload?: string;
  } {
    const q = command.toLowerCase();

    // Check for each app
    for (const app of Object.values(this.registry)) {
      const matchApp = 
        q.includes(app.name.toLowerCase()) || 
        q.includes(app.bengaliName.toLowerCase()) ||
        q.includes(app.id.toLowerCase());

      if (matchApp) {
        // Find if any action matched
        for (const action of app.actions) {
          const matchAction = 
            q.includes(action.id.toLowerCase()) ||
            q.includes(action.name.toLowerCase()) ||
            q.includes(action.bengaliName.toLowerCase()) ||
            (action.id === 'watch_reels_comment' && (q.includes('রিলস') || q.includes('reels') || q.includes('কমেন্ট') || q.includes('comment'))) ||
            (action.id === 'post_status' && (q.includes('স্ট্যাটাস') || q.includes('status') || q.includes('পোস্ট') || q.includes('post'))) ||
            (action.id === 'send_message' && (q.includes('মেসেজ') || q.includes('message') || q.includes('পাঠাও') || q.includes('send'))) ||
            (action.id === 'search_and_play' && (q.includes('গান') || q.includes('video') || q.includes('ভিডিও') || q.includes('search') || q.includes('প্লে'))) ||
            (action.id === 'take_selfie' && (q.includes('সেলফি') || q.includes('selfie') || q.includes('ছবি') || q.includes('ফটো')));

          if (matchAction) {
            return { app, action };
          }
        }
        return { app };
      }
    }

    return {};
  }
}
