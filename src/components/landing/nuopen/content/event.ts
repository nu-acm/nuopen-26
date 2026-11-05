import { formatMoney } from '@/components/landing/nuopen/lib/format';

const EMAIL = 'acmsc@nu.edu.kz';
const PRIZE = { amount: 1_200_000, currency: '₸' };
const PRIZE_TEXT = formatMoney(PRIZE.amount, PRIZE.currency);

export const EVENT = {
  name: 'NU Open',
  edition: 7,
  episode: 'VII',
  subtitle: 'The Code Awakens',
  tagline: 'Five hours. One problem set. Teams of up to three.',
  organizer: 'ACM@NU Student Chapter',
  organizerShort: 'ACM@NU',
  registerHref: '/register',
  contest: {
    start: '2026-11-07T11:00:00+05:00',
    end: '2026-11-07T16:00:00+05:00',
    hours: 5,
    dateLabel: '7 November 2026',
    weekday: 'Saturday',
    format: 'ICPC-style',
    platform: 'Codeforces',
  },
  venue: {
    name: 'Nazarbayev University',
    city: 'Astana, Kazakhstan',
    address: '53 Kabanbay Batyr Ave',
    mapHref: 'https://maps.google.com/?q=Nazarbayev+University+Astana',
  },
  team: { min: 1, max: 3, minAge: 16 },
  prize: { text: PRIZE_TEXT, extra: 'plus ACM@NU merch for the winners' },
  stats: [
    { value: 2100, suffix: '+', label: 'participants' },
    { value: 800, suffix: '+', label: 'teams' },
    { value: 10, suffix: '+', label: 'countries' },
    { value: 6, suffix: '', label: 'editions since 2020' },
  ],
  crawl: [
    'It is a period of algorithmic unrest. Student squadrons from across the galaxy gather at Nazarbayev University for the seventh NU OPEN.',
    'In five hours, teams of up to three must solve a problem set forged by the jury, armed with one laptop, their wits and nothing else.',
    'Six battles have drawn more than 2,100 pilots from over ten star systems. Now the jury awaits the next generation of coders…',
  ],
  // placeholder: 2026 dates to be confirmed by ACM@NU
  timeline: [
    {
      date: '2026-10-23',
      label: 'Registration opens',
      note: 'Sign up solo or as a team of up to three.',
    },
    { date: '2026-11-03', label: 'Registration closes', note: 'Last call, 23:59 Astana time.' },
    {
      date: '2026-11-05',
      label: 'Confirmation',
      note: 'On-campus teams get a confirmation email.',
    },
    { date: '2026-11-07', label: 'Contest day', note: 'Nazarbayev University, Astana.' },
  ],
  // placeholder: last year's running order, to be confirmed for 2026
  agenda: [
    {
      from: '09:00',
      to: '10:00',
      title: 'Check-in',
      note: 'Bring your ID and one laptop per team.',
    },
    {
      from: '10:00',
      to: '10:40',
      title: 'Opening ceremony',
      note: 'Rules, judges and the last briefing.',
    },
    {
      from: '11:00',
      to: '16:00',
      title: 'The contest',
      note: 'Five hours. One problem set.',
      main: true,
    },
    { from: '16:00', to: '16:30', title: 'Coffee break', note: 'On us, for on-campus teams.' },
    { from: '16:30', to: '17:00', title: 'Photo', note: 'Every squadron, one frame.' },
    {
      from: '17:00',
      to: '18:00',
      title: 'Closing ceremony',
      note: 'Results and the prize ceremony.',
    },
  ],
  rules: [
    { title: 'Fly solo or in threes', text: 'Compete on your own or in a team of up to three.' },
    { title: 'Be there to win', text: 'Prizes go to teams who register and compete in person.' },
    { title: 'One laptop per team', text: 'Bring your own. Laptops are not provided.' },
    {
      title: 'Coaches watch, not help',
      text: `Coaches may come with notice to ${EMAIL}, but may not help during the contest.`,
    },
    {
      title: 'Turn off your targeting computer',
      text: 'No ChatGPT or any AI, no Stack Overflow, no websites other than Codeforces. Use the Force.',
    },
  ],
  faq: [
    {
      q: 'Who can take part?',
      a: 'Anyone aged 16 or older, from any university or school. Compete solo or in a team of up to three, in person at Nazarbayev University.',
    },
    { q: 'Is it free?', a: 'Yes. Taking part in NU Open costs nothing.' },
    {
      q: 'What are the prizes?',
      a: `A prize pool of ${PRIZE_TEXT} shared by the top teams, plus ACM@NU merch.`,
    },
    {
      q: 'Who can win a prize?',
      a: 'Every registered team competing in person at Nazarbayev University is eligible.',
    },
    {
      q: "I'm still at school. Can I win?",
      a: "Yes. If you're 16 or older, bring an ID and compete on campus.",
    },
    {
      q: 'Do I need to attend in person?',
      a: 'Yes. Every team member must compete in person at Nazarbayev University in Astana.',
    },
    {
      q: 'What should I bring?',
      a: 'One laptop per team with its charger, and an ID for every team member.',
    },
    {
      q: 'Can our coach come?',
      a: `Yes, with notice to ${EMAIL} in advance. Coaches cannot help during the contest.`,
    },
    {
      q: 'Who organises NU Open?',
      a: 'The ACM Student Chapter of Nazarbayev University (ACM@NU), a student club since 2017.',
    },
    {
      q: 'How do I join ACM@NU?',
      a: `Follow @nuacmsc on Instagram for recruitment calls, or write to ${EMAIL}.`,
    },
  ],
  partners: [
    { year: 2020, names: ['EPAM'] },
    { year: 2021, names: ['EPAM', 'Kolesa Group'] },
    { year: 2022, names: ['Umag', 'Zapis'] },
    { year: 2023, names: ['Umag', 'Zapis', 'BTS Digital'] },
    { year: 2024, names: ['Umag', 'Zapis'] },
    { year: 2025, names: ['Umag', 'Zapis', 'inDrive'] },
  ],
  partnerPitch: [
    "Access to participants' CVs",
    'Host a workshop or a talk',
    'Your brand on merch, print, social media and this site',
  ],
  contacts: {
    email: EMAIL,
    phone: '+7 708 214 6675',
    phoneHref: 'tel:+77082146675',
    social: [
      { label: 'Instagram', href: 'https://www.instagram.com/nuacmsc/' },
      { label: 'LinkedIn', href: 'https://www.linkedin.com/company/nuacmsc' },
      { label: 'YouTube', href: 'https://www.youtube.com/@nuacmsc' },
    ],
  },
  credits: [
    {
      model: 'Imperial-class Star Destroyer',
      author: 'Heataker',
      license: 'Sketchfab Standard',
      href: 'https://sketchfab.com/3d-models/star-wars-imperial-class-star-destroyer-fa18d537db4d4020a443c1802ec0f88e',
    },
    {
      model: 'Death Star',
      author: 'SebastianSosnowski',
      license: 'CC BY-NC-ND 4.0',
      href: 'https://sketchfab.com/3d-models/death-star-star-wars-3d5f01485e9e4e8b9d995d7764341afe',
    },
    {
      model: 'Darth Vader',
      author: 'Stym',
      license: 'CC BY-NC-SA 4.0',
      href: 'https://sketchfab.com/3d-models/darth-vader-1784449656114e55b596fc3e902f083d',
    },
    {
      model: 'Anakin Skywalker — Battlefront II',
      author: 'rendysix',
      license: 'CC BY 4.0',
      href: 'https://sketchfab.com/3d-models/anakin-skywalker-battlefront-ii-24c34fbc5a94408bad9bff4402054957',
    },
    {
      model: '3D T.I.E Fighter',
      author: 'Mickael Boitte',
      license: 'CC BY 4.0',
      href: 'https://sketchfab.com/3d-models/3d-tie-fighter-star-wars-model-5375de94c2484ab0b2a2bd75aa63c2b4',
    },
    {
      model: 'Luke Skywalker lightsaber',
      author: 'art_em',
      license: 'CC BY 4.0',
      href: 'https://sketchfab.com/3d-models/luke-skywalker-lightsaber-0b38aebb987c45018b79d98025b77ea9',
    },
  ],
} as const;
