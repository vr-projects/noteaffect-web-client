import * as React from 'react';
import AppViewWrapper, { IAppViewWrapperProps } from './AppViewWrapper';
import DepartmentsGuard from '../components/guards/DepartmentsGuard';

interface IDepartmentsViewProps {
  menu: any;
}

interface IDepartmentsViewState {}

export default class DepartmentsView extends AppViewWrapper<
  IDepartmentsViewProps & IAppViewWrapperProps,
  IDepartmentsViewState
> {
  getView() {
    // TODO tech debt - menu combines all possible url query params, may become issue with analytics
    const { menu } = this.props;

    return (
      <div id="departments-view" className="departments-view section">
        <DepartmentsGuard menu={menu} />
      </div>
    );
  }

  getMenu() {
    return 'departments';
  }
}
