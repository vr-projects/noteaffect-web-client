import * as React from 'react';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import IDepartment from '../../models/IDepartment';

interface IDepartmentsListProps {
  departments: IDepartment[];
  selectedDepartment: number;
}

interface IDepartmentsListState {}

export default class DepartmentsList extends SrUiComponent<
  IDepartmentsListProps,
  IDepartmentsListState
> {
  selectDepartment(dept: IDepartment) {
    this.updateQuery(QueryUtility.buildQuery({ department: dept.id }));
  }

  performRender() {
    return (
      <>
        {this.props.departments.map((dept) => (
          <>
            {/* // TODO tech debt div > button */}
            <div
              key={dept.id}
              className={
                'departments-list list-menu-item ' +
                (this.props.selectedDepartment === dept.id ? 'selected' : '')
              }
              onClick={() => this.selectDepartment(dept)}
            >
              <p className="list-menu-title">{dept.name}</p>
            </div>
          </>
        ))}
      </>
    );
  }
}
