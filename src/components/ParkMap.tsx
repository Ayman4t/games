import { motion } from 'framer-motion'
import { ArrowDown, ArrowLeft, ArrowUpLeft, Volume2 } from 'lucide-react'
import { games, type CharacterId, type GameId } from '../lib/gameData'
import { sfx } from '../lib/sfx'

type Props = { characterId: CharacterId; onPlay: (game: GameId) => void; onCharacter: () => void }
const personNames: Record<CharacterId, string> = { emad: 'عماد الجلمود', zeina: 'زينة الصاروخ', sherif: 'الأسطى شريف' }
const peopleEmoji: Record<CharacterId, string> = { emad: '🧔🏻‍♂️', zeina: '👩🏻‍🦱', sherif: '👨🏻‍🔧' }

export default function ParkMap({ characterId, onPlay, onCharacter }: Props) {
  return <section className="map-screen" dir="rtl">
    <div className="map-heading"><div><span className="eyebrow"><span className="live-dot"/> فاتحين لحد ما الميزانية تخلص</span><h1>أهلاً بيك <span>في البهدلة!</span></h1><p>اختار لعبة… وخلي الباقي على ربنا.</p></div><div className="map-weather" aria-hidden="true"><span>☀</span><i>عاملين حسابنا على صريخ!</i></div></div>
    <div className="park-landscape">
      <div className="landscape-sky"><span className="cloud cloud-a">☁</span><span className="cloud cloud-b">☁</span><span className="landscape-sun">☀</span><span className="balloon">🎈</span></div>
      <div className="pennant pennant-one"><i>♦</i><i>◆</i><i>♦</i><i>◆</i><i>♦</i><i>◆</i><i>♦</i></div>
      <div className="booth-grid">
        {games.map((game, i) => <motion.button key={game.id} className={`booth booth-${game.color}`} onClick={() => { sfx.click(); onPlay(game.id) }} initial={{ opacity: 0, y: 20, rotate: i === 0 ? -1 : i === 2 ? 1 : 0 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + i * 0.12 }} whileHover={{ y: -9, rotate: 0 }} whileTap={{ scale: 0.97 }}>
          <span className="booth-sign"><span>ركن {game.letter}</span><span className={`booth-status status-${game.statusColor}`}>{game.status}</span></span>
          <span className="booth-awning"><i/><i/><i/><i/><i/></span>
          <span className="booth-icon-wrap"><span className="booth-icon">{game.icon}</span><span className="booth-spark">✦</span></span>
          <span className="booth-name">{game.name}</span>
          <span className="booth-copy">{game.subtitle}</span>
          <span className="booth-enter">ادخل يا بطل <ArrowLeft size={15}/></span>
        </motion.button>)}
      </div>
      <div className="park-path"><span>دوس على الركن اللي هيندمك!</span><ArrowDown size={17}/><span>بوابة الخروج لسه مقفولة</span></div>
      <div className="pennant pennant-two"><i>◆</i><i>♦</i><i>◆</i><i>♦</i><i>◆</i><i>♦</i><i>◆</i></div>
    </div>
    <footer className="map-footer"><button className="character-chip" onClick={() => { sfx.click(); onCharacter() }}><span>{peopleEmoji[characterId]}</span><span><small>معاك النهارده</small><strong>{personNames[characterId]}</strong></span><ArrowUpLeft size={16}/></button><p><Volume2 size={15}/> الصوت بيشتغل مع أول دوسة · لبس الحزام مش مسؤوليتنا</p><span className="map-stamp">PARK OPEN!<br/>EST. 1998</span></footer>
  </section>
}
