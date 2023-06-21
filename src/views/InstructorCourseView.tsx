import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import InstructorCourseGuard from '../components/guards/InstructorCourseGuard';

interface IInstructorCourseViewProps {
  menu: string;
  query: any;
  courseId: number;
  lectureId: string;
  documentId: string;
  user: string;
}

interface IInstructorCourseViewState {}

export default class InstructorCourseView extends AppViewWrapper<
  IInstructorCourseViewProps & IAppViewWrapperProps,
  IInstructorCourseViewState
> {
  getView() {
    const { menu, query, courseId, lectureId, documentId, user } = this.props;

    return (
      <div
        id="instructor-course-view"
        className="instructor-course-view section"
      >
        <InstructorCourseGuard
          menu={menu}
          query={query}
          id={courseId}
          lectureId={lectureId}
          documentId={documentId}
          user={user}
        />
      </div>
    );
  }

  getMenu() {
    return 'instructor/course';
  }
}
