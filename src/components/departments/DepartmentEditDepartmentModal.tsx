import * as React from 'react';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import GenericModal from '../controls/GenericModal';
import { DEPARTMENT_EDIT_DEPARTMENT_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import IDepartment from '../../models/IDepartment';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IDepartmentEditDepartmentModalProps {
  course: ICourse;
  departments: IDepartment[];
  onClose: () => void;
}

interface IDepartmentEditDepartmentModalState {
  loading: LoadStates;
  department: string;
}

export default class DepartmentEditDepartmentModal extends SrUiComponent<
  IDepartmentEditDepartmentModalProps,
  IDepartmentEditDepartmentModalState
> {
  initialState() {
    return { loading: LoadStates.Unloaded, department: undefined };
  }

  currentDepartmentId() {
    return (
      this.state.department ||
      (this.props.course
        ? this.props.course.departmentId.toString()
        : undefined)
    );
  }

  onNewProps(props: IDepartmentEditDepartmentModalProps) {
    if (!props.course) {
      this.setState({ loading: LoadStates.Unloaded, department: undefined });
    }
  }

  async updateDepartment() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    const departmentId = parseInt(this.state.department);
    const courseId = this.props.course.id;

    if (isNaN(departmentId) || departmentId == this.props.course.departmentId) {
      this.close();
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.update(
      `series/${this.props.course.id}/department`,
      { departmentId }
    );
    if (
      !this.mounted() ||
      !this.props.course ||
      courseId !== this.props.course.id
    ) {
      return;
    }

    if (resp.good) {
      this.close();
      this.broadcast(AppBroadcastEvents.DepartmentCourseUpdated);
    } else {
      this.setState({ loading: LoadStates.Failed });
    }
  }

  close() {
    this.setState({ loading: LoadStates.Unloaded, department: undefined });
    this.props.onClose();
  }

  performRender() {
    const { course } = this.props;

    return (
      <>
        <GenericModal
          modalTitle={
            Localizer.get('Edit department for ') +
            (this.props.course ? this.props.course.name : '')
          }
          show={!!course}
          hasCloseButton={true}
          onCloseClicked={() => this.close()}
          hasConfirmButton={true}
          confirmButtonType={'save'}
          onConfirmClicked={() => this.updateDepartment()}
        >
          <div className="rel">
            <p>
              {Localizer.getFormatted(
                DEPARTMENT_EDIT_DEPARTMENT_COMPONENT.SUBTITLE
              )}
            </p>
            <select
              value={this.currentDepartmentId()}
              onChange={(e) => this.setPartial({ department: e.target.value })}
            >
              {this.props.departments.map((d) => (
                <option key={d.id} value={d.id.toString()}>
                  {d.name}
                </option>
              ))}
            </select>
            <LoadMask state={this.state.loading} />
            <LoadIndicator
              state={this.state.loading}
              loadingMessage={Localizer.get('Updating department...')}
              errorMessage={Localizer.get(
                'Something went wrong.  Please try again later.'
              )}
            />
          </div>
        </GenericModal>
      </>
    );
  }
}
