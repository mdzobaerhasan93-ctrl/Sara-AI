// SARA AI System-Wide Floating Overlay Service
// Enables Sara to physically float over other native apps (WhatsApp, YouTube, Facebook, Desktop)
// via Document Picture-in-Picture (PiP), Canvas Stream PiP, or Android Overlay Bridge.

export class SystemFloatingOverlayService {
  private static pipWindow: Window | null = null;
  private static pipVideo: HTMLVideoElement | null = null;
  private static canvasAnimationId: number | null = null;

  // Check if system Picture-in-Picture floating mode is supported
  static isSupported(): boolean {
    if (typeof window === 'undefined') return false;
    const hasDocPiP = 'documentPictureInPicture' in window;
    const hasVideoPiP = 'pictureInPictureEnabled' in document;
    return hasDocPiP || hasVideoPiP;
  }

  // Check if floating window is currently active
  static isActive(): boolean {
    if (this.pipWindow && !this.pipWindow.closed) return true;
    if (this.pipVideo && document.pictureInPictureElement === this.pipVideo) return true;
    return false;
  }

  // Launch Always-On-Top Floating Window over other apps
  static async startFloatingOverlay(options: {
    avatarUrl?: string;
    bengaliName?: string;
    onVoiceClick: () => void;
    onAppsClick: () => void;
    onClose?: () => void;
  }): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    // 1. Check if running inside native Android App with Overlay Bridge
    if ((window as any).AndroidBridge?.showSystemFloatingOrb) {
      try {
        (window as any).AndroidBridge.showSystemFloatingOrb();
        return true;
      } catch (err) {
        console.warn('Native Android overlay launch failed:', err);
      }
    }

    // 2. Primary: Document Picture-in-Picture (Chrome 116+, Edge, Android Chrome)
    // Opens a real floating interactive always-on-top window that stays on top of ANY app!
    if ('documentPictureInPicture' in window) {
      try {
        if (this.pipWindow && !this.pipWindow.closed) {
          this.pipWindow.focus();
          return true;
        }

        const pipWin = await (window as any).documentPictureInPicture.requestWindow({
          width: 270,
          height: 330,
        });

        this.pipWindow = pipWin;

        // Copy styles to PiP window
        [...document.styleSheets].forEach((styleSheet) => {
          try {
            const cssRules = [...styleSheet.cssRules].map((rule) => rule.cssText).join('');
            const style = pipWin.document.createElement('style');
            style.textContent = cssRules;
            pipWin.document.head.appendChild(style);
          } catch (e) {
            const link = pipWin.document.createElement('link');
            if (styleSheet.href) {
              link.rel = 'stylesheet';
              link.type = styleSheet.type;
              link.media = styleSheet.media;
              link.href = styleSheet.href;
              pipWin.document.head.appendChild(link);
            }
          }
        });

        // Set PiP document title & base styles
        pipWin.document.title = 'SARA AI Companion';
        pipWin.document.body.style.margin = '0';
        pipWin.document.body.style.padding = '14px';
        pipWin.document.body.style.background = 'radial-gradient(circle at 50% 30%, #170b2c 0%, #060515 70%, #020208 100%)';
        pipWin.document.body.style.color = '#f1f5f9';
        pipWin.document.body.style.fontFamily = 'system-ui, -apple-system, sans-serif';
        pipWin.document.body.style.display = 'flex';
        pipWin.document.body.style.flexDirection = 'column';
        pipWin.document.body.style.alignItems = 'center';
        pipWin.document.body.style.justifyContent = 'space-between';
        pipWin.document.body.style.height = '100vh';
        pipWin.document.body.style.boxSizing = 'border-box';
        pipWin.document.body.style.overflow = 'hidden';
        pipWin.document.body.style.userSelect = 'none';

        // Render Interactive Floating Controller inside the PiP window
        pipWin.document.body.innerHTML = `
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;margin-bottom:6px;">
            <div style="display:flex;align-items:center;gap:6px;">
              <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:#10b981;box-shadow:0 0 10px #10b981;"></span>
              <span style="font-size:12px;font-weight:bold;color:#f472b6;">SARA AI • ভাসমান মোড</span>
            </div>
            <span style="font-size:9px;background:#2e1065;color:#c084fc;padding:2px 6px;border-radius:6px;font-family:monospace;border:1px solid #7c3aed40;">ALWAYS ON TOP</span>
          </div>

          <div style="position:relative;width:84px;height:84px;border-radius:50%;background:linear-gradient(135deg,#ff2e93,#7928ca);display:flex;align-items:center;justify-content:center;box-shadow:0 0 30px rgba(255,46,147,0.8);margin:4px 0;">
            <div style="width:74px;height:74px;border-radius:50%;overflow:hidden;background:#000;display:flex;align-items:center;justify-content:center;">
              <span style="font-size:34px;">❤️</span>
            </div>
          </div>

          <p style="font-size:11px;color:#e2e8f0;text-align:center;margin:4px 0;line-height:1.4;font-weight:500;">
            অন্য যেকোনো অ্যাপে থাকলেও সারা সবসময় আপনার পাশে আছে 🥰
          </p>

          <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;width:100%;margin-top:6px;">
            <button id="pip-btn-voice" style="padding:9px;border-radius:12px;background:linear-gradient(135deg,#ec4899,#8b5cf6);color:#fff;border:none;font-size:11px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;box-shadow:0 2px 10px rgba(236,72,153,0.4);">
              🎙️ কথা বলুন
            </button>
            <button id="pip-btn-apps" style="padding:9px;border-radius:12px;background:#1e1b4b;color:#c084fc;border:1px solid rgba(192,132,252,0.4);font-size:11px;font-weight:bold;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:4px;">
              📱 অ্যাপস কন্ট্রোল
            </button>
          </div>
        `;

        // Wire up buttons in PiP window
        const voiceBtn = pipWin.document.getElementById('pip-btn-voice');
        if (voiceBtn) {
          voiceBtn.onclick = () => {
            window.focus();
            options.onVoiceClick();
          };
        }

        const appsBtn = pipWin.document.getElementById('pip-btn-apps');
        if (appsBtn) {
          appsBtn.onclick = () => {
            window.focus();
            options.onAppsClick();
          };
        }

        pipWin.addEventListener('pagehide', () => {
          this.pipWindow = null;
          if (options.onClose) options.onClose();
        });

        return true;
      } catch (err) {
        console.warn('Document PiP failed, attempting Universal Canvas Stream PiP:', err);
      }
    }

    // 3. Universal Fallback: Canvas Stream Picture-in-Picture
    // Supported across Chrome, Edge, Safari, Firefox for video PiP
    if (document.pictureInPictureEnabled) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 300;
        canvas.height = 300;
        const ctx = canvas.getContext('2d');
        if (!ctx) return false;

        let frame = 0;
        const draw = () => {
          frame++;
          ctx.fillStyle = '#060515';
          ctx.fillRect(0, 0, 300, 300);

          // Glowing background rings
          const pulse = Math.sin(frame * 0.06) * 12;
          const gradient = ctx.createRadialGradient(150, 140, 15, 150, 140, 95 + pulse);
          gradient.addColorStop(0, 'rgba(255, 46, 147, 0.85)');
          gradient.addColorStop(0.6, 'rgba(121, 40, 202, 0.45)');
          gradient.addColorStop(1, 'transparent');

          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(150, 140, 95 + pulse, 0, Math.PI * 2);
          ctx.fill();

          // Central Avatar circle
          ctx.fillStyle = '#ff2e93';
          ctx.beginPath();
          ctx.arc(150, 140, 56, 0, Math.PI * 2);
          ctx.fill();

          // Center heart emoji
          ctx.font = '34px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('❤️', 150, 140);

          // Bengali Brand Tagline
          ctx.font = 'bold 15px sans-serif';
          ctx.fillStyle = '#ffffff';
          ctx.fillText('SARA AI • অন্য অ্যাপে সাথে আছি', 150, 235);

          ctx.font = '11px sans-serif';
          ctx.fillStyle = '#f472b6';
          ctx.fillText('ট্যাপ করে সারা অ্যাপে ফিরুন', 150, 260);

          this.canvasAnimationId = requestAnimationFrame(draw);
        };
        draw();

        const stream = canvas.captureStream(30);
        let video = this.pipVideo;
        if (!video) {
          video = document.createElement('video');
          video.style.position = 'fixed';
          video.style.width = '1px';
          video.style.height = '1px';
          video.style.opacity = '0.001';
          video.style.pointerEvents = 'none';
          document.body.appendChild(video);
          this.pipVideo = video;
        }

        video.srcObject = stream;
        video.muted = true;
        video.playsInline = true;
        await video.play();

        await video.requestPictureInPicture();

        video.addEventListener('leavepictureinpicture', () => {
          if (this.canvasAnimationId) cancelAnimationFrame(this.canvasAnimationId);
          if (options.onClose) options.onClose();
        });

        return true;
      } catch (pipErr) {
        console.error('Universal PiP error:', pipErr);
      }
    }

    return false;
  }

  // Stop / Close Floating Overlay
  static stopFloatingOverlay() {
    if (this.pipWindow && !this.pipWindow.closed) {
      try {
        this.pipWindow.close();
      } catch (e) {}
      this.pipWindow = null;
    }

    if (this.pipVideo && document.pictureInPictureElement === this.pipVideo) {
      try {
        document.exitPictureInPicture();
      } catch (e) {}
    }

    if (this.pipVideo && this.pipVideo.parentNode) {
      try {
        this.pipVideo.parentNode.removeChild(this.pipVideo);
      } catch (e) {}
      this.pipVideo = null;
    }

    if (this.canvasAnimationId) {
      cancelAnimationFrame(this.canvasAnimationId);
      this.canvasAnimationId = null;
    }
  }
}
