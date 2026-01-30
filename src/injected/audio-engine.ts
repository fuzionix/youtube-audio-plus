export class AudioEngine {
  private context: AudioContext;
  private sources: WeakMap<HTMLMediaElement, MediaElementAudioSourceNode>;
  private filters: BiquadFilterNode[];
  private preamp: GainNode;
  private compressor: DynamicsCompressorNode;

  private readonly frequencies = [32, 64, 125, 250, 500, 1000, 2000, 4000, 8000, 16000];

  constructor() {
    console.log('[YouTube Audio Plus] Audio Engine Initialized');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.context = new AudioContextClass();
    this.sources = new WeakMap();
    this.filters = [];

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
  }

  public attach(video: HTMLMediaElement) {
    console.log('[YouTube Audio Plus] Attaching to video', video);
    if (this.sources.has(video)) return;

    try {
      const source = this.context.createMediaElementSource(video);
      source.connect(this.preamp);
      this.sources.set(video, source);

      // Ensure context is running
      if (this.context.state === 'suspended') {
        this.context.resume();
      }

      // Re-check context state on play
      video.addEventListener('play', () => {
        if (this.context.state === 'suspended') {
          this.context.resume();
        }
      });
    } catch (error) {
      console.warn('[YouTube Audio Plus] Failed to attach to video:', error);
    }
  }

  public setFilterGain(index: number, value: number) {
    if (this.filters[index]) {
      this.filters[index].gain.value = value;
    }
  }

  public setPreampGain(value: number) {
    this.preamp.gain.value = value;
  }
}