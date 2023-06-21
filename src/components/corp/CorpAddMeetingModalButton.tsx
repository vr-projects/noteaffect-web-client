import React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import CorpAddMeetingModal from './CorpAddMeetingModal';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import AppMappers from '../../mappers/AppMappers';

interface IConnectedCorpAddMeetingModalButtonProps extends DispatchProp<any> {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ICorpAddMeetingButtonProps {
  departmentId?: number;
  disabled?: boolean;
  onModalClose?: (meetingId) => void; // needed for dashboard to call next modal
  shouldBroadcastAdded: boolean; // needed to refresh list in background
  className?: string;
}

interface ICorpAddMeetingButtonState {
  isAddMeetingModalOpen: boolean;
}

class CorpAddMeetingModalButton extends SrUiComponent<
  IConnectedCorpAddMeetingModalButtonProps & ICorpAddMeetingButtonProps,
  ICorpAddMeetingButtonState
> {
  initialState() {
    return {
      isAddMeetingModalOpen: false,
    };
  }

  openModal() {
    this.setState({ isAddMeetingModalOpen: true });
  }

  handleClose(createdMeetingId?) {
    const { onModalClose } = this.props;
    // closed without saving
    if (createdMeetingId === undefined) {
      return this.setPartial({
        isAddMeetingModalOpen: false,
      });
    }
    // closed with saving
    this.setPartial({
      isAddMeetingModalOpen: false,
    });
    onModalClose(createdMeetingId);
  }

  performRender() {
    const { departments } = this.props.userInformation.toJS();
    const {
      departmentId = departments[0].id,
      shouldBroadcastAdded,
      className = '',
    } = this.props;
    const { isAddMeetingModalOpen } = this.state;

    return (
      <div className={`corp-add-meeting-modal-button ${className}`}>
        <Button bsStyle="success" onClick={() => this.openModal()}>
          <FaPlus />
          <span>&nbsp;{Localizer.get('Add Meeting')}</span>
        </Button>
        <CorpAddMeetingModal
          departmentId={departmentId}
          show={isAddMeetingModalOpen}
          onClose={(createdMeetingId) => this.handleClose(createdMeetingId)}
          shouldBroadcastAdded={shouldBroadcastAdded}
        />
      </div>
    );
  }
}

export default connect<
  IConnectedCorpAddMeetingModalButtonProps,
  void,
  ICorpAddMeetingButtonProps
>(AppMappers.AppMapper)(CorpAddMeetingModalButton);
