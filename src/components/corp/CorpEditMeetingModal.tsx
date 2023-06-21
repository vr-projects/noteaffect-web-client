import * as React from 'react';
import isEmpty from 'lodash/isEmpty';
import { connect } from 'react-redux';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
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
import ICourse from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import CorpMeetingForm from './CorpMeetingForm';
import AppBroadcastEvents from 'broadcastEvents/AppBroadcastEvents';

interface IConnectedCorpEditMeetingModalProps {
  userInformation?: IImmutableObject<IUserInformation>;
}
interface ICorpEditMeetingModalProps {
  departmentId: number | null;
  meeting: ICourse | null;
  show: boolean;
  onClose: (number?) => void;
}

interface ICorpEditMeetingModalState {
  loading: LoadStates;
  errorMessage: string;
}

class CorpEditMeetingModal extends SrUiComponent<
  ICorpEditMeetingModalProps & IConnectedCorpEditMeetingModalProps,
  ICorpEditMeetingModalState
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

  async handleFormSubmit(payload, meetingId) {
    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const resp = await ApiHelpers.update(`series/${meetingId}`, payload);

      if (!resp.good || !isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      }

      this.broadcast(AppBroadcastEvents.MeetingUpdated);

      this.setPartial({
        loading: LoadStates.Succeeded,
      });

      this.props.onClose();
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: err.message,
      });
      console.error(err);
    }
  }

  performRender() {
    const { departmentId, meeting } = this.props;
    const { loading, errorMessage } = this.state;

    return (
      <Modal
        show={this.props.show}
        keyboard
        backdrop={'static'}
        onHide={() => this.handleClose()}
      >
        <Modal.Header>
          <h3>{`${Localizer.get('Edit Meeting')}: ${
            meeting ? meeting.name : ''
          }`}</h3>
        </Modal.Header>
        <Modal.Body>
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Updating meeting...')}
            errorMessage={Localizer.get(errorMessage)}
          />
          <CorpMeetingForm
            type={'edit'}
            departmentId={departmentId}
            meeting={meeting}
            onSubmit={(payload, meetingId) =>
              this.handleFormSubmit(payload, meetingId)
            }
            onClose={() => this.handleClose()}
            disable={loading === LoadStates.Loading}
          />
        </Modal.Body>
      </Modal>
    );
  }
}

export default connect<
  IConnectedCorpEditMeetingModalProps,
  {},
  ICorpEditMeetingModalProps
>(AppMappers.UserMapper)(CorpEditMeetingModal);
