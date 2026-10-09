import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Clock3, Crosshair, Star } from 'lucide-react'
import { type CharacterId, type GameResult } from '../../lib/gameData'
import { sfx } from '../../lib/sfx'

type Props = { characterId: CharacterId; onFinish: (result: GameResult) => void }
const goal = 12

export default function TargetGame({ characterId, onFinish }: Props) {
  const [remaining, setRemaining] = useState(20)
  const [hits, setHits] = useState(0)
  const [target, setTarget] = useState({ x: 50, y: 50, turn: 0 })
  const [message, setMessage] = useState('الهدف بيظهر ويختفي… صوّب بسرعة!')
  const doneRef = useRef(false)
  const hitsRef = useRef(0)
  const finishRef = useRef(onFinish)
  finishRef.current = onFinish
  const targetInterval = characterId === 'emad' ? 1150 : characterId === 'zeina' ? 780 : 880
  const moveTarget = () => setTarget({ x: 10 + Math.random() * 80, y: 12 + Math.random() * 76, turn: Math.random() * 20 - 10 })

  useEffect(() => {
    const movement = window.setInterval(moveTarget, targetInterval)
    const timer = window.setInterval(() => setRemaining(time => {
      if (time <= 1) {
        window.clearInterval(timer); window.clearInterval(movement)
        if (!doneRef.current) {
          doneRef.current = true
          const won = hitsRef.current >= goal
          won ? sfx.win() : sfx.fail()
          finishRef.current({ won, score: hitsRef.current, message: won ? 'تصويب جامد… الكشك نفسه اتخض!' : 'النيشان مغشوش وأنت كمان محتاج تتمرن!' })
        }
        return 0
      }
      return time - 1
    }), 1000)
    return () => { window.clearInterval(movement); window.clearInterval(timer) }
  }, [targetInterval])

  const hitTarget = () => {
    if (doneRef.current) return
    hitsRef.current += 1
    const next = hitsRef.current
    setHits(next)
    setMessage(['إصابة في الصميم! 🎯', 'الموظف مش مصدّق اللي شايفه!', 'نيشان نيشان… على قد فلوسك!'][Math.floor(Math.random() * 3)])
    sfx.hit(); moveTarget()
    if (next % 4 === 0) sfx.ding()
  }

  return <div className="game-play-area target-game">
    <div className="game-arena target-arena">
      <div className="target-backdrop"><span>100</span><span>50</span><span>10</span><span>100</span><span>50</span><span>10</span></div>
      <div className="target-hud"><span><Clock3 size={16}/> 00:{String(remaining).padStart(2, '0')}</span><span>إصاباتك <b>{hits} / {goal}</b></span></div>
      <div className="target-sign">كشك النيشان <small>اللي يصيب ياخد… غالباً</small></div>
      <motion.button className="pop-target" key={target.turn + target.x} onClick={hitTarget} style={{ left: `${target.x}%`, top: `${target.y}%` }} initial={{ scale: 0, rotate: target.turn }} animate={{ scale: 1, rotate: target.turn }} exit={{ scale: 0 }} transition={{ type: 'spring', stiffness: 500, damping: 17 }} aria-label="صوّب على الهدف">
        <span className="target-rings"><i><i><i><b/></i></i></i></span><Star className="target-star" size={15} fill="currentColor"/><Crosshair className="target-crosshair" size={16}/>
      </motion.button>
      <motion.div className="target-message" key={message} initial={{ opacity: 0, y: 7 }} animate={{ opacity: 1, y: 0 }}>{message}</motion.div>
      <div className="target-employee">🧑🏻‍💼 <span>«عارف إنك مش هتكسب»</span></div>
    </div>
    <div className="game-controls target-controls"><p>إصابة الهدف <strong>{goal - hits > 0 ? goal - hits : 0}</strong> مرة قبل ما الوقت يخلص.</p><span>الهدف بيتحرك عشان هو كمان متوتر</span></div>
  </div>
}
