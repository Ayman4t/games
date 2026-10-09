import { motion } from 'framer-motion'
import { Ticket } from 'lucide-react'

type Props = { count: number; onClick: () => void; compact?: boolean }

export default function TicketCounter({ count, onClick, compact = false }: Props) {
  return <motion.button className={`ticket-counter ${compact ? 'counter-compact' : ''}`} onClick={onClick} whileTap={{ scale: 0.94 }} aria-label={`رصيدك ${count} تذكرة. افتح خيمة الجوائز`}>
    <span className="ticket-icon"><Ticket size={19} strokeWidth={2.8}/></span>
    <span className="ticket-label">تذاكرك</span>
    <motion.strong key={count} initial={{ scale: 1.35, rotate: -5 }} animate={{ scale: 1, rotate: 0 }}>{count}</motion.strong>
    <span className="ticket-tail">تذكرة</span>
  </motion.button>
}
