import IStudentOverview from "./IStudentOverview";

export default interface ISeriesStudentsOverview {
  seriesId: number;
  studentOverviews: IStudentOverview[];
}
