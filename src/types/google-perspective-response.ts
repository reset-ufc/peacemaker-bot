export interface DiscoverAPIResponse {
  data: Data;
  status: number;
  statusText: string;
}

export interface Data {
  attributeScores: AttributeScores;
  languages: string[];
  detectedLanguages: string[];
}

export interface AttributeScores {
  TOXICITY: Toxicity;
}

export interface Toxicity {
  spanScores: SpanScore[];
  summaryScore: SummaryScore;
}

export interface SpanScore {
  begin: number;
  end: number;
  score: Score;
}

export interface Score {
  value: number;
  type: string;
}

export interface SummaryScore {
  value: number;
  type: string;
}
