/**
 * Synthesizes a loud, melodic alarm ringtone using Web Audio API + HTML5 Audio fallback.
 * Completely offline, works on mobile phones, tablets, and desktops.
 */

// Simple base64 PCM 8kHz WAV alarm chime beep as dual-fallback for mobile webviews
const BEEP_WAV_BASE64 =
  'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YVoGAACBhYqKjI2Oj5CSlJeYmpyen6Gio6WnqKqsrq+wsrO0trfAw8TFxsfIycrLzM3Oz9DR0tPU1dbX2Nna29zd3t/g4eLj5OXm5+jp6uvs7e7v8PHy8/T19vf4+fr7/P3+/w==';

class AlarmAudioEngine {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private loopTimer: any = null;
  private autoStopTimer: any = null;
  private fallbackAudio: HTMLAudioElement | null = null;

  constructor() {
    // Attempt lazy unlock on browser interaction
    if (typeof window !== 'undefined') {
      const unlock = () => {
        this.unlock();
      };
      window.addEventListener('pointerdown', unlock, { once: true, passive: true });
      window.addEventListener('touchstart', unlock, { once: true, passive: true });
      window.addEventListener('click', unlock, { once: true, passive: true });
    }
  }

  unlock() {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch (e) {
      // Ignore
    }
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Safety: Auto-stop alarm after 60 seconds so it never loops forever endlessly
    if (this.autoStopTimer) clearTimeout(this.autoStopTimer);
    this.autoStopTimer = setTimeout(() => {
      this.stop();
    }, 60000);

    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        if (!this.ctx || this.ctx.state === 'closed') {
          this.ctx = new AudioCtx();
        }
        if (this.ctx.state === 'suspended') {
          this.ctx.resume().catch(() => {});
        }
      }

      const playMelody = () => {
        if (!this.isPlaying) return;

        // 1. Web Audio Melodic Chime
        if (this.ctx && this.ctx.state !== 'closed') {
          if (this.ctx.state === 'suspended') {
            this.ctx.resume().catch(() => {});
          }

          const now = this.ctx.currentTime;
          // Sweet, harmonious 4-note bell chime (E5, G#5, B5, E6)
          const notes = [
            { f: 659.25, t: 0.0, d: 0.18, vol: 0.5 },
            { f: 830.61, t: 0.22, d: 0.18, vol: 0.5 },
            { f: 987.77, t: 0.44, d: 0.22, vol: 0.6 },
            { f: 1318.51, t: 0.68, d: 0.38, vol: 0.7 },
          ];

          notes.forEach(({ f, t, d, vol }) => {
            if (!this.ctx) return;
            try {
              const osc = this.ctx.createOscillator();
              const gain = this.ctx.createGain();

              osc.type = 'triangle'; // Rich bell-like chime timbre
              osc.frequency.setValueAtTime(f, now + t);

              gain.gain.setValueAtTime(0.001, now + t);
              gain.gain.exponentialRampToValueAtTime(vol, now + t + 0.03);
              gain.gain.exponentialRampToValueAtTime(0.001, now + t + d);

              osc.connect(gain);
              gain.connect(this.ctx.destination);

              osc.start(now + t);
              osc.stop(now + t + d + 0.05);
            } catch (err) {}
          });
        } else {
          // HTML5 Audio Fallback
          try {
            if (!this.fallbackAudio) {
              this.fallbackAudio = new Audio(BEEP_WAV_BASE64);
            }
            this.fallbackAudio.currentTime = 0;
            this.fallbackAudio.play().catch(() => {});
          } catch (e) {}
        }

        // Trigger phone tactile vibration
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          try {
            navigator.vibrate([400, 200, 400, 200, 400]);
          } catch (e) {}
        }

        // Loop next cycle after 1.6 seconds if still ringing
        if (this.isPlaying) {
          this.loopTimer = setTimeout(playMelody, 1600);
        }
      };

      playMelody();
    } catch (e) {
      console.warn('Alarm audio playback notice:', e);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.loopTimer) {
      clearTimeout(this.loopTimer);
      this.loopTimer = null;
    }
    if (this.autoStopTimer) {
      clearTimeout(this.autoStopTimer);
      this.autoStopTimer = null;
    }
    if (this.fallbackAudio) {
      try {
        this.fallbackAudio.pause();
        this.fallbackAudio = null;
      } catch (e) {}
    }
    if (this.ctx) {
      try {
        if (this.ctx.state !== 'closed') {
          this.ctx.close();
        }
      } catch (e) {}
      this.ctx = null;
    }
  }
}

export const alarmAudio = new AlarmAudioEngine();

/**
 * Robust Schedule & Alarm Matching Helper.
 * Supports:
 * - Direct targetTimestamp (e.g. countdown tests)
 * - 24-hour targetTime (e.g. "20:45")
 * - 12-hour strings (e.g. "08:00 AM", "8:00 AM Daily", "11:30 PM", "8:00am")
 * - Bengali digits (০-৯)
 * - Raw 24h strings (e.g. "20:45", "08:00")
 * - Minute grace window (matches current minute or up to 60s past)
 */
export function checkScheduleMatch(
  scheduleStr: string,
  date: Date = new Date(),
  targetTime?: string,
  targetTimestamp?: number
): boolean {
  const nowMs = date.getTime();

  // Check 1: Explicit targetTimestamp (e.g., 1-minute test alarm)
  if (targetTimestamp && targetTimestamp > 0) {
    const diffMs = nowMs - targetTimestamp;
    // Trigger if within 90 seconds after target timestamp
    if (diffMs >= 0 && diffMs <= 90000) {
      return true;
    }
    return false;
  }

  const currentHour24 = date.getHours();
  const currentMinute = date.getMinutes();
  const currentHour12 = currentHour24 % 12 || 12;
  const isPM = currentHour24 >= 12;
  const ampm = isPM ? 'pm' : 'am';

  const pad2 = (n: number) => n.toString().padStart(2, '0');
  const mm = pad2(currentMinute);
  const hh24 = pad2(currentHour24);
  const hh12 = pad2(currentHour12);

  // Check 2: Explicit 24h targetTime (e.g. "22:00" or "08:05")
  if (targetTime) {
    const cleanTarget = targetTime.trim();
    if (cleanTarget === `${hh24}:${mm}` || cleanTarget === `${currentHour24}:${mm}`) {
      return true;
    }
  }

  if (!scheduleStr) return false;

  // Convert Bengali digits (০-৯) to ASCII digits (0-9)
  const bengaliToAscii = (str: string) =>
    str.replace(/[০-৯]/g, (d) => String(d.charCodeAt(0) - 0x09e6));

  const clean = bengaliToAscii(scheduleStr.trim().toLowerCase());

  // Check 3: Standard 12-hour match (e.g. "10:30 pm", "10:30pm", "08:00 am", "8:00 am")
  const regex12 = new RegExp(`(^|\\b)0?${currentHour12}:${mm}\\s*${ampm}`, 'i');
  if (regex12.test(clean)) return true;

  // Check 4: 24-hour match (e.g. "22:30", "08:00", "8:00")
  const regex24 = new RegExp(`(^|\\b)0?${currentHour24}:${mm}(\\b|$)`, 'i');
  if (regex24.test(clean)) return true;

  // Check 5: Common text includes (e.g. "8:00 am", "08:00 am", "20:00")
  if (
    clean.includes(`${currentHour12}:${mm} ${ampm}`) ||
    clean.includes(`${hh12}:${mm} ${ampm}`) ||
    clean.includes(`${currentHour12}:${mm}${ampm}`) ||
    clean.includes(`${hh12}:${mm}${ampm}`)
  ) {
    return true;
  }

  if (clean.includes(`${currentHour24}:${mm}`) || clean.includes(`${hh24}:${mm}`)) {
    return true;
  }

  // Check 6: Just hour:minute without am/pm (if user set e.g. "8:30" or "08:30")
  const regexRaw = new RegExp(`(^|\\b)0?${currentHour12}:${mm}(\\b|$)`);
  if (regexRaw.test(clean) && !clean.includes('am') && !clean.includes('pm')) {
    return true;
  }

  return false;
}
