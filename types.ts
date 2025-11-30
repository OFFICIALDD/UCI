export interface CodeAnalysisResult {
  explanation: string;
  timeComplexity: string;
  spaceComplexity: string;
  securityIssues: string[];
  improvements: string[];
  qualityScore: QualityMetrics;
}

export interface QualityMetrics {
  readability: number;
  maintainability: number;
  security: number;
  performance: number;
  structure: number;
}

export interface GeneratedCodeResult {
  code: string;
  explanation: string;
}

export interface DiffResult {
  summary: string;
  changes: string[];
  riskAssessment: string;
}

export enum AppMode {
  GENERATOR = 'GENERATOR',
  ANALYZER = 'ANALYZER',
  CONVERTER = 'CONVERTER',
  FLOWCHART = 'FLOWCHART',
  RUNNER = 'RUNNER',
  DIFF = 'DIFF'
}

export const LANGUAGES = [
  'Python', 'JavaScript', 'TypeScript', 'Java', 'C++', 'C', 'PHP', 'Go', 'Rust', 'SQL', 'HTML/CSS'
];