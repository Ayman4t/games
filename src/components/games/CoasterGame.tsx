import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, ArrowRight, Clock3, Sparkles } from 'lucide-react'
import { type CharacterId, type GameResult } from '../../lib/gameData'
import { sfx } from '../../lib/sfx'

type Props = { characterId: CharacterId; onFinish: (result: GameResult) => void }
const rider: Record<CharacterId, string> = { emad: '🧔🏻‍♂️', zeina: '👩🏻‍🦱', sherif: '👨🏻‍🔧' }
const reflex: Record<CharacterId, number> = { emad: 410, zeina: 450, sherif: 340 }

function drawTrack(canvas: HTMLCanvasElement, emoji: string, now: number) {
  const parent = canvas.parentElement
  const width = parent?.clientWidth ?? 700
  const height = parent?.clientHeight ?? 320
  const ratio = Math.min(window.devicePixelRatio || 1, 2)
  if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
    canvas.width = width * ratio; canvas.height = height * ratio
  }
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
  const w = width, h = height
  const bg = ctx.createLinearGradient(0, 0, w, h)
  bg.addColorStop(0, '#f6dfff'); bg.addColorStop(0.55, '#ffc6cd'); bg.addColorStop(1, '#ffb98a')
  ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h)
  for (let i = 0; i < 14; i++) {
    const x = (i * 97 + 21) % w, y = ((i * 61 + now * 0.06) % (h + 36)) - 18
    ctx.strokeStyle = i % 2 ? '#ffffff70' : '#ff5a8370'; ctx.lineWidth = i % 3 ? 3 : 5
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 11, y + 21); ctx.stroke()
  }
  const mid = w / 2
  for (const side of [-1, 1]) {
    const railX = (y: number) => mid + side * (w * 0.24 + 38 * Math.sin(y * 0.009 + now * 0.0018))
    ctx.beginPath()
    for (let y = -30; y <= h + 30; y += 5) {
      const x = railX(y)
      if (y === -30) ctx.moveTo(x, y); else ctx.lineTo(x, y)
    }
    ctx.strokeStyle = '#fff8ed'; ctx.lineWidth = 16; ctx.lineCap = 'round'; ctx.stroke()
    ctx.strokeStyle = '#24202a'; ctx.lineWidth = 7; ctx.stroke()
  }
  const offset = (now * 0.48) % 48
  for (let y = offset - 45; y < h + 50; y += 48) {
    const left = mid - w * 0.25 + 38 * Math.sin(y * 0.009 + now * 0.0018)
    const right = mid + w * 0.25 + 38 * Math.sin(y * 0.009 + now * 0.0018)
    ctx.beginPath(); ctx.moveTo(left, y); ctx.lineTo(right, y)
    ctx.strokeStyle = '#29232c'; ctx.lineWidth = 6; ctx.stroke()
    ctx.beginPath(); ctx.moveTo(left, y - 3); ctx.lineTo(right, y - 3); ctx.strokeStyle = '#ffffff99'; ctx.lineWidth = 1.5; ctx.stroke()
  }
  // Little coaster car and very worried passenger.
  const carX = mid - Math.min(w * 0.22, 138), carY = h * 0.59
  ctx.save(); ctx.translate(carX, carY)
  ctx.fillStyle = '#271d2c'; ctx.beginPath(); ctx.roundRect(-79, 7, 158, 84, 24); ctx.fill()
  ctx.fillStyle = '#ffdc59'; ctx.beginPath(); ctx.roundRect(-70, 0, 140, 74, 23); ctx.fill()
  ctx.fillStyle = '#f44978'; ctx.beginPath(); ctx.roundRect(-60, 31, 120, 50, 18); ctx.fill()
  ctx.font = '56px "Apple Color Emoji", "Segoe UI Emoji", sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(emoji, 0, 31)
  ctx.restore()
}

export default function CoasterGame({ characterId, onFinish }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const dangerRef = useRef(false)
  const doneRef = useRef(false)
  const scoreRef = useRef(0)
  const finishRef = useRef(onFinish)
  const deadlineRef = useRef<number | undefined>(undefined)
  const triggerRef = useRef<number | undefined>(undefined)
  const scheduleCueRef = useRef<() => void>(() => {})
  finishRef.current = onFinish
  const [remaining, setRemaining] = useState(20)
  const [score, setScore] = useState(0)
  const [danger, setDanger] = useState(false)
  const [lastSave, setLastSave] = useState(false)
  const reactionWindow = reflex[characterId]

  const finish = useCallback((won: boolean, message: string) => {
    if (doneRef.current) return
    doneRef.current = true
    dangerRef.current = false
    finishRef.current({ won, score: scoreRef.current, message })
  }, [])

  useEffect(() => {
    let cancelled = false
    const scheduleCue = () => {
      if (cancelled || doneRef.current) return
      triggerRef.current = window.setTimeout(() => {
        if (cancelled || doneRef.current) return
        dangerRef.current = true
        setDanger(true)
        sfx.alarm()
        deadlineRef.current = window.setTimeout(() => {
          if (!cancelled && dangerRef.current) { sfx.fail(); finish(false, 'السيارة كملت… وإنت لأ!') }
        }, reactionWindow)
      }, 2000 + Math.random() * 2000)
    }
    scheduleCueRef.current = scheduleCue
    scheduleCue()
    const interval = window.setInterval(() => setRemaining(value => {
      if (value <= 1) { window.clearInterval(interval); sfx.win(); finish(true, 'ربطت نفسك وعدّيت من غير ما تطير!'); return 0 }
      return value - 1
    }), 1000)
    return () => { cancelled = true; window.clearTimeout(triggerRef.current); window.clearTimeout(deadlineRef.current); window.clearInterval(interval) }
  }, [finish, reactionWindow])

  useEffect(() => {
    let frame = 0
    const paint = (time: number) => { if (canvasRef.current) drawTrack(canvasRef.current, rider[characterId], time); frame = window.requestAnimationFrame(paint) }
    frame = window.requestAnimationFrame(paint)
    return () => window.cancelAnimationFrame(frame)
  }, [characterId])

  const buckle = () => {
    if (!dangerRef.current || doneRef.current) { sfx.click(); return }
    dangerRef.current = false
    setDanger(false)
    window.clearTimeout(deadlineRef.current)
    window.setTimeout(() => setLastSave(false), 650)
    setLastSave(true)
    scoreRef.current += 1
    setScore(scoreRef.current)
    sfx.buckle(); sfx.sigh()
    scheduleCueRef.current()
  }
  return <div className="game-play-area coaster-game">
    <div className="game-arena coaster-arena">
      <canvas ref={canvasRef} className="coaster-canvas" aria-hidden="true" />
      <div className="coaster-hud"><span><Clock3 size={16}/> 00:{String(remaining).padStart(2, '0')}</span><span>إنقاذاتك <b>{score}</b></span></div>
      <motion.div className="coaster-warning" animate={{ opacity: danger ? 1 : 0, scale: danger ? 1 : 0.9, y: danger ? 0 : 8 }}>
        <AlertTriangle size={18} fill="currentColor"/><span>الحزام فَكّ! اقفله بسرعة!</span><b>{reactionWindow} ms</b>
      </motion.div>
      {lastSave && <motion.div className="coaster-sigh" initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: -5 }}><Sparkles size={15}/> الحمد لله… عِدّت!</motion.div>}
      <div className="coaster-ride-label">كراسي بتتهز <span>·</span> ضحك هستيري</div>
    </div>
    <div className="game-controls coaster-controls">
      <button className={`buckle-button ${danger ? 'buckle-alert' : ''}`} onClick={buckle} aria-live="assertive">
        <span className="buckle-emoji">{danger ? '🚨' : '🔒'}</span><span><strong>{danger ? 'اقفل الحزام!' : 'استعد للحزام'}</strong><small>{danger ? 'دوس دلوقتي!!' : 'فَكّته ممكن ييجي في أي لحظة'}</small></span><ArrowRight size={22}/>
      </button>
      <p className="game-tip">الحزام بيتفك فجأة. معاك <b>{reactionWindow} جزء من الثانية</b> ترجع تربطه.</p>
    </div>
  </div>
}
