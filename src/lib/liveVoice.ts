/**
 * Gemini Live API Client & Web Audio Engine
 * Supports real-time bidirectional voice conversations with model `gemini-3.1-flash-live-preview`.
 * Handles 16kHz microphone capture, 16-bit PCM encoding, 24kHz playback scheduling,
 * live interruptions, transcript sync, and real-time audio visualization.
 */

export interface LiveTranscriptItem {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  timestamp: string;
}

export type LiveSessionStatus =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'listening'
  | 'speaking'
  | 'interrupted'
  | 'error'
  | 'closed';

export interface LiveVoiceSessionOptions {
  voice?: 'Zephyr' | 'Puck' | 'Charon' | 'Kore' | 'Fenrir';
  systemPrompt?: string;
  onStatusChange?: (status: LiveSessionStatus) => void;
  onTranscript?: (item: LiveTranscriptItem) => void;
  onAudioLevel?: (inputLevel: number, outputLevel: number) => void;
  onError?: (error: string) => void;
}

export class LiveVoiceSession {
  private ws: WebSocket | null = null;
  private inputAudioCtx: AudioContext | null = null;
  private outputAudioCtx: AudioContext | null = null;
  private mediaStream: MediaStream | null = null;
  private scriptProcessor: ScriptProcessorNode | null = null;
  private gainNode: GainNode | null = null;
  private activeSources: AudioBufferSourceNode[] = [];
  private nextStartTime: number = 0;
  private isMuted: boolean = false;
  private options: LiveVoiceSessionOptions;
  private status: LiveSessionStatus = 'idle';

  constructor(options: LiveVoiceSessionOptions = {}) {
    this.options = {
      voice: options.voice || 'Zephyr',
      systemPrompt: options.systemPrompt,
      onStatusChange: options.onStatusChange,
      onTranscript: options.onTranscript,
      onAudioLevel: options.onAudioLevel,
      onError: options.onError,
    };
  }

  public getStatus(): LiveSessionStatus {
    return this.status;
  }

  private setStatus(newStatus: LiveSessionStatus) {
    this.status = newStatus;
    this.options.onStatusChange?.(newStatus);
  }

  /**
   * Start the live voice conversation
   */
  public async start(): Promise<void> {
    if (this.status === 'connecting' || this.status === 'connected') {
      return;
    }

    this.setStatus('connecting');

    try {
      // 1. Request microphone access
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Microphone access is not supported by your browser environment.');
      }

      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
          sampleRate: 16000,
        },
      });

      // 2. Initialize Output AudioContext at 24kHz for model audio playback
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.outputAudioCtx = new AudioContextClass({ sampleRate: 24000 });
      if (this.outputAudioCtx.state === 'suspended') {
        await this.outputAudioCtx.resume();
      }
      this.gainNode = this.outputAudioCtx.createGain();
      this.gainNode.gain.value = 1.0;
      this.gainNode.connect(this.outputAudioCtx.destination);
      this.nextStartTime = 0;

      // 3. Connect to Backend WebSocket
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const queryParams = new URLSearchParams();
      if (this.options.voice) queryParams.set('voice', this.options.voice);
      if (this.options.systemPrompt) queryParams.set('prompt', this.options.systemPrompt);

      const wsUrl = `${protocol}//${window.location.host}/api/live?${queryParams.toString()}`;
      this.ws = new WebSocket(wsUrl);

      this.ws.onopen = () => {
        // Setup input audio capture now that socket is open
        this.setupMicrophonePipeline();
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleServerMessage(data);
        } catch (e) {
          console.error('[LiveClient] Error parsing message:', e);
        }
      };

      this.ws.onerror = (e) => {
        console.error('[LiveClient] WebSocket error:', e);
        const errMsg = 'Failed to connect to Live API server. Check network and GEMINI_API_KEY.';
        this.setStatus('error');
        this.options.onError?.(errMsg);
      };

      this.ws.onclose = () => {
        if (this.status !== 'error') {
          this.setStatus('closed');
        }
        this.cleanupAudio();
      };
    } catch (err: any) {
      console.error('[LiveClient] Start error:', err);
      this.setStatus('error');
      this.options.onError?.(err?.message || 'Could not start live voice session');
      this.stop();
    }
  }

  /**
   * Sets up 16kHz audio input processing and sends PCM chunks to server
   */
  private setupMicrophonePipeline(): void {
    if (!this.mediaStream) return;

    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.inputAudioCtx = new AudioContextClass({ sampleRate: 16000 });

      const source = this.inputAudioCtx.createMediaStreamSource(this.mediaStream);
      // Using 4096 buffer size for balanced latency and network packet size
      this.scriptProcessor = this.inputAudioCtx.createScriptProcessor(4096, 1, 1);

      source.connect(this.scriptProcessor);
      this.scriptProcessor.connect(this.inputAudioCtx.destination);

      this.scriptProcessor.onaudioprocess = (e) => {
        if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
        if (this.isMuted) return;

        const inputData = e.inputBuffer.getChannelData(0);

        // Calculate input audio level for visualization
        let sum = 0;
        for (let i = 0; i < inputData.length; i++) {
          sum += inputData[i] * inputData[i];
        }
        const rms = Math.sqrt(sum / inputData.length);
        const inputLevel = Math.min(1, rms * 5); // amplify for visual feedback

        this.options.onAudioLevel?.(inputLevel, 0);

        // Convert Float32Array (-1.0 to 1.0) to 16-bit signed PCM Int16Array
        const pcm16 = new Int16Array(inputData.length);
        for (let i = 0; i < inputData.length; i++) {
          const s = Math.max(-1, Math.min(1, inputData[i]));
          pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
        }

        // Convert Int16Array to Base64
        const base64 = this.pcm16ToBase64(pcm16);

        // Send to Live API via server
        this.ws.send(
          JSON.stringify({
            type: 'audio',
            audio: base64,
            mimeType: 'audio/pcm;rate=16000',
          })
        );
      };
    } catch (e) {
      console.error('[LiveClient] Error configuring audio input:', e);
    }
  }

  /**
   * Handle messages received from Live API server
   */
  private handleServerMessage(data: any): void {
    if (data.type === 'connected') {
      this.setStatus('connected');
      this.options.onTranscript?.({
        id: 'sys-' + Date.now(),
        role: 'system',
        text: `Live voice channel connected with ${data.model} (Voice: ${data.voice || this.options.voice}). Speak freely!`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (data.type === 'audio' && data.audio) {
      this.setStatus('speaking');
      this.playPcmAudioChunk(data.audio);
    } else if (data.type === 'interrupted') {
      this.setStatus('interrupted');
      this.stopPlayback();
      setTimeout(() => {
        if (this.status === 'interrupted') {
          this.setStatus('connected');
        }
      }, 400);
    } else if (data.type === 'turnComplete') {
      if (this.status === 'speaking') {
        this.setStatus('connected');
      }
    } else if (data.type === 'transcription') {
      this.options.onTranscript?.({
        id: 'tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        role: data.role === 'user' ? 'user' : 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (data.type === 'text') {
      this.options.onTranscript?.({
        id: 'txt-' + Date.now(),
        role: 'model',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      });
    } else if (data.type === 'error') {
      this.setStatus('error');
      this.options.onError?.(data.error);
    } else if (data.type === 'sessionClosed') {
      this.setStatus('closed');
    }
  }

  /**
   * Play incoming 24kHz raw 16-bit PCM base64 audio
   */
  private playPcmAudioChunk(base64Data: string): void {
    if (!this.outputAudioCtx || !this.gainNode) return;

    try {
      // Decode base64 to binary string
      const binaryString = atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Convert 16-bit little-endian PCM bytes to Float32
      const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
      const float32 = new Float32Array(int16.length);

      let sum = 0;
      for (let i = 0; i < int16.length; i++) {
        const val = int16[i] / 32768.0;
        float32[i] = val;
        sum += val * val;
      }

      // Provide output audio level for visualizer
      const rms = Math.sqrt(sum / int16.length);
      const outputLevel = Math.min(1, rms * 4);
      this.options.onAudioLevel?.(0, outputLevel);

      // Create Web Audio Buffer at 24000 Hz
      const audioBuffer = this.outputAudioCtx.createBuffer(1, float32.length, 24000);
      audioBuffer.copyToChannel(float32, 0);

      // Schedule gapless playback
      const currentTime = this.outputAudioCtx.currentTime;
      const startTime = Math.max(currentTime, this.nextStartTime);
      const source = this.outputAudioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.gainNode);

      source.start(startTime);
      this.nextStartTime = startTime + audioBuffer.duration;

      this.activeSources.push(source);
      source.onended = () => {
        const idx = this.activeSources.indexOf(source);
        if (idx !== -1) {
          this.activeSources.splice(idx, 1);
        }
        if (this.activeSources.length === 0 && this.status === 'speaking') {
          this.setStatus('connected');
        }
      };
    } catch (e) {
      console.error('[LiveClient] Error playing audio chunk:', e);
    }
  }

  /**
   * Stop all currently playing audio immediately upon interruption
   */
  public stopPlayback(): void {
    for (const src of this.activeSources) {
      try {
        src.stop();
        src.disconnect();
      } catch {}
    }
    this.activeSources = [];
    if (this.outputAudioCtx) {
      this.nextStartTime = this.outputAudioCtx.currentTime;
    }
    this.options.onAudioLevel?.(0, 0);
  }

  /**
   * Send a text message turn to the live session
   */
  public sendTextMessage(text: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
    this.ws.send(
      JSON.stringify({
        type: 'text',
        text: text,
      })
    );
    this.options.onTranscript?.({
      id: 'usr-txt-' + Date.now(),
      role: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });
  }

  /**
   * Toggle mute microphone input
   */
  public setMuted(muted: boolean): void {
    this.isMuted = muted;
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Set output speaker volume (0.0 to 1.0)
   */
  public setVolume(volume: number): void {
    if (this.gainNode) {
      this.gainNode.gain.value = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Convert Int16Array to Base64 string
   */
  private pcm16ToBase64(pcm16: Int16Array): string {
    const bytes = new Uint8Array(pcm16.buffer, pcm16.byteOffset, pcm16.byteLength);
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      const chunk = bytes.subarray(i, i + chunkSize);
      binary += String.fromCharCode.apply(null, chunk as any);
    }
    return btoa(binary);
  }

  /**
   * Clean up audio nodes and streams
   */
  private cleanupAudio(): void {
    this.stopPlayback();

    if (this.scriptProcessor) {
      try {
        this.scriptProcessor.disconnect();
      } catch {}
      this.scriptProcessor = null;
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    if (this.inputAudioCtx) {
      try {
        this.inputAudioCtx.close();
      } catch {}
      this.inputAudioCtx = null;
    }

    if (this.outputAudioCtx) {
      try {
        this.outputAudioCtx.close();
      } catch {}
      this.outputAudioCtx = null;
    }

    this.options.onAudioLevel?.(0, 0);
  }

  /**
   * Completely stop and close the session
   */
  public stop(): void {
    if (this.ws) {
      try {
        if (this.ws.readyState === WebSocket.OPEN) {
          this.ws.send(JSON.stringify({ type: 'end' }));
        }
        this.ws.close();
      } catch {}
      this.ws = null;
    }

    this.cleanupAudio();
    this.setStatus('closed');
  }
}
