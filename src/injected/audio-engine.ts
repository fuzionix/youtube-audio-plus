export class AudioEngine {
  private context: AudioContext | null = null;

  constructor() {
    console.log('[YouTube Audio Plus] Audio Engine Initialized');
    console.log('[YouTube Audio Plus] Context:', this.context);
  }

  public attach(video: HTMLMediaElement) {
    console.log('[YouTube Audio Plus] Attaching to video', video);
  }
}