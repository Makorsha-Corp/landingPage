import { BRAND_NAME } from './brand.js'

export const DEFAULT_FAQ = {
  items: [
    {
      id: 'built-for',
      question: 'What kind of business is this built for?',
      answer: `${BRAND_NAME} is built for textile mills and small-to-mid manufacturers: businesses that buy materials, run them through machines, and ship finished goods. If you are tracking that across spreadsheets today, that is exactly who we built it for.`,
    },
    {
      id: 'vs-erp',
      question: 'How is this different from a general ERP?',
      answer: `General ERPs make you describe your factory in accounting terms. ${BRAND_NAME} starts from the factory itself — machines, batches, formulas, and stock that lives in a specific place. Setup takes days, not a six-month implementation.`,
    },
    {
      id: 'beta-trust',
      question: 'You are in beta. Should I trust this with my inventory?',
      answer: `Fair question. ${BRAND_NAME} runs day to day in a working cotton mill, so it is not untested — but it is early, and we would rather tell you that now than have you discover it later. Start with one part of your operation, keep your existing records alongside it, and expand when it has earned that.`,
    },
    {
      id: 'data-import',
      question: 'Can I bring my existing data in?',
      answer:
        'TODO — confirm before shipping. Only claim spreadsheet import for items, suppliers, customers, and opening stock if that importer actually exists today. This is the single easiest answer to get caught out on.',
    },
    {
      id: 'data-export',
      question: 'What happens to my data if I leave?',
      answer: `It is yours. Export anything you have put into ${BRAND_NAME}, at any time, in a standard format. No exit fee and no hostage-taking — if the product stops being worth it, you should be able to walk.`,
    },
    {
      id: 'multi-factory',
      question: 'Do I need a separate plan for each factory?',
      answer:
        'No. One account covers every site you run. Your plan sets how many people and locations are included, and factories, sections, and departments all live inside it.',
    },
    {
      id: 'support',
      question: 'What does support actually look like?',
      answer:
        'TODO — describe what is genuinely offered today. Do not promise response times, phone support, dedicated account managers, or on-site training unless they exist.',
    },
  ],
}

export function isPublishableFaq(item) {
  return !String(item.answer).trim().startsWith('TODO')
}

export function mergeFaqFromSaved(saved) {
  if (!saved?.items?.length) {
    return cloneFaq(DEFAULT_FAQ)
  }

  return {
    items: DEFAULT_FAQ.items.map((defaults, index) => {
      const savedItem = saved.items[index]
      if (!savedItem) return { ...defaults }
      return {
        ...defaults,
        question: savedItem.question ?? defaults.question,
        answer: savedItem.answer ?? defaults.answer,
      }
    }),
  }
}

export function faqForStorage(faq) {
  return {
    items: faq.items.map(({ id, question, answer }) => ({ id, question, answer })),
  }
}

export function cloneFaq(faq) {
  return {
    items: faq.items.map((item) => ({ ...item })),
  }
}
