import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import CourseGuard from '../components/guards/CourseGuard';

interface ICourseViewProps {
  menu: string;
  query: any;
  courseId: number;
  lectureId: string;
  engagementId: string;
}

interface ICourseViewState {}

export default class CourseView extends AppViewWrapper<
  ICourseViewProps & IAppViewWrapperProps,
  ICourseViewState
> {
  getView() {
    const { courseId, menu, lectureId, engagementId, query } = this.props;

    return (
      <div id="course-view" className="section">
        <CourseGuard
          id={courseId}
          menu={menu}
          query={query}
          lectureId={lectureId}
          engagementId={engagementId}
        />
      </div>
    );
  }

  getMenu() {
    return 'course';
  }
}
