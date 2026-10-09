let audio: AudioContext | null = null
let muted = false

function context() {
  if (typeof window === 'undefined') return null
  const AudioCtor = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AudioCtor) return null
  audio ??= new AudioCtor()
  if (audio.state === 'suspended') void audio.resume()
  return audio
}

function tone(frequency: number, duration: number, type: OscillatorType = 'sine', volume = 0.08, endFrequency = frequency, delay = 0) {
  if (muted) return
  const ctx = context()
  if (!ctx) return
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  const start = ctx.currentTime + delay
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, start)
  oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endFrequency), start + duration)
  gain.gain.setValueAtTime(0.0001, start)
  gain.gain.exponentialRampToValueAtTime(volume, start + Math.min(0.018, duration / 4))
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(start)
  oscillator.stop(start + duration + 0.02)
}

export const sfx = {
  setMuted: (value: boolean) => { muted = value },
  click: () => tone(520, 0.055, 'square', 0.035, 370),
  intro: () => [523.25, 659.25, 783.99, 1046.5].forEach((n, i) => tone(n, 0.19, 'triangle', 0.045, n * 1.01, i * 0.13)),
  alarm: () => { tone(940, 0.16, 'square', 0.075, 660); tone(940, 0.16, 'square', 0.075, 660, 0.2) },
  buckle: () => { tone(220, 0.07, 'square', 0.075, 160); tone(720, 0.12, 'sine', 0.055, 960, 0.065) },
  fail: () => { tone(250, 0.56, 'sawtooth', 0.065, 65); tone(180, 0.5, 'square', 0.035, 60, 0.1) },
  win: () => [659.25, 783.99, 987.77, 1318.5].forEach((n, i) => tone(n, 0.28, 'sine', 0.075, n * 1.025, i * 0.105)),
  ding: () => { tone(880, 0.25, 'sine', 0.06, 1120); tone(1320, 0.24, 'sine', 0.035, 1510, 0.055) },
  sigh: () => tone(310, 0.48, 'sine', 0.045, 180),
  hit: () => tone(610, 0.075, 'triangle', 0.055, 970),
}
