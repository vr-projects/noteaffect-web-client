import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import InstructorCoursesGuard from '../components/guards/InstructorCoursesGuard';

interface IDashboardViewProps {
  params: any;
}

interface IDashboardViewState {}

export default class DashboardView extends AppViewWrapper<
  IDashboardViewProps & IAppViewWrapperProps,
  IDashboardViewState
> {
  getView() {
    const { params } = this.props;

    return (
      <div
        id="instructor-courses-view"
        className="instructor-courses-view section flex-grow-column-container"
      >
        <InstructorCoursesGuard params={params} />
      </div>
    );
  }

  getMenu() {
    return 'instructor/courses';
  }
}
