import { AnimatePresence, motion } from 'framer-motion'
import { Check, LockKeyhole, X } from 'lucide-react'
import { prizes } from '../../lib/gameData'
import { sfx } from '../../lib/sfx'

type Props = { open: boolean; tickets: number; badges: string[]; onClose: () => void; onBuy: (id: string, cost: number) => void }

export default function PrizeModal({ open, tickets, badges, onClose, onBuy }: Props) {
  return <AnimatePresence>{open && <motion.div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
    <motion.section className="prize-modal" dir="rtl" role="dialog" aria-modal="true" aria-labelledby="prize-title" initial={{ y: 24, scale: 0.96 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, scale: 0.98 }}>
      <button className="modal-close" onClick={() => { sfx.click(); onClose() }} aria-label="إغلاق"><X size={20}/></button>
      <span className="prize-kicker">مكافآت لا تقدر بثمن (تقريباً)</span>
      <h2 id="prize-title">خيمة <span>الجوائز!</span></h2>
      <p className="prize-balance">رصيدك الحالي <strong>🎟 {tickets}</strong></p>
      <div className="prize-list">{prizes.map((prize, i) => {
        const owned = badges.includes(prize.id)
        const canBuy = tickets >= prize.price && !owned
        return <motion.article key={prize.id} className={`prize-row prize-${prize.color} ${owned ? 'prize-owned' : ''}`} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 * i }}>
          <span className="prize-art">{prize.icon}</span>
          <span className="prize-detail"><strong>{prize.name}</strong><small>{prize.english}</small><em>🎟 {prize.price}</em></span>
          <button className={`prize-buy ${owned ? 'is-owned' : ''}`} disabled={!canBuy} onClick={() => { sfx.ding(); onBuy(prize.id, prize.price) }}>
            {owned ? <><Check size={15}/> معاك</> : canBuy ? 'هاتها' : <><LockKeyhole size={13}/> ناقصك</>}
          </button>
        </motion.article>
      })}</div>
      <div className="prize-foot">جوائز رقمية فقط. الدباديب الحقيقية غليت.</div>
    </motion.section>
  </motion.div>}</AnimatePresence>
}
