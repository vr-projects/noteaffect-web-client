import * as React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaTimes, FaSave } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import { EDIT_PERIOD_DIALOG_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import ICourse from '../../models/ICourse';
import IPeriod from '../../models/IPeriod';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IEditPeriodModalProps {
  course: ICourse;
  periods: IPeriod[];
  onClose: () => void;
}

interface IEditPeriodModalState {
  loading: LoadStates;
  period: string;
}

export default class EditPeriodModal extends SrUiComponent<
  IEditPeriodModalProps,
  IEditPeriodModalState
> {
  initialState() {
    return { loading: LoadStates.Unloaded, period: undefined };
  }

  currentPeriodId() {
    return (
      this.state.period ||
      (this.props.course ? this.props.course.periodId.toString() : undefined)
    );
  }

  onNewProps(props: IEditPeriodModalProps) {
    if (!props.course) {
      this.setState({ loading: LoadStates.Unloaded, period: undefined });
    }
  }

  async updatePeriod() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    const periodId = parseInt(this.state.period);
    const courseId = this.props.course.id;

    if (isNaN(periodId) || periodId == this.props.course.periodId) {
      this.close();
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.update(
      `series/${this.props.course.id}/period`,
      { periodId: periodId }
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
    this.setState({ loading: LoadStates.Unloaded, period: undefined });
    this.props.onClose();
  }

  performRender() {
    return (
      <Modal
        show={!!this.props.course}
        onHide={() => this.close()}
        title={
          Localizer.get('Edit department for ') +
          (this.props.course ? this.props.course.name : '')
        }
        keyboard
        backdrop="static"
      >
        <Modal.Header>
          <Modal.Title>
            {Localizer.get('Edit department for ') +
              (this.props.course ? this.props.course.name : '')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="rel">
            <p>{Localizer.getFormatted(EDIT_PERIOD_DIALOG_COMPONENT.SELECT)}</p>
            <select
              value={this.currentPeriodId()}
              onChange={(e) => this.setPartial({ period: e.target.value })}
            >
              {this.props.periods.map((d) => (
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
        </Modal.Body>
        <Modal.Footer>
          <div className="text-right margin margin-top-md">
            <Button bsStyle="default" onClick={() => this.close()}>
              <FaTimes />
              <span className="ml-1">{Localizer.get('Cancel')}</span>
            </Button>{' '}
            <Button bsStyle="success" onClick={() => this.updatePeriod()}>
              <FaSave />
              <span className="ml-1">{Localizer.get('Save')}</span>
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    );
  }
}
