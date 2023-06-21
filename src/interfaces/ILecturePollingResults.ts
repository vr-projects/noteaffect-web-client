import IPollingResults from "./IPollingResults";

export default interface ILecturePollingResults extends IPollingResults {
  userAnswers: string[];
  correctAnswers: string[];
  type: string;
}
