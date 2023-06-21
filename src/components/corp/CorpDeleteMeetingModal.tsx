/** corp version of AddCoursePopover */
import * as React from 'react';
import { connect } from 'react-redux';
import { FaTimes, FaTrashAlt } from 'react-icons/fa';
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
import { Modal, Button } from 'react-bootstrap';
import ICourse from '../../models/ICourse';
import Localizer from '../../utilities/Localizer';
import AppBroadcastEvents from '../../broadcastEvents/AppBroadcastEvents';

interface IConnectedCorpDeleteMeetingModalProps {
  userInformation?: IImmutableObject<IUserInformation>;
}
interface ICorpDeleteMeetingModalProps {
  meeting: ICourse | null;
  show: boolean;
  onClose: (number?) => void;
}

interface ICorpDeleteMeetingModalState {
  loading: LoadStates;
}

class CorpDeleteMeetingModal extends SrUiComponent<
  ICorpDeleteMeetingModalProps & IConnectedCorpDeleteMeetingModalProps,
  ICorpDeleteMeetingModalState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
    };
  }

  handleClose() {
    this.setPartial({
      ...this.initialState(),
    });
    this.props.onClose();
  }

  async handleFormSubmit(payload) {
    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });

      const resp = await ApiHelpers.delete(`series/${payload}`);
      if (!resp.good) {
        throw new Error('Error deleting meeting.');
      }

      this.broadcast(AppBroadcastEvents.MeetingDeleted);
      this.setPartial({
        loading: LoadStates.Succeeded,
      });
      this.handleClose(); // Pass added meeting id along to next modal
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
      console.error(err);
    }
  }

  performRender() {
    const { meeting, show } = this.props;
    const { loading } = this.state;
    return (
      <Modal show={show} backdrop={'static'} onHide={() => this.handleClose()}>
        <Modal.Header>
          <h3>{`${Localizer.get('Delete Meeting')}: ${
            meeting ? meeting.name : ''
          }`}</h3>
        </Modal.Header>
        <Modal.Body>
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Loading meeting...')}
            errorMessage={Localizer.get(
              'Something went wrong loading the meeting.  Please try again later.'
            )}
          />
          <p>
            {Localizer.get(
              'Deleting this meeting will delete all content associated to the meeting including presentations, questions, analytics, as well participant access to the meeting and their personal notes.'
            )}
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button bsStyle="default" onClick={() => this.handleClose()}>
            <FaTimes />
            <span className="ml-1">{Localizer.get('Cancel')}</span>
          </Button>
          <Button
            bsStyle="danger"
            onClick={() => this.handleFormSubmit(meeting.id)}
          >
            <FaTrashAlt />
            <span className="ml-1">{Localizer.get('Delete')}</span>
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default connect<
  IConnectedCorpDeleteMeetingModalProps,
  {},
  ICorpDeleteMeetingModalProps
>(AppMappers.UserMapper)(CorpDeleteMeetingModal);
