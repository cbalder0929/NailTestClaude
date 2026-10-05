/**
 * ──────────────────────────────────────────────────────────────────────────
 *  SALON CONFIG — the ONE file you edit to re-brand this site for a prospect.
 *  Every piece of salon-specific text, price, image, colour and rule lives here.
 *  Components only read from this file; nothing salon-specific is hardcoded.
 * ──────────────────────────────────────────────────────────────────────────
 */

const U = 'https://images.unsplash.com/photo-'

export type ServiceCategory = 'Manicures' | 'Acrylic' | 'Gel / Gel-X' | 'Pedicures' | 'Nail Art'
export type GalleryCategory = 'Acrylic' | 'Gel-X' | 'French' | 'Nail Art' | 'Pedicure'
export type DayHours = { open: string; close: string } | null // "HH:MM" 24h, null = closed

export interface Service {
  id: string
  name: string
  category: ServiceCategory
  description: string
  price: number
  /** show "from $X" on cards */
  from?: boolean
  duration: number // minutes
  popular?: boolean
}
export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  from?: boolean
  duration: number // extra minutes
}
export interface Technician {
  id: string
  name: string
  title: string
  photo: string
  specialties: string[]
  rating: number
  reviews: number
  /** 0 = Sunday … 6 = Saturday */
  workingDays: number[]
  /** which service categories this artist typically takes (drives the demo schedule) */
  serviceCategories: ServiceCategory[]
  bio: string
}
export interface GalleryImage {
  id: string
  src: string
  alt: string
  category: GalleryCategory
  /** fixed aspect ratio so the masonry never jumps */
  aspect: '1/1' | '4/5' | '3/4' | '5/4'
}
export interface Review {
  id: string
  name: string
  date: string // ISO
  service: string
  stars: number
  text: string
}

export const salon = {
  /* ── Identity ─────────────────────────────────────────────────────────── */
  name: 'Rosé Nail Atelier',
  shortName: 'Rosé',
  tagline: 'Boutique nail care in Bucktown',
  valueProp: 'Hand-finished nails, spa-quiet rooms, and a booking process that takes under a minute.',
  bookingPrefix: 'RNA',

  address: {
    street: '1847 N Damen Ave',
    city: 'Chicago',
    state: 'IL',
    zip: '60647',
    neighborhood: 'Bucktown',
    note: 'Street parking on Damen · 2 min from the Damen Blue Line',
  },
  phone: '(773) 555-0148',
  email: 'hello@rosenailatelier.com',
  social: {
    instagram: 'https://www.instagram.com/rosenailatelier',
    tiktok: 'https://www.tiktok.com/@rosenailatelier',
    facebook: 'https://www.facebook.com/rosenailatelier',
  },

  /** 0 = Sunday … 6 = Saturday */
  hours: {
    0: { open: '10:00', close: '17:00' },
    1: null,
    2: { open: '10:00', close: '20:00' },
    3: { open: '10:00', close: '20:00' },
    4: { open: '10:00', close: '20:00' },
    5: { open: '10:00', close: '20:00' },
    6: { open: '09:00', close: '19:00' },
  } as Record<number, DayHours>,

  /* ── Brand colours (applied as CSS variables at startup) ──────────────── */
  colors: {
    rose: '#E8A0B4', // primary
    roseDeep: '#C2185B', // CTAs
    blush: '#FBE4EA',
    cream: '#FFF8F3',
    gold: '#C9A96E', // sparingly: dividers, stars, icons
    ink: '#2B1F24', // text
  },

  /* ── Booking rules ────────────────────────────────────────────────────── */
  deposit: { percent: 20, minimum: 15 },
  slotIntervalMinutes: 15,
  /** hide slots starting sooner than this many minutes from now (today only) */
  leadTimeMinutes: 60,
  bookingWindowDays: 14,
  cancellationPolicy:
    'Free cancellation or rescheduling up to 24 hours before your appointment. Later changes forfeit the deposit.',
  /** demo dashboard assumption: calls/texts a single booking normally costs the front desk */
  callsPerBooking: 1.6,

  /* ── Images (direct images.unsplash.com URLs; width/quality added by code) ─ */
  images: {
    hero: `${U}1632345031435-8727f6897d53`,
  },

  /* ── Why choose us ────────────────────────────────────────────────────── */
  why: [
    {
      icon: 'shield',
      title: 'Hospital-grade hygiene',
      text: 'Every metal tool is autoclave-sterilized and sealed. Pedicure basins are disinfected between guests.',
    },
    {
      icon: 'hand',
      title: 'Expert technicians',
      text: 'Licensed artists with 8+ years each, specializing in sculpting, Gel-X, spa care and hand-painted art.',
    },
    {
      icon: 'gem',
      title: 'Premium products',
      text: 'Non-toxic, 10-free polishes and soft-gel systems chosen for strength, shine and nail health.',
    },
    {
      icon: 'calendar',
      title: 'Effortless online booking',
      text: 'See real openings, pick your artist, and secure your spot with a small deposit in under a minute.',
    },
  ] as { icon: 'shield' | 'hand' | 'gem' | 'calendar'; title: string; text: string }[],

  /* ── Services ─────────────────────────────────────────────────────────── */
  featuredServiceIds: ['gel-manicure', 'gelx-full', 'acrylic-full', 'deluxe-pedicure'],
  services: [
    {
      id: 'classic-manicure',
      name: 'Classic Manicure',
      category: 'Manicures',
      description: 'Shape, cuticle care, gentle exfoliation, hydrating massage and a polish of your choice.',
      price: 35,
      duration: 30,
    },
    {
      id: 'gel-manicure',
      name: 'Gel Manicure',
      category: 'Manicures',
      description: 'Our classic manicure finished in long-wear gel polish — glossy, chip-free for up to three weeks.',
      price: 50,
      duration: 45,
      popular: true,
    },
    {
      id: 'acrylic-full',
      name: 'Acrylic Full Set',
      category: 'Acrylic',
      description: 'Sculpted acrylic extensions in your length and shape, finished in gel color or a natural buff.',
      price: 70,
      from: true,
      duration: 90,
      popular: true,
    },
    {
      id: 'acrylic-fill',
      name: 'Acrylic Fill',
      category: 'Acrylic',
      description: 'Re-balance and refresh your acrylics at the two-to-three-week mark, with fresh color.',
      price: 50,
      from: true,
      duration: 60,
    },
    {
      id: 'gelx-full',
      name: 'Gel-X Full Set',
      category: 'Gel / Gel-X',
      description: 'Featherlight soft-gel extensions that feel like your own nails. Flexible, natural and damage-conscious.',
      price: 80,
      from: true,
      duration: 90,
      popular: true,
    },
    {
      id: 'gel-removal',
      name: 'Gel Removal',
      category: 'Gel / Gel-X',
      description: 'Gentle soak-off with a nourishing cuticle oil finish. Never scraped or peeled.',
      price: 15,
      duration: 15,
    },
    {
      id: 'classic-pedicure',
      name: 'Classic Pedicure',
      category: 'Pedicures',
      description: 'Warm soak, nail shaping, cuticle care, callus smoothing, massage and polish.',
      price: 45,
      duration: 45,
    },
    {
      id: 'deluxe-pedicure',
      name: 'Deluxe Spa Pedicure',
      category: 'Pedicures',
      description: 'Sugar scrub, mineral mask, hot-stone massage and extended massage. Our most-booked treat.',
      price: 70,
      duration: 60,
      popular: true,
    },
    {
      id: 'signature-art',
      name: 'Signature Nail Art Set',
      category: 'Nail Art',
      description: 'A fully custom hand-painted design on your choice of gel or extensions. Bring your inspo.',
      price: 95,
      from: true,
      duration: 105,
    },
  ] as Service[],

  addOns: [
    { id: 'nail-art', name: 'Nail Art', description: 'Hand-painted accents, foils, or charms', price: 10, from: true, duration: 15 },
    { id: 'french-tip', name: 'French Tip', description: 'Classic or colored French finish', price: 10, duration: 10 },
    { id: 'chrome', name: 'Chrome Finish', description: 'Mirror, pearl or aurora chrome powder', price: 15, duration: 10 },
    { id: 'paraffin', name: 'Paraffin Treatment', description: 'Warm wax for deeply hydrated hands or feet', price: 15, duration: 15 },
    { id: 'acrylic-removal', name: 'Acrylic Removal', description: 'Safe, gentle removal of existing acrylics', price: 20, duration: 20 },
  ] as AddOn[],

  /* ── Technicians (workingDays: 0 = Sun … 6 = Sat) ─────────────────────── */
  technicians: [
    {
      id: 'mina',
      name: 'Mina Tran',
      title: 'Lead Acrylic Artist',
      photo: `${U}1580489944761-15a19d654956`,
      specialties: ['Acrylic sculpting', 'Chrome'],
      rating: 4.9,
      reviews: 142,
      workingDays: [2, 3, 4, 5, 6],
      serviceCategories: ['Acrylic', 'Manicures'],
      bio: 'Twelve years sculpting flawless extensions.',
    },
    {
      id: 'sofia',
      name: 'Sofia Alvarez',
      title: 'Nail Art Director',
      photo: `${U}1607746882042-944635dfe10e`,
      specialties: ['Hand-painted art', 'Custom design'],
      rating: 5.0,
      reviews: 118,
      workingDays: [3, 4, 5, 6, 0],
      serviceCategories: ['Nail Art', 'Manicures', 'Gel / Gel-X'],
      bio: 'Fine-line florals, minimalism and everything in between.',
    },
    {
      id: 'jade',
      name: 'Jade Kim',
      title: 'Gel-X Specialist',
      photo: `${U}1623717217554-72ca676de535`,
      specialties: ['Gel-X', 'Gel manicures'],
      rating: 4.9,
      reviews: 97,
      workingDays: [2, 4, 5, 6, 0],
      serviceCategories: ['Gel / Gel-X', 'Manicures'],
      bio: 'Precision shaping and the cleanest apex in Chicago.',
    },
    {
      id: 'priya',
      name: 'Priya Nair',
      title: 'Spa Pedicure Expert',
      photo: `${U}1662850886700-4ec19bd30d11`,
      specialties: ['Spa pedicures', 'Paraffin'],
      rating: 4.8,
      reviews: 86,
      workingDays: [2, 3, 5, 6, 0],
      serviceCategories: ['Pedicures'],
      bio: 'Slow, restorative foot care with a gentle touch.',
    },
  ] as Technician[],

  /* ── Gallery ──────────────────────────────────────────────────────────── */
  gallery: [
    { id: 'g1', src: `${U}1746607242420-12fc2604775d`, alt: 'Nude almond acrylics with gold rings and a watch', category: 'Acrylic', aspect: '4/5' },
    { id: 'g2', src: `${U}1772322586702-73125782bd99`, alt: 'Blue and white ombré Gel-X', category: 'Gel-X', aspect: '1/1' },
    { id: 'g3', src: `${U}1772322586785-3a34772cbc61`, alt: 'Lavender French tips with a violet edge', category: 'French', aspect: '3/4' },
    { id: 'g4', src: `${U}1696341995063-b60c66e85838`, alt: 'Black and silver star nail art set', category: 'Nail Art', aspect: '5/4' },
    { id: 'g5', src: `${U}1662132090867-57a37fa1edf8`, alt: 'Plum pedicure in tan sandals', category: 'Pedicure', aspect: '4/5' },
    { id: 'g6', src: `${U}1772322586634-9867476143b9`, alt: 'Cobalt almond Gel-X with silver French', category: 'Gel-X', aspect: '1/1' },
    { id: 'g7', src: `${U}1754799670312-8e7da8e40ad7`, alt: 'Navy, gold and white hand-painted nail art', category: 'Nail Art', aspect: '3/4' },
    { id: 'g8', src: `${U}1762373349045-c2decd4ec3f3`, alt: 'Classic French manicure holding a daisy', category: 'French', aspect: '4/5' },
    { id: 'g9', src: `${U}1610992015762-45dca7fa3a85`, alt: 'Soft nude square acrylics', category: 'Acrylic', aspect: '1/1' },
    { id: 'g10', src: `${U}1656446154209-aa489759f0e3`, alt: 'Deep violet pedicure in black heels', category: 'Pedicure', aspect: '5/4' },
    { id: 'g11', src: `${U}1754799670410-b282791342c3`, alt: 'White and pink heart nail art', category: 'Nail Art', aspect: '4/5' },
    { id: 'g12', src: `${U}1772322586754-34c9e6f5be6f`, alt: 'Glitter-accent French tips', category: 'French', aspect: '3/4' },
    { id: 'g13', src: `${U}1707725238063-0c54fb6963d1`, alt: 'Berry pink pedicure', category: 'Pedicure', aspect: '1/1' },
    { id: 'g14', src: `${U}1735236007245-9dc6e28bbe56`, alt: 'Blue and white winter tree nail art', category: 'Nail Art', aspect: '4/5' },
    { id: 'g15', src: `${U}1735264143075-9694eb02ad86`, alt: 'Sheer nude French with a ring', category: 'French', aspect: '1/1' },
    { id: 'g16', src: `${U}1641814250010-9887d86eedfd`, alt: 'Glitter-accent nude acrylics with a diamond ring', category: 'Acrylic', aspect: '5/4' },
  ] as GalleryImage[],

  /* ── Reviews ──────────────────────────────────────────────────────────── */
  rating: {
    score: 4.9,
    count: 312,
    // 5★ … 1★ counts (sum = count)
    breakdown: [278, 28, 4, 1, 1],
  },
  reviews: [
    { id: 'r1', name: 'Hannah L.', date: '2026-09-21', service: 'Gel-X Full Set', stars: 5, text: 'Jade is a magician. My Gel-X looks like my own nails, only better, and they survived three weeks of travel without a single lift.' },
    { id: 'r2', name: 'Danielle R.', date: '2026-09-14', service: 'Deluxe Spa Pedicure', stars: 5, text: 'The quietest, cleanest salon I’ve been to in Chicago. The hot-stone massage alone is worth it. Booking online took 40 seconds.' },
    { id: 'r3', name: 'Maya P.', date: '2026-09-06', service: 'Signature Nail Art Set', stars: 5, text: 'Sofia painted tiny pressed-flower designs from a screenshot I sent. I got stopped on the street twice. Absolutely worth the splurge.' },
    { id: 'r4', name: 'Chloe B.', date: '2026-08-29', service: 'Acrylic Full Set', stars: 5, text: 'Mina’s sculpting is flawless — perfect apex, perfect shape. I’ve finally found my person in Bucktown.' },
    { id: 'r5', name: 'Alexis W.', date: '2026-08-18', service: 'Gel Manicure', stars: 5, text: 'In and out right on time, and the polish lasted a full three weeks. The deposit system means no no-shows, which I respect.' },
    { id: 'r6', name: 'Tessa M.', date: '2026-08-09', service: 'Acrylic Fill', stars: 4, text: 'Beautiful work and a lovely space. Had to wait about ten minutes past my time, but they offered tea and apologized sweetly.' },
    { id: 'r7', name: 'Rina K.', date: '2026-07-30', service: 'Classic Pedicure', stars: 5, text: 'Priya is so gentle and thorough. My feet have never looked better, and the polish stayed perfect through a beach week.' },
    { id: 'r8', name: 'Olivia S.', date: '2026-07-19', service: 'Gel Manicure + French Tip', stars: 5, text: 'The cleanest French tip I’ve ever had. Easy booking, friendly team, and the space smells divine.' },
  ] as Review[],

  /* ── Contact page ─────────────────────────────────────────────────────── */
  contactFormTopics: ['General question', 'Group / bridal booking', 'Gift cards', 'Something else'],
  /** how long the contact form says replies take */
  replyTime: 'We reply within one business day.',
}

export type Salon = typeof salon
