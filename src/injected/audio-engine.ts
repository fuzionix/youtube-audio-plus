interface MediaSourceState {
  node: MediaElementAudioSourceNode;
  connected: boolean;
  detachAfter?: number;
}

export class AudioEngine {
  private context: AudioContext;
  private sources: WeakMap<HTMLMediaElement, MediaSourceState>;
  private filters: BiquadFilterNode[];
  private preamp: GainNode;
  private compressor: DynamicsCompressorNode;
  private attachedVideos: Map<HTMLMediaElement, MediaSourceState>;
  private boundResumeContext: () => void;
  private boundHandleVisibilityChange: () => void;
  private boundHandleMediaEvent: (event: Event) => void;
  private cleanupTimer: number | undefined;
  private enabled = false;

  private readonly frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];
  private readonly detachGraceMs = 1000;

  constructor() {
    console.log('[YouTube Audio Plus] Audio Engine Initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass();
    this.sources = new WeakMap();
    this.filters = [];
    this.attachedVideos = new Map();

    // 1. Create Preamp (Gain)
    this.preamp = this.context.createGain();

    // 2. Create EQ Bands (Peaking Filters)
    this.filters = this.frequencies.map((freq) => {
      const filter = this.context.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.Q.value = 1.4;
      filter.gain.value = 0;
      return filter;
    });

    // 3. Create Compressor (Limiter) to prevent clipping
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -0.5;
    this.compressor.knee.value = 40;
    this.compressor.ratio.value = 12;
    this.compressor.attack.value = 0;
    this.compressor.release.value = 0.25;

    // 4. Connect the Chain
    this.preamp.connect(this.filters[0]);

    for (let i = 0; i < this.filters.length - 1; i++) {
      this.filters[i].connect(this.filters[i + 1]);
    }

    this.filters[this.filters.length - 1].connect(this.compressor);
    this.compressor.connect(this.context.destination);

    // 5. Defensive resume handling for suspended contexts
    this.boundResumeContext = this.resumeContext.bind(this);
    this.boundHandleVisibilityChange = this.handleVisibilityChange.bind(this);
    this.boundHandleMediaEvent = this.handleMediaEvent.bind(this);
    this.setupContextResilience();
  }

  private setupContextResilience() {
    // Tab becomes visible again
    document.addEventListener('visibilitychange', this.boundHandleVisibilityChange);

    window.addEventListener('focus', this.boundResumeContext);
    window.addEventListener('pointerdown', this.boundResumeContext);
    window.addEventListener('keydown', this.boundResumeContext);

    // React to native AudioContext state changes (e.g. OS-level interruptions)
    this.context.addEventListener('statechange', () => {
      console.log('[YouTube Audio Plus] AudioContext state changed:', this.context.state);
      if (this.context.state === 'suspended') {
        this.resumeContext();
      }
    });
  }

  private handleVisibilityChange() {
    if (document.visibilityState === 'visible') {
      this.resumeContext();
    }
  }

  private resumeContext() {
    if (this.context.state === 'suspended') {
      this.context.resume().catch((error) => {
        console.warn('[YouTube Audio Plus] Failed to resume AudioContext:', error);
      });
    }
  }

  public attach(video: HTMLMediaElement) {
    let source = this.sources.get(video);
    console.log('[YouTube Audio Plus] Attaching video:', video);
    if (source?.connected) {
      source.detachAfter = undefined;
      return;
    }

    try {
      if (!source) {
        source = {
          node: this.context.createMediaElementSource(video),
          connected: false,
        };
        // A media element can only have one source node, even after disconnect().
        this.sources.set(video, source);
        for (const type of ['play', 'pause', 'ended', 'volumechange', 'enterpictureinpicture', 'leavepictureinpicture']) {
          video.addEventListener(type, this.boundHandleMediaEvent);
        }
      }

      source.node.connect(this.enabled ? this.preamp : this.context.destination);
      source.connected = true;
      source.detachAfter = undefined;
      this.attachedVideos.set(video, source);

      this.resumeContext();
    } catch (error) {
      console.warn('[YouTube Audio Plus] Failed to attach to video:', error);
    }
  }

  private handleMediaEvent(event: Event) {
    const video = event.currentTarget;
    if (!(video instanceof HTMLMediaElement)) return;

    if (event.type === 'play' || event.type === 'enterpictureinpicture' ||
      (event.type === 'volumechange' && this.isAudible(video))) {
      this.attach(video);
    }
    this.resumeContext();
    this.releaseDetachedVideos();
  }

  private isAudible(video: HTMLMediaElement) {
    return !video.paused && !video.ended && !video.muted && video.volume > 0;
  }

  public releaseDetachedVideos() {
    if (this.cleanupTimer !== undefined) {
      window.clearTimeout(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }

    const now = performance.now();
    let nextCleanup = Infinity;
    for (const [video, source] of this.attachedVideos) {
      // DOM moves, detached playback and PiP must not interrupt the audio path.
      if (video.isConnected || this.isAudible(video) || document.pictureInPictureElement === video) {
        source.detachAfter = undefined;
        continue;
      }

      source.detachAfter ??= now + this.detachGraceMs;
      if (source.detachAfter <= now) {
        try {
          source.node.disconnect();
          source.connected = false;
          source.detachAfter = undefined;
          this.attachedVideos.delete(video);
          continue;
        } catch (error) {
          console.warn('[YouTube Audio Plus] Failed to disconnect video source:', error);
          source.detachAfter = now + this.detachGraceMs;
        }
      }
      nextCleanup = Math.min(nextCleanup, source.detachAfter);
    }

    if (nextCleanup !== Infinity) {
      this.cleanupTimer = window.setTimeout(() => this.releaseDetachedVideos(), nextCleanup - now);
    }
  }

  public setFilterGain(index: number, value: number) {
    if (this.filters[index]) {
      this.filters[index].gain.value = value;
    }
  }

  public setEnabled(enabled: boolean) {
    if (this.enabled === enabled) return;
    this.enabled = enabled;

    // Keep each media source alive: recreating it would break playback.
    for (const source of this.attachedVideos.values()) {
      source.node.disconnect();
      source.node.connect(enabled ? this.preamp : this.context.destination);
    }
    this.resumeContext();
  }

  public setPreampGain(value: number) {
    this.preamp.gain.value = value;
  }
}