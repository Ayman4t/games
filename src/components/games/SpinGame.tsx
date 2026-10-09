import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock3, MoveHorizontal } from 'lucide-react'
import { type CharacterId, type GameResult } from '../../lib/gameData'
import { sfx } from '../../lib/sfx'

type Props = { characterId: CharacterId; onFinish: (result: GameResult) => void }
const balanceProfile: Record<CharacterId, { wobble: number; recover: number }> = {
  emad: { wobble: 0.54, recover: 1.18 }, zeina: { wobble: 1.28, recover: 0.78 }, sherif: { wobble: 0.88, recover: 0.96 },
}

export default function SpinGame({ characterId, onFinish }: Props) {
  const [remaining, setRemaining] = useState(20)
  const [position, setPosition] = useState(50)
  const [stress, setStress] = useState(0)
  const [tip, setTip] = useState('القرص بدأ يلف… ركّز في النص!')
  const positionRef = useRef(50)
  const velocityRef = useRef(0)
  const stressRef = useRef(0)
  const forceRef = useRef(0)
  const doneRef = useRef(false)
  const onFinishRef = useRef(onFinish)
  onFinishRef.current = onFinish
  const profile = balanceProfile[characterId]

  useEffect(() => {
    const interval = window.setInterval(() => {
      setRemaining(time => {
        if (time <= 1) {
          window.clearInterval(interval); window.clearInterval(physics)
          if (!doneRef.current) { doneRef.current = true; sfx.win(); onFinishRef.current({ won: true, score: Math.max(0, 100 - stressRef.current), message: 'فضلت متوازن لحد ما اللعبة وقفت… دوخت؟' }) }
          return 0
        }
        return time - 1
      })
    }, 1000)
    const physics = window.setInterval(() => {
      const position = positionRef.current
      const sway = (Math.random() - 0.5) * 0.62 * profile.wobble
      const velocity = velocityRef.current * 0.91 + sway + forceRef.current * 0.4 * profile.recover
      velocityRef.current = Math.max(-2.5, Math.min(2.5, velocity))
      const next = Math.max(2, Math.min(98, position + velocity))
      positionRef.current = next
      setPosition(next)
      if (next < 28 || next > 72) {
        stressRef.current = Math.min(100, stressRef.current + 1.25)
        setStress(stressRef.current)
        setTip(stressRef.current > 70 ? 'يا ساتر! القرص مش بيرحم!' : 'بتطلع برّه النص… ظبّط توازنك!')
      } else {
        stressRef.current = Math.max(0, stressRef.current - 0.6)
        setStress(stressRef.current)
        setTip('برافو عليك… خليك في المنطقة الخضرا!')
      }
      if (stressRef.current >= 100 && !doneRef.current) {
        doneRef.current = true; window.clearInterval(interval); window.clearInterval(physics); sfx.fail()
        onFinishRef.current({ won: false, score: 0, message: 'الديسكفري رماك على عربية غزل البنات!' })
      }
    }, 80)
    return () => { window.clearInterval(interval); window.clearInterval(physics) }
  }, [profile])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') { event.preventDefault(); forceRef.current = -1 }
      if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') { event.preventDefault(); forceRef.current = 1 }
    }
    const onKeyUp = (event: KeyboardEvent) => {
      if (['arrowleft', 'arrowright', 'a', 'd'].includes(event.key.toLowerCase())) forceRef.current = 0
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => { window.removeEventListener('keydown', onKeyDown); window.removeEventListener('keyup', onKeyUp) }
  }, [])

  const hold = (direction: -1 | 1) => { forceRef.current = direction; sfx.click() }
  const release = () => { forceRef.current = 0 }

  return <div className="game-play-area spin-game">
    <div className="game-arena spin-arena">
      <div className="spin-stars" aria-hidden="true">✦　　　✧　　　　 ✦　　　　✧</div>
      <div className="spin-hud"><span><Clock3 size={16}/> 00:{String(remaining).padStart(2, '0')}</span><span>تماسكك <b>{Math.round(100 - stress)}%</b></span></div>
      <motion.div className="spin-platform" animate={{ rotate: [0, 8, -7, 4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}>
        <div className="spin-outer"><div className="spin-inner">🌀<span className="spin-rider">{characterId === 'zeina' ? '👩🏻‍🦱' : characterId === 'sherif' ? '👨🏻‍🔧' : '🧔🏻‍♂️'}</span></div></div>
      </motion.div>
      <div className="balance-meter"><div className="safe-zone"/><motion.div className="balance-dot" animate={{ left: `${position}%` }} transition={{ duration: 0.12 }}/></div>
      <div className="stress-track"><span>درجة الدوخة</span><div><i style={{ width: `${stress}%` }}/></div><span>{Math.round(stress)}%</span></div>
      <motion.div className="spin-tip" key={tip} initial={{ opacity: 0.5, y: 4 }} animate={{ opacity: 1, y: 0 }}>{tip}</motion.div>
    </div>
    <div className="game-controls spin-controls">
      <span className="control-label"><MoveHorizontal size={17}/> دوس على الناحية العكسية عشان توازن نفسك</span>
      <div className="direction-buttons">
        <button onPointerDown={() => hold(-1)} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} className="balance-button">← <span>شمال</span></button>
        <button onPointerDown={() => hold(1)} onPointerUp={release} onPointerLeave={release} onPointerCancel={release} className="balance-button">يمين <span>→</span></button>
      </div>
    </div>
  </div>
}
