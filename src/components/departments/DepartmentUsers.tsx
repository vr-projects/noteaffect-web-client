import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import IDepartment from '../../models/IDepartment';
import Localizer from '../../utilities/Localizer';

interface IDepartmentUsersProps {
  department: IDepartment;
}

interface IDepartmentUsersState {}

export default class DepartmentUsers extends SrUiComponent<
  IDepartmentUsersProps,
  IDepartmentUsersState
> {
  performRender() {
    if (!this.props.department) {
      return null;
    }

    return (
      <div className="department-users">
        <h5>{Localizer.get('Members')}</h5>
        <p>
          {Localizer.get(
            "Department members are allowed to view, but not modify, a department's information."
          )}
        </p>
      </div>
    );
  }
}
