class MgbaSink extends AudioWorkletProcessor {
  constructor() {
    super();
    this.cap = 32768; // source frames
    this.buf = new Float32Array(this.cap * 2);
    this.pos = 0; // fractional read cursor, in source frames
    this.w = 0;   // source frames written
    this.ratio = 1;
    this.lastPost = 0;
    this.port.onmessage = (e) => {
      const msg = e.data;
      if (msg && msg.rate) {
        this.ratio = msg.rate / sampleRate;
        return;
      }
      const s = msg; // Int16Array, interleaved stereo
      const frames = s.length >> 1;
      for (let i = 0; i < frames; i++) {
        if (this.w - this.pos >= this.cap) break; // full: drop excess
        const idx = (this.w % this.cap) * 2;
        this.buf[idx] = s[i * 2] / 32768;
        this.buf[idx + 1] = s[i * 2 + 1] / 32768;
        this.w++;
      }
    };
  }
  process(inputs, outputs) {
    const out = outputs[0];
    const L = out[0];
    const R = out[1] || out[0];
    const n = L.length;
    for (let i = 0; i < n; i++) {
      // One source frame must be left past the cursor to interpolate against.
      if (this.pos + 1 < this.w) {
        const base = Math.floor(this.pos);
        const frac = this.pos - base;
        const a = (base % this.cap) * 2;
        const b = ((base + 1) % this.cap) * 2;
        L[i] = this.buf[a] + (this.buf[b] - this.buf[a]) * frac;
        R[i] = this.buf[a + 1] + (this.buf[b + 1] - this.buf[a + 1]) * frac;
        this.pos += this.ratio;
      } else {
        L[i] = 0;
        R[i] = 0;
      }
    }
    const consumed = Math.floor(this.pos);
    if (consumed - this.lastPost >= 1024) {
      this.port.postMessage(consumed);
      this.lastPost = consumed;
    }
    return true;
  }
}
registerProcessor('mgba-sink', MgbaSink);
