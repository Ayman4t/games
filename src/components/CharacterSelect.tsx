import { motion } from 'framer-motion'
import { ArrowLeft, Check, Sparkles, Ticket } from 'lucide-react'
import { characters, type CharacterId } from '../lib/gameData'
import { sfx } from '../lib/sfx'

type Props = { onSelect: (id: CharacterId) => void; savedCharacter?: CharacterId }

export default function CharacterSelect({ onSelect, savedCharacter }: Props) {
  return <main className="select-screen" dir="rtl">
    <div className="select-sky"><i /><i /><i /><span className="sun-doodle">☀</span></div>
    <header className="landing-brand"><span className="brand-stamp">ملاهي<br/>البهدلة</span><span className="brand-english">PANIC<br/>PARK!</span></header>
    <div className="select-content">
      <motion.div className="intro-copy" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <span className="eyebrow"><Sparkles size={15}/> تذكرة واحدة. قرارات كتير غلط.</span>
        <h1>جاهز <span>تتبهدل؟</span></h1>
        <p>اختار صاحبك اللي هيزقك على اللعبة ويقولك «متخافش».</p>
      </motion.div>
      <div className="character-grid">
        {characters.map((person, index) => <motion.button
          className={`character-card char-${person.color} ${savedCharacter === person.id ? 'saved-character' : ''}`}
          key={person.id} onClick={() => { sfx.click(); onSelect(person.id) }}
          initial={{ opacity: 0, y: 22, rotate: index === 0 ? -2 : index === 1 ? 1 : 2 }}
          animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.12 + index * 0.1 }} whileHover={{ y: -8, rotate: 0 }} whileTap={{ scale: 0.97 }}
        >
          <span className="char-card-top"><span>{savedCharacter === person.id ? 'صاحبنا القديم' : 'اختارني!'}</span>{savedCharacter === person.id && <Check size={15}/>}</span>
          <span className="character-doodle"><span className="doodle-halo" />{person.emoji}<i className="doodle-star">✦</i></span>
          <span className="char-name">{person.name}</span>
          <span className="char-title">{person.title}</span>
          <span className="char-note">«{person.note}»</span>
          <span className="char-trait">{person.trait}</span>
          <span className="card-select"><ArrowLeft size={17} /> يلا بينا</span>
        </motion.button>)}
      </div>
      <div className="ticket-hint"><Ticket size={16}/><span>العب، اجمع تذاكر، واكسب جوائز ملهاش لازمة.</span></div>
    </div>
    <div className="landing-foot"><span>ممنوع دخول الناس العاقلة</span><span>باب ١٩٩٨ · ١٠٠٪ بهدلة</span></div>
  </main>
}
