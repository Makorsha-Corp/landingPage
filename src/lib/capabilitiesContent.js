// Screenshot PNGs: landingPage/public/features/{id}.png (e.g. business-lens.png)

export const DEFAULT_CAPABILITIES = {
  eyebrow: 'Features',
  heading: 'Everything behind the walls',
  sub: 'The tour showed you the floors. This is the wiring that connects them — the systems your whole operation runs on, whether you have one factory or nine.',
  cards: [
    {
      id: 'business-lens',
      title: 'BusinessLens Reports',
      description:
        'Pick a lens — item, order, storage, machine, project, or factory — set a date range, and get a built report in seconds.',
      icon: 'M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z',
      badge: null,
      screenshotSrc: null,
    },
    {
      id: 'buy-smarter',
      title: 'Buy Smarter',
      description:
        "See your last price, your lowest price ever, and your cheapest supplier for any item, right when you're placing the order.",
      icon: 'M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25h9.75m-9.75 0a2.25 2.25 0 0 0-2.25 2.25v.75a2.25 2.25 0 0 0 2.25 2.25h9.75a2.25 2.25 0 0 0 2.25-2.25v-.75a2.25 2.25 0 0 0-2.25-2.25m-9.75 0V9.75a2.25 2.25 0 0 1 2.25-2.25h.375m0 0A2.25 2.25 0 0 1 12 5.25c.614 0 1.17.247 1.575.647m-3.15 0A2.25 2.25 0 0 0 9.375 7.5H12m0 0v.375',
      badge: null,
      screenshotSrc: null,
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description:
        'Every due date, delivery, and order across your whole workspace shows up automatically. Nobody enters a calendar event by hand.',
      icon: 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
      badge: null,
      screenshotSrc: null,
    },
    {
      id: 'every-site-one-account',
      title: 'Every Site, One Account',
      description:
        'Run multiple factories with sections and departments that mirror your actual floors, or give each business its own workspace, with its own books and its own team, all behind a single login.',
      icon: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Zm0 3h.008v.008h-.008v-.008Z',
      badge: null,
      screenshotSrc: null,
    },
    {
      id: 'roles-access',
      title: 'Roles & Access',
      description:
        'Give each person exactly the access their job needs, with roles built around how a mill is actually staffed, not generic admin and member tiers.',
      icon: 'M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z',
      badge: null,
      screenshotSrc: null,
    },
    {
      id: 'discussions-notifications',
      title: 'Discussions & Notifications',
      description:
        'Conversation lives right on the order, the project, or the machine, and the right person gets notified the moment something needs them, in real time.',
      icon: 'M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0',
      badge: null,
      screenshotSrc: null,
    },
  ],
}

function isLegacyCapabilitiesEyebrow(value) {
  return typeof value !== 'string' || value.trim().toLowerCase() === 'capabilities'
}

export function normalizeCapabilitiesEyebrow(value) {
  return isLegacyCapabilitiesEyebrow(value) ? DEFAULT_CAPABILITIES.eyebrow : value
}

function mergeCardFromSaved(defaults, savedCard) {
  if (!savedCard) return { ...defaults }
  return {
    ...defaults,
    title: savedCard.title ?? defaults.title,
    description: savedCard.description ?? defaults.description,
    badge: savedCard.badge ?? defaults.badge,
    screenshotSrc: savedCard.screenshotSrc ?? defaults.screenshotSrc,
  }
}

export function cloneCapabilities(source) {
  return {
    ...source,
    eyebrow: normalizeCapabilitiesEyebrow(source.eyebrow),
    cards: source.cards.map((card) => ({ ...card })),
  }
}

export function mergeCapabilitiesFromSaved(saved) {
  if (!saved) return cloneCapabilities(DEFAULT_CAPABILITIES)

  const savedById = Object.fromEntries((saved.cards ?? []).map((card) => [card.id, card]))

  return cloneCapabilities({
    eyebrow: saved.eyebrow,
    heading: saved.heading ?? DEFAULT_CAPABILITIES.heading,
    sub: saved.sub ?? DEFAULT_CAPABILITIES.sub,
    cards: DEFAULT_CAPABILITIES.cards.map((defaults) =>
      mergeCardFromSaved(defaults, savedById[defaults.id]),
    ),
  })
}

export function capabilitiesForStorage(capabilities) {
  return {
    eyebrow: capabilities.eyebrow,
    heading: capabilities.heading,
    sub: capabilities.sub,
    cards: capabilities.cards.map(({ id, title, description, badge, screenshotSrc }) => ({
      id,
      title,
      description,
      badge,
      screenshotSrc: screenshotSrc || null,
    })),
  }
}
