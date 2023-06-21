export default interface ILectureEngagement {
  rating: number;
  engagedUsers: number;
  totalUsers: number;
  questionsAsked: number;
  answeredPerUser: number;
  mostEngaged: string[];
  leastEngaged: string[];
}
