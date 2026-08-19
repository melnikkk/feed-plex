export interface Source {
  url: string;
  sourceAffinity: number;
}

export interface Interest {
  topic: string;
  weight: number;
  embedding?: Array<number>;
  keywords: Array<string>;
}

export interface RelevantArticlesJobData {
  sources?: Array<Source>;
  interests?: Array<Interest>;
}

export interface RankedArticle {
  article: {
    title: string;
    link: string;
    summary: string;
    publishedAt: string;
    sourceUrl: string;
  };
  score: number;
  breakdown: {
    semanticSimilarity: number;
    lexicalScore: number;
    freshnessScore: number;
    sourceAffinity: number;
    noveltyPenalty: number;
    diversityAdjustment: number;
  };
}

export type RelevantArticlesJobResult = Array<RankedArticle>;

export type JobStatus = 'queued' | 'active' | 'completed' | 'failed';
