import IQuestion from "../models/IQuestion";

export default interface IPollingResults {
  visualizationType: string;
  numericResults: { [label: string]: number };
  average: number;
  minValue: number;
  maxValue: number;
  question: string;
  wordResults: { [word: string]: number };
  slideNumber?: number;
  application?: string;
  context?: string;
  answeredByUser?: boolean;
  unansweredQuestionDetails?: IQuestion;
}
