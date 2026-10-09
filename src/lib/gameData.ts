export type CharacterId = 'emad' | 'zeina' | 'sherif'
export type GameId = 'coaster' | 'spin' | 'target'
export type GameResult = { won: boolean; score: number; message: string }

export const characters = [
  { id: 'emad' as const, name: 'عماد الجلمود', title: 'الجبل اللي بيتنفس', trait: 'ثبات عالي · رد فعل أبطأ', emoji: '🧔🏻‍♂️', color: 'mint', note: 'الدنيا بتتهز؟ عماد لأ.' },
  { id: 'zeina' as const, name: 'زينة الصاروخ', title: 'لحقت قبل ما تبدأ', trait: 'سريعة جداً · توازن أقل', emoji: '👩🏻‍🦱', color: 'pink', note: 'رمشتي أسرع من لعبتكم.' },
  { id: 'sherif' as const, name: 'الأسطى شريف', title: 'أعصابه في إجازة', trait: 'توتر عالي · حماس أعلى', emoji: '👨🏻‍🔧', color: 'blue', note: 'هو دايماً بيصرخ كده.' },
]

export const games = [
  { id: 'coaster' as const, letter: 'A', name: 'قطار الموت', subtitle: 'الكرسي سايب… اربط نفسك!', icon: '🎢', color: 'pink', status: 'خطر جداً', statusColor: 'red' },
  { id: 'spin' as const, letter: 'B', name: 'الديسكفري', subtitle: 'اثبت في النص ومترجعش!', icon: '🌀', color: 'blue', status: 'دوخة مضمونة', statusColor: 'blue' },
  { id: 'target' as const, letter: 'C', name: 'كشك النيشان', subtitle: 'اضرب الهدف… لو جه!', icon: '🎯', color: 'yellow', status: 'مغشوش رسمي', statusColor: 'orange' },
]

export const prizes = [
  { id: 'teddy', name: 'دبدوب من غير ودن', english: 'ONE-EARED TEDDY', price: 10, icon: '🧸', color: 'pink' },
  { id: 'shades', name: 'نظارة شمس مكسورة', english: 'BROKEN SHADES', price: 25, icon: '🕶️', color: 'blue' },
  { id: 'crown', name: 'تاج ملك الملاهي', english: 'PARK LEGEND CROWN', price: 50, icon: '👑', color: 'yellow' },
]
