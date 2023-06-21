export default interface IUserQuestion {
  id: number;
  slide: number;
  question: string;
  answer: string;
  answered: boolean;
  answererId: number;
  answerer: string;
  lectureId: number;
  lectureName: string;
  lectureStart: number;
  votes: number;
  created: number;
  userVoted: boolean;
  userCreated: boolean;
  seriesId: number;
}
