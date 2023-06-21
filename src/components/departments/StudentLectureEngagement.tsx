import * as React from 'react';
import { SrUiComponent, LoadStates } from 'react-strontium';
import ICourse from '../../models/ICourse';
import ILecture from '../../models/ILecture';
import ISeriesAnalysis from '../../interfaces/ISeriesAnalysis';
import ISeriesStudentsOverview from '../../interfaces/ISeriesStudentsOverview';

interface IStudentLectureEngagementProps {
  course: ICourse;
  lectureId: number;
  userId: number;
  lectures: ILecture[];
  analytics: ISeriesAnalysis;
  overviews: ISeriesStudentsOverview;
  loading: LoadStates;
}

interface IStudentLectureEngagementState {}

// TODO confirm if this is used
export default class StudentLectureEngagement extends SrUiComponent<
  IStudentLectureEngagementProps,
  IStudentLectureEngagementState
> {
  performRender() {
    if (this.props.loading !== LoadStates.Succeeded) {
      return null;
    }

    if (!this.props.lectureId || !this.props.userId) {
      return null;
    }

    return <p>empty</p>;
  }
}
