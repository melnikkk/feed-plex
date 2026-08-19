import type { Interest } from '@feed-plex/contracts';

export const interests: Array<Interest> = [
  {
    topic: 'artificial intelligence',
    weight: 1,
    keywords: ['ai', 'artificial intelligence', 'machine learning', 'llm'],
  },
  {
    topic: 'software architecture',
    weight: 0.8,
    keywords: ['architecture', 'system design', 'microservices', 'monolith'],
  },
  {
    topic: 'developer tooling',
    weight: 0.6,
    keywords: ['tooling', 'developer experience', 'cli', 'editor', 'ide'],
  },
];
