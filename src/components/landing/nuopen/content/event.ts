import { formatMoney } from '@/components/landing/nuopen/lib/format';
import {
  CONTACT_EMAIL,
  EVENT_DATE,
  MAX_TEAM_SIZE,
  MIN_PARTICIPANT_AGE,
  MIN_TEAM_SIZE,
} from '@/lib/event';
import {
  CONFIRMATION_DATE,
  DEFAULT_REGISTRATION_DEADLINE,
  REGISTRATION_OPEN_DATE,
} from '@/lib/registration';

const PRIZE = { amount: 1_000_000, currency: '₸' };
const PRIZE_TEXT = formatMoney(PRIZE.amount, PRIZE.currency);

export const EVENT = {
  name: 'NU Open',
  edition: 7,
  episode: 'VII',
  subtitle: 'The Code Awakens',
  organizer: 'ACM@NU Student Chapter',
  organizerShort: 'ACM@NU',
  registerHref: '/register',
  contest: {
    start: `${EVENT_DATE}T11:00:00+05:00`,
    end: `${EVENT_DATE}T16:00:00+05:00`,
    hours: 5,
    dateLabel: '22 November 2026',
    weekday: 'Sunday',
    format: 'ICPC-style',
    platform: 'Codeforces',
  },
  venue: {
    name: 'Nazarbayev University',
    city: 'Astana, Kazakhstan',
    address: '53 Kabanbay Batyr Ave',
    mapHref: 'https://maps.google.com/?q=Nazarbayev+University+Astana',
  },
  team: { min: MIN_TEAM_SIZE, max: MAX_TEAM_SIZE, minAge: MIN_PARTICIPANT_AGE },
  prize: { ...PRIZE, text: PRIZE_TEXT, extra: 'plus ACM@NU merch for the winners' },
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
  timeline: [
    {
      date: REGISTRATION_OPEN_DATE,
      label: 'Registration opens',
      note: 'Sign up solo or as a team of up to three.',
    },
    {
      date: DEFAULT_REGISTRATION_DEADLINE.slice(0, 10),
      label: 'Registration closes',
      note: '23:59',
    },
    {
      date: CONFIRMATION_DATE,
      label: 'Confirmation',
      note: 'Teams receive confirmation by email.',
    },
    { date: EVENT_DATE, label: 'Contest day', note: 'Nazarbayev University, Astana.' },
  ],
  agenda: [
    {
      from: '09:00',
      to: '10:00',
      title: 'On-site registration',
      venue: 'Red Hall',
    },
    {
      from: '10:00',
      to: '10:40',
      title: 'Opening ceremony',
      venue: 'Red Hall',
    },
    {
      from: '11:00',
      to: '16:00',
      title: 'Competition',
      venue: 'Ballroom Left',
      main: true,
    },
    { from: '16:00', to: '16:30', title: 'Coffee break', venue: 'C3 Vestibule' },
    { from: '16:30', to: '17:00', title: 'Photoshoot', venue: null },
    {
      from: '17:00',
      to: '18:00',
      title: 'Closing ceremony',
      venue: 'Red Hall',
    },
  ],
  rules: [
    {
      title: 'Compete solo or with teammates',
      text: 'Compete on your own or in a team of up to three.',
    },
    { title: 'Be there to win', text: 'Prizes go to teams who register and compete in person.' },
    { title: 'One laptop per team', text: 'Bring your own. Laptops are not provided.' },
    {
      title: 'Coaches watch, not help',
      text: `Coaches may come with notice to ${CONTACT_EMAIL}, but may not help during the contest.`,
    },
    {
      title: 'Turn off your targeting computer',
      text: 'No ChatGPT or any AI, no Stack Overflow, no websites other than Codeforces. Use the Force.',
    },
  ],
  faq: [
    {
      q: 'Who can take part?',
      a: 'Anyone aged 16 or older can compete solo or in a team of up to three, in person at Nazarbayev University.',
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
      a: `Yes, with notice to ${CONTACT_EMAIL} in advance. Coaches cannot help during the contest.`,
    },
    {
      q: 'Who organises NU Open?',
      a: 'The ACM Student Chapter of Nazarbayev University (ACM@NU), a student club since 2017.',
    },
    {
      q: 'How do I join ACM@NU?',
      a: `Follow @nuacmsc on Instagram for recruitment calls, or write to ${CONTACT_EMAIL}.`,
    },
  ],
  contacts: {
    email: CONTACT_EMAIL,
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
      model: 'Anakin Skywalker (Battlefront II)',
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
