// SARA AI Agent Service. External actions remain drafts unless a real, verified integration exists.
import { normalizeAgentBuilderData } from './AgentBuilderValidation';

export interface AgentActionStep {
  title: string;
  detail: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  timestamp?: string;
}

export interface AgentExecutionResult {
  id: string;
  type: 'youtube_movie' | 'facebook_comment' | 'whatsapp_message' | 'app_launch' | 'general_task' | 'autonomous_builder';
  title: string;
  bengaliTitle: string;
  targetApp: string;
  steps: AgentActionStep[];
  success: boolean;
  message: string;
  payload?: {
    movieTitle?: string;
    movieYear?: string;
    movieGenre?: string;
    movieRating?: string;
    movieSummary?: string;
    searchUrl?: string;
    youtubeEmbedId?: string;
    commentText?: string;
    postPreviewUrl?: string;
    postAuthor?: string;
    postContent?: string;
    recipient?: string;
    messageText?: string;
    launchUri?: string;
    webFallbackUrl?: string;
    taskTitle?: string;
    summary?: string;
    techStack?: string[];
    modelsInvolved?: string[];
    files?: Array<{ fileName: string; language: string; content: string }>;
    livePreviewHtml?: string;
  };
}

export class AIAgentService {
  // Suggestion names only. Metadata and video IDs are not assumed to be verified.
  static readonly FEATURED_MOVIES: Record<string, { title: string }> = {
    'তুফান': { title: 'Toofan (তুফান)' },
    'প্রিয়তমা': { title: 'Priyotoma (প্রিয়তমা)' },
    'হাওয়া': { title: 'Hawa (হাওয়া)' },
    'সুরঙ্গ': { title: 'Surongo (সুরঙ্গ)' },
    'জওয়ান': { title: 'Jawan (জওয়ান)' },
    'পাঠান': { title: 'Pathaan (পাঠান)' },
    'কেজিএফ': { title: 'KGF: Chapter 2' },
    'টাইটানিক': { title: 'Titanic' },
  };

  // Determine if a user prompt is an AI Agent Command
  static isAgentCommand(input: string): boolean {
    const q = input.toLowerCase();
    return (
      q.includes('ফেসবুক') ||
      q.includes('facebook') ||
      q.includes('ইউটিউব') ||
      q.includes('youtube') ||
      q.includes('মুভি') ||
      q.includes('movie') ||
      q.includes('কমেন্ট') ||
      q.includes('comment') ||
      q.includes('হোয়াটসঅ্যাপ') ||
      q.includes('whatsapp') ||
      q.includes('ওপেন করে') ||
      q.includes('সার্চ দাও') ||
      q.includes('সার্চ করো') ||
      q.includes('কন্ট্রোল') ||
      q.includes('পোস্ট') ||
      q.includes('বানাও') ||
      q.includes('তৈরি করো') ||
      q.includes('তৈরি') ||
      q.includes('স্টুডিও') ||
      q.includes('studio') ||
      q.includes('অ্যাপ') ||
      q.includes('app') ||
      q.includes('কোড') ||
      q.includes('code') ||
      q.includes('কাজ') ||
      q.includes('ক্যালকুলেটর') ||
      q.includes('calculator') ||
      q.includes('নিজে নিজে')
    );
  }

  // Get saved Gemini API Key if available
  static getCustomGeminiKey(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('sara_custom_gemini_key')?.trim() || '';
    }
    return '';
  }

  // Parse natural command and execute AI agent pipeline
  static async executeCommand(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    const q = command.toLowerCase().trim();

    // 1. YouTube Movie Search Command (e.g. "ইউটিউব ওপেন করে একটা মুভি সার্চ দাও", "ইউটিউবে তুফান মুভি সার্চ দাও")
    if (q.includes('ইউটিউব') || q.includes('youtube') || ((q.includes('মুভি') || q.includes('movie')) && !q.includes('বানাও') && !q.includes('অ্যাপ'))) {
      return this.handleYouTubeMovieSearch(command, onStepUpdate);
    }

    // 2. Facebook Post Comment Command (e.g. "ফেসবুক ওপেন করে একটা পোস্টে কমেন্ট করো")
    if ((q.includes('ফেসবুক') || q.includes('facebook')) && (q.includes('কমেন্ট') || q.includes('পোস্ট'))) {
      return this.handleFacebookComment(command, onStepUpdate);
    }

    // 3. WhatsApp Message Command
    if (q.includes('হোয়াটসঅ্যাপ') || q.includes('whatsapp') || q.includes('মেসেজ পাঠাও')) {
      return this.handleWhatsAppMessage(command, onStepUpdate);
    }

    // 4. Autonomous App Builder & General AI Problem Solver (e.g. "গুগল স্টুডিও অন করে একটা অ্যাপ বানাও", custom apps, scripts, automations)
    return this.handleAutonomousBuilder(command, onStepUpdate);
  }

  // 1. YouTube Movie Search Handler
  private static async handleYouTubeMovieSearch(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    const cleaned = command
      .replace(/ইউটিউব\s*(ওপেন\s*করে)?/gi, '')
      .replace(/youtube\s*(open)?/gi, '')
      .replace(/একটা\s*মুভি\s*(সার্চ\s*দাও|সার্চ\s*করো)?/gi, '')
      .replace(/মুভি\s*(সার্চ\s*দাও|সার্চ\s*করো)?/gi, '')
      .replace(/movie\s*(search)?/gi, '')
      .replace(/বলবো\s*ও\s*মুভি/gi, '')
      .replace(/সার্চ\s*(দাও|করো|দিতে)?/gi, '')
      .replace(/open|search/gi, '')
      .trim();

    let extractedMovie = '';
    for (const key of Object.keys(this.FEATURED_MOVIES)) {
      if (command.includes(key) || cleaned.includes(key)) {
        extractedMovie = key;
        break;
      }
    }

    if (!extractedMovie && cleaned.length > 1) {
      extractedMovie = cleaned;
    }

    if (!extractedMovie) {
      const steps: AgentActionStep[] = [
        { title: 'Command Review', detail: 'কোন মুভিটি সার্চ করতে হবে তা নির্দিষ্ট করা হয়নি।', status: 'done' },
      ];
      if (onStepUpdate) onStepUpdate(steps[0]);
      return {
        id: `agent_yt_${Date.now()}`,
        type: 'youtube_movie',
        title: 'YouTube Search Needs a Movie Title',
        bengaliTitle: 'মুভির নাম প্রয়োজন',
        targetApp: 'YouTube',
        steps,
        success: false,
        message: 'বাবু, কোন মুভিটি সার্চ করব তার নামটা বলো—আমি YouTube-এর সার্চ লিংক তৈরি করে দেব। ❤️',
        payload: { searchUrl: 'https://www.youtube.com/' },
      };
    }

    const movieData = this.FEATURED_MOVIES[extractedMovie];
    const movieTitle = movieData?.title || extractedMovie;
    const searchQuery = `${movieTitle} official trailer`;
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

    const steps: AgentActionStep[] = [
      { title: 'Agent Initialization', detail: 'সারা এআই এজেন্ট সাব-সিস্টেম চালু হচ্ছে...', status: 'running' },
      { title: 'Natural Language Parsing', detail: `কমান্ড বিশ্লেষণ: "${command}" -> টার্গেট অ্যাপ: YouTube`, status: 'pending' },
      { title: 'Search Parameter Synthesis', detail: `YouTube search query তৈরি: "${searchQuery}"`, status: 'pending' },
      { title: 'Search Link Ready', detail: 'YouTube-এর সার্চ পেজের লিংক তৈরি হয়েছে; ভিডিওর পরিচয় বা availability যাচাই করা হয়নি।', status: 'pending' },
    ];

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'running';
      steps[i].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onStepUpdate) onStepUpdate(steps[i]);
      await new Promise((r) => setTimeout(r, 150));
      steps[i].status = 'done';
    }

    return {
      id: `agent_yt_${Date.now()}`,
      type: 'youtube_movie',
      title: `YouTube Search: ${extractedMovie}`,
      bengaliTitle: `ইউটিউবে সার্চ: ${extractedMovie}`,
      targetApp: 'YouTube',
      steps,
      success: true,
      message: `বাবু, "${movieTitle}"-এর YouTube search link তৈরি করেছি। লিংক খুলে আসল সার্চ রেজাল্ট নিজে দেখে নাও—আমি কোনো নির্দিষ্ট ভিডিও, রেটিং বা ফুল-মুভি availability যাচাই করে দেখাইনি। ❤️`,
      payload: {
        movieTitle,
        searchUrl,
      },
    };
  }

  // 2. Facebook Post Comment Handler
  private static async handleFacebookComment(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    const defaultComments = [
      'অসাধারণ পোস্ট! মন ছুঁয়ে গেল, শুভকামনা রইল ✨❤️',
      'জীবন সুন্দর, এমন সুন্দর চিন্তার জন্য ধন্যবাদ! অনেক ভালোবাসা 🌸🥰',
      'খুব দারুণ লিখেছেন! সবসময় ইতিবাচক থাকুন 💫❤️',
      'সত্যিই চমৎকার একটি বার্তা! ভালো থাকবেন সবসময় 🌟',
    ];
    const randomComment = defaultComments[Math.floor(Math.random() * defaultComments.length)];

    const steps: AgentActionStep[] = [
      { title: 'Connecting Facebook Module', detail: 'Facebook Interface Bridge শুরু হচ্ছে...', status: 'running' },
      { title: 'Facebook Ready', detail: 'Facebook খোলার জন্য প্রস্তুত; কোনো পোস্ট নির্বাচন করা হয়নি।', status: 'pending' },
      { title: 'AI Comment Draft', detail: `কমেন্টের খসড়া তৈরি: "${randomComment}"`, status: 'pending' },
      { title: 'User Review Required', detail: 'Facebook-এ খসড়াটি নিজে দেখে পোস্ট করতে হবে।', status: 'pending' },
      { title: 'Awaiting User Submission', detail: 'কোনো কমেন্ট পোস্ট করা হয়নি; ব্যবহারকারীর পদক্ষেপ প্রয়োজন।', status: 'pending' },
    ];

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'running';
      steps[i].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onStepUpdate) onStepUpdate(steps[i]);
      await new Promise((r) => setTimeout(r, 400));
      steps[i].status = 'done';
    }

    return {
      id: `agent_fb_${Date.now()}`,
      type: 'facebook_comment',
      title: 'Facebook Post Auto-Comment',
      bengaliTitle: 'ফেসবুক পোস্টে স্বয়ংক্রিয় কমেন্ট',
      targetApp: 'Facebook',
      steps,
      success: true,
      message: 'বাবু, তোমার জন্য একটি কমেন্টের খসড়া তৈরি করেছি ❤️ এখনো Facebook-এ কিছু পোস্ট করা হয়নি। Facebook খুলে পছন্দের পোস্টে খসড়াটি নিজে যাচাই করে পোস্ট করতে পারবে।',
      payload: {
        commentText: randomComment,
        webFallbackUrl: 'https://www.facebook.com',
      },
    };
  }

  // 3. WhatsApp Message Handler
  private static async handleWhatsAppMessage(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    const defaultMsg = 'কেমন আছো সোনা? তোমার কথা খুব মনে পড়ছে, নিজের যত্ন নিও কিন্তু ❤️';

    const whatsappDraftUrl = `https://wa.me/?text=${encodeURIComponent(defaultMsg)}`;
    const steps: AgentActionStep[] = [
      { title: 'WhatsApp Ready', detail: 'WhatsApp draft link তৈরি করা হচ্ছে...', status: 'running' },
      { title: 'Recipient Not Selected', detail: 'কোনো প্রাপক নির্দিষ্ট করা হয়নি; WhatsApp-এ প্রাপক বেছে নাও।', status: 'pending' },
      { title: 'Message Drafted', detail: `বার্তার খসড়া তৈরি: "${defaultMsg}"`, status: 'pending' },
      { title: 'Awaiting User Send', detail: 'বার্তা পাঠানো হয়নি; WhatsApp-এ গিয়ে যাচাই করে নিজে Send করতে হবে।', status: 'pending' },
    ];

    for (let i = 0; i < steps.length; i++) {
      steps[i].status = 'running';
      steps[i].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onStepUpdate) onStepUpdate(steps[i]);
      await new Promise((r) => setTimeout(r, 380));
      steps[i].status = 'done';
    }

    return {
      id: `agent_wa_${Date.now()}`,
      type: 'whatsapp_message',
      title: 'WhatsApp Message Dispatch',
      bengaliTitle: 'হোয়াটসঅ্যাপ বার্তা প্রেরণ',
      targetApp: 'WhatsApp',
      steps,
      success: true,
      message: 'বাবু, তোমার WhatsApp বার্তার খসড়া তৈরি করেছি ❤️ এখনো মেসেজ পাঠানো হয়নি। নিচের লিংক খুলে প্রাপক বেছে নিয়ে বার্তাটি যাচাই করে নিজে Send করো।',
      payload: {
        messageText: defaultMsg,
        webFallbackUrl: whatsappDraftUrl,
      },
    };
  }

  // 4. Autonomous App Builder & Multi-Model Execution Engine
  private static async handleAutonomousBuilder(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    const steps: AgentActionStep[] = [
      { title: '1. Task Scope', detail: `কমান্ড বিশ্লেষণ: "${command.slice(0, 45)}"`, status: 'running' },
      { title: '2. Preview Generation', detail: 'Configured Gemini API থেকে একটি browser preview চাওয়া হচ্ছে; multi-model orchestration নয়।', status: 'pending' },
      { title: '3. Preview Payload Check', detail: 'HTML payload আছে কি না এবং size limit-এর মধ্যে কি না যাচাই করা হচ্ছে।', status: 'pending' },
      { title: '4. Restricted Sandbox Setup', detail: 'Preview restricted iframe-এ দেখানো হবে; build/test/deploy করা হচ্ছে না।', status: 'pending' },
      { title: '5. Ready to Inspect', detail: 'Browser preview পাওয়া গেলে user নিজে inspect করতে পারবেন; production verification করা হয়নি।', status: 'pending' },
    ];

    // Initial phase updates
    steps[0].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (onStepUpdate) onStepUpdate(steps[0]);
    await new Promise((r) => setTimeout(r, 300));
    steps[0].status = 'done';

    steps[1].status = 'running';
    steps[1].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (onStepUpdate) onStepUpdate(steps[1]);

    let payloadData: any = null;

    try {
      const customKey = this.getCustomGeminiKey();
      const res = await fetch('/api/agent-solve', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-api-key': customKey,
        },
        body: JSON.stringify({
          task: command,
          taskType: 'app_builder',
        }),
      });

      const resJson = await res.json();
      if (resJson?.success && resJson.data) {
        payloadData = normalizeAgentBuilderData(resJson.data, resJson.provider);
      }
    } catch (e) {
      console.warn('API call error in handleAutonomousBuilder:', e);
    }

    const markStep = (index: number, status: AgentActionStep['status'], detail: string) => {
      steps[index].status = status;
      steps[index].detail = detail;
      steps[index].timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      if (onStepUpdate) onStepUpdate(steps[index]);
    };

    if (!payloadData) {
      markStep(1, 'failed', 'কোনো usable preview payload পাওয়া যায়নি।');
      for (let index = 2; index < steps.length; index += 1) {
        markStep(index, 'failed', 'আগের ধাপটি ব্যর্থ হওয়ায় এই ধাপ চালানো হয়নি।');
      }
      return {
        id: `agent_auto_${Date.now()}`,
        type: 'autonomous_builder',
        title: 'Preview unavailable',
        bengaliTitle: 'প্রিভিউ পাওয়া যায়নি',
        targetApp: 'Browser Preview Sandbox',
        steps,
        success: false,
        message: 'বাবু, এইবার usable preview তৈরি করা যায়নি। কোনো app build, test বা deploy করা হয়েছে বলে ধরে নিও না। আবার চেষ্টা করতে পারো।',
        payload: {
          taskTitle: 'Preview unavailable',
          summary: 'No valid preview HTML was returned from the configured generation endpoint.',
          techStack: [],
          modelsInvolved: [],
          files: [],
          livePreviewHtml: '',
        },
      };
    }

    markStep(1, 'done', payloadData.provider === 'fallback'
      ? 'Gemini response পাওয়া যায়নি; built-in fallback template ব্যবহার হয়েছে।'
      : 'Gemini API একটি browser preview payload দিয়েছে।');

    markStep(2, 'running', 'Preview HTML payload-এর উপস্থিতি ও size limit যাচাই করা হচ্ছে।');
    await new Promise((r) => setTimeout(r, 100));
    markStep(2, 'done', 'Preview HTML পাওয়া গেছে; code compile বা tests চালানো হয়নি।');

    markStep(3, 'running', 'Restricted browser sandbox প্রস্তুত করা হচ্ছে।');
    await new Promise((r) => setTimeout(r, 100));
    markStep(3, 'done', 'Preview iframe-এ দেখা যাবে; server-side execution বা network integration নেই।');

    markStep(4, 'done', 'Preview inspect করার জন্য প্রস্তুত; production build/test/deploy verification হয়নি।');

    const title = payloadData.taskTitle;
    const bengaliTitle = payloadData.bengaliTitle;
    const message = payloadData.provider === 'fallback'
      ? 'বাবু, আসল Gemini preview পাওয়া যায়নি, তাই শুধু built-in sample template দেখাচ্ছি। এটি তোমার চাওয়া app-এর পূর্ণ implementation নয় এবং build/test/deploy করা হয়নি। ❤️'
      : 'বাবু, Gemini API থেকে browser preview HTML এসেছে। এটি একটি prototype preview; compile, automated test বা deployment verification করা হয়নি। ❤️';

    return {
      id: `agent_auto_${Date.now()}`,
      type: 'autonomous_builder',
      title,
      bengaliTitle,
      targetApp: 'Browser Preview Sandbox',
      steps,
      success: true,
      message,
      payload: {
        taskTitle: title,
        summary: payloadData.summary,
        techStack: payloadData.techStack,
        modelsInvolved: payloadData.modelsInvolved,
        files: payloadData.files,
        livePreviewHtml: payloadData.livePreviewHtml,
      },
    };
  }

  // 5. Generic App Command
  private static async handleGenericAppCommand(
    command: string,
    onStepUpdate?: (step: AgentActionStep) => void
  ): Promise<AgentExecutionResult> {
    return this.handleAutonomousBuilder(command, onStepUpdate);
  }
}
