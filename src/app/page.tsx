import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Home, RotateCcw, Ticket, Volume2, VolumeX, X } from 'lucide-react'
import CharacterSelect from '../components/CharacterSelect'
import ParkMap from '../components/ParkMap'
import CoasterGame from '../components/games/CoasterGame'
import SpinGame from '../components/games/SpinGame'
import TargetGame from '../components/games/TargetGame'
import TicketCounter from '../components/ui/TicketCounter'
import PrizeModal from '../components/ui/PrizeModal'
import { characters, games, type CharacterId, type GameId, type GameResult } from '../lib/gameData'
import { sfx } from '../lib/sfx'

type SavedProgress = { characterId?: CharacterId; tickets?: number; badges?: string[] }
function getProgress(): SavedProgress {
  try { return JSON.parse(localStorage.getItem('panic-park-progress') || '{}') as SavedProgress } catch { return {} }
}

export default function App() {
  const [saved] = useState(getProgress)
  const [characterId, setCharacterId] = useState<CharacterId | undefined>(saved.characterId)
  const [tickets, setTickets] = useState(saved.tickets ?? 0)
  const [badges, setBadges] = useState<string[]>(saved.badges ?? [])
  const [screen, setScreen] = useState<'select' | 'map' | 'game'>(saved.characterId ? 'map' : 'select')
  const [gameId, setGameId] = useState<GameId>('coaster')
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const [prizeOpen, setPrizeOpen] = useState(false)
  const [soundOn, setSoundOn] = useState(true)
  const [session, setSession] = useState(0)
  const activeCharacter = characterId ?? 'emad'
  const game = games.find(item => item.id === gameId)!
  const character = characters.find(item => item.id === activeCharacter)!

  useEffect(() => {
    try { localStorage.setItem('panic-park-progress', JSON.stringify({ characterId, tickets, badges })) } catch { /* storage may be disabled */ }
  }, [characterId, tickets, badges])

  useEffect(() => {
    const path = screen === 'map' ? '/map' : screen === 'game' ? `/game/${gameId}` : '/'
    if (window.location.pathname !== path) window.history.replaceState({ panicPark: true }, '', path)
  }, [screen, gameId])

  const selectCharacter = (id: CharacterId) => { setCharacterId(id); setScreen('map'); sfx.intro() }
  const startGame = (id: GameId) => { setGameId(id); setGameResult(null); setSession(value => value + 1); setScreen('game') }
  const finishGame = (result: GameResult) => {
    setGameResult(result)
    if (result.won) setTickets(value => value + 5)
  }
  const buyPrize = (id: string, cost: number) => {
    if (tickets < cost || badges.includes(id)) return
    setTickets(value => value - cost)
    setBadges(value => [...value, id])
  }
  const toggleSound = () => { setSoundOn(value => { sfx.setMuted(!value); return !value }); sfx.click() }

  return <div className="app-shell" dir="rtl">
    {screen !== 'select' && <header className="app-header">
      <button className="header-brand" onClick={() => { sfx.click(); setScreen('map'); setGameResult(null) }} aria-label="العودة للخريطة">
        <span className="mini-brand">ب!</span><span><strong>ملاهي البهدلة</strong><small>PANIC PARK</small></span>
      </button>
      <div className="header-actions">
        {screen === 'game' && <button className="header-back" onClick={() => { sfx.click(); setGameResult(null); setScreen('map') }}><ArrowRight size={17}/><span>للخريطة</span></button>}
        <button className="sound-toggle" onClick={toggleSound} aria-label={soundOn ? 'كتم الصوت' : 'تشغيل الصوت'}>{soundOn ? <Volume2 size={18}/> : <VolumeX size={18}/>}</button>
        <TicketCounter count={tickets} onClick={() => { sfx.click(); setPrizeOpen(true) }} compact={screen === 'game'}/>
      </div>
    </header>}

    <AnimatePresence mode="wait">
      {screen === 'select' && <motion.div key="select" className="screen-holder" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -10 }}><CharacterSelect savedCharacter={characterId} onSelect={selectCharacter}/></motion.div>}
      {screen === 'map' && <motion.div key="map" className="screen-holder" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}><ParkMap characterId={activeCharacter} onPlay={startGame} onCharacter={() => setScreen('select')}/></motion.div>}
      {screen === 'game' && <motion.main key={`game-${session}`} className="game-screen" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
        <section className="game-heading">
          <div><span className="game-kicker"><span className="game-live"/> اللعبة شغالة · مفيش استرجاع</span><h1>{game.icon} {game.name}</h1><p>{game.subtitle}</p></div>
          <div className="game-player-pill"><span>{character.emoji}</span><span><small>المغامر</small><strong>{character.name}</strong></span></div>
        </section>
        <div className={`game-frame game-frame-${gameId}`}>
          <div className="frame-topline"><span>الجولة {session} <i>·</i> ٢٠ ثانية من التهور</span><span className="frame-sticker">{gameId === 'coaster' ? 'اربط واهرب' : gameId === 'spin' ? 'التوازن يا معلم' : 'صوّب يا حبيبي'}</span></div>
          {gameId === 'coaster' && <CoasterGame key={`coaster-${session}`} characterId={activeCharacter} onFinish={finishGame}/>}
          {gameId === 'spin' && <SpinGame key={`spin-${session}`} characterId={activeCharacter} onFinish={finishGame}/>}
          {gameId === 'target' && <TargetGame key={`target-${session}`} characterId={activeCharacter} onFinish={finishGame}/>}
          <div className="frame-footer"><span>⚠️ اللعبة مش معتمدة من أي جهة مسؤولة</span><span>حظ سعيد… هتحتاجه.</span></div>
        </div>
        <button className="leave-game" onClick={() => { sfx.click(); setGameResult(null); setScreen('map') }}><Home size={16}/> كفاية بهدلة، رجّعني الخريطة</button>
      </motion.main>}
    </AnimatePresence>

    <AnimatePresence>{gameResult && <motion.div className="modal-backdrop result-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <motion.section className={`result-modal ${gameResult.won ? 'result-win' : 'result-loss'}`} dir="rtl" role="dialog" aria-modal="true" aria-labelledby="result-title" initial={{ y: 28, scale: 0.9, rotate: 1 }} animate={{ y: 0, scale: 1, rotate: 0 }}>
        <button className="modal-close" onClick={() => setGameResult(null)} aria-label="إغلاق"><X size={20}/></button>
        {gameResult.won && <div className="confetti" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} style={{ left: `${(i * 37) % 100}%`, animationDelay: `${(i % 6) * 0.12}s`, background: ['#ff4f83', '#ffcf42', '#5fcb9c', '#5583ec'][i % 4] }}/>)}</div>}
        <span className="result-face">{gameResult.won ? '🎉' : gameId === 'coaster' ? '🪽' : gameId === 'spin' ? '🤢' : '🤡'}</span>
        <span className="result-kicker">{gameResult.won ? 'معجزة حصلت جوه الملاهي' : 'الموظف قالك قولنا من الأول'}</span>
        <h2 id="result-title">{gameResult.won ? 'عَدّت على خير!' : 'يا خسارة يا بطل!'}</h2>
        <p>{gameResult.message}</p>
        {gameResult.won ? <div className="ticket-reward"><Ticket size={22}/><span>تذاكر جديدة في جيبك</span><strong>+٥</strong></div> : <div className="result-score">نتيجتك <strong>{gameResult.score}</strong></div>}
        <div className="result-actions">
          {gameResult.won && <button className="primary-action" onClick={() => startGame(gameId)}><RotateCcw size={17}/> تاني تاني!</button>}
          {!gameResult.won && <button className="primary-action" onClick={() => startGame(gameId)}><RotateCcw size={17}/> محاولة كمان</button>}
          <button className="secondary-action" onClick={() => { setGameResult(null); setScreen('map') }}><Home size={17}/> للخريطة</button>
        </div>
        <span className="result-disclaimer">مفيش حد اتأذى بجد… غالباً</span>
      </motion.section>
    </motion.div>}</AnimatePresence>

    <PrizeModal open={prizeOpen} tickets={tickets} badges={badges} onClose={() => setPrizeOpen(false)} onBuy={buyPrize}/>
    {screen !== 'select' && <footer className="site-foot"><span>ملاهي البهدلة © ١٩٩٨–٢٠٢٦</span><span>مصنوع بفرحة مريبة وميزانية أقل من كده</span></footer>}
  </div>
}
