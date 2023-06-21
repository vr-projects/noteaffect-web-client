/** corp version of AddCoursePopover */
import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import JSONutil from '../../utilities/JSONutil';
import 'moment-timezone';
import {
  SrUiComponent,
  LoadStates,
  LoadMask,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import ErrorUtil from '../../utilities/ErrorUtil';
import { Modal } from 'react-bootstrap';
import Localizer from '../../utilities/Localizer';
import CorpMeetingForm from './CorpMeetingForm';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface ICorpAddMeetingModalProps {
  departmentId: number;
  show: boolean;
  onClose: (number?) => void;
  shouldBroadcastAdded: boolean;
}

interface ICorpAddMeetingModalState {
  loading: LoadStates;
  errorMessage: string;
}

class CorpAddMeetingModal extends SrUiComponent<
  ICorpAddMeetingModalProps,
  ICorpAddMeetingModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      errorMessage: '',
    };
  }

  handleClose(createdMeetingId?: number) {
    this.setState({ ...this.initialState() });

    if (createdMeetingId !== undefined) {
      return this.props.onClose(createdMeetingId);
    }

    this.props.onClose();
  }

  async handleFormSubmit(payload) {
    const { shouldBroadcastAdded } = this.props;
    let createdMeetingId;

    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });
      const resp = await ApiHelpers.create(`series/meeting`, payload);

      if (!resp.good || !JSONutil.isValid(resp.data) || !isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      }

      createdMeetingId = JSON.parse(resp.data).id;

      if (shouldBroadcastAdded) {
        this.broadcast(AppBroadcastEvents.MeetingAdded);
      }
      this.setPartial({
        loading: LoadStates.Succeeded,
      });

      this.handleClose(createdMeetingId);
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: err.message,
      });
      console.error(err);
    }
  }

  performRender() {
    const { loading, errorMessage } = this.state;
    const { departmentId } = this.props;

    return (
      <Modal
        show={this.props.show}
        keyboard
        backdrop={'static'}
        onHide={() => this.handleClose()}
      >
        <Modal.Header>
          <h3>{Localizer.get('Add New Meeting')}</h3>
        </Modal.Header>
        <Modal.Body>
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Updating meeting...')}
            errorMessage={Localizer.get(errorMessage)}
          />
          <CorpMeetingForm
            type={'add'}
            departmentId={departmentId}
            meeting={null}
            onSubmit={(payload) => this.handleFormSubmit(payload)}
            onClose={() => this.handleClose()}
            disable={loading === LoadStates.Loading}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default CorpAddMeetingModal;
