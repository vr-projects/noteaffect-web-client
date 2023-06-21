import * as React from 'react';
import AppViewWrapper from './AppViewWrapper';
import CoursesContainer from '../components/containers/CoursesContainer';

interface IDashboardViewProps {}

interface IDashboardViewState {}

export default class DashboardView extends AppViewWrapper<
  IDashboardViewProps,
  IDashboardViewState
> {
  getView() {
    return (
      <div id="dashboard-view" className="flex-grow-column-container section">
        <CoursesContainer />
      </div>
    );
  }

  getMenu() {
    return 'dashboard';
  }
}
