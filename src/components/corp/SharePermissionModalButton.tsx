import * as React from 'react';
import 'moment-timezone';
import { connect } from 'react-redux';
import { Button } from 'react-bootstrap';
import { FaShare } from 'react-icons/fa';
import isNull from 'lodash/isNull';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import SharePermission from '../../enums/SharePermission';
import ISeries from '../../models/ICourse';
import { SrUiComponent, LoadStates } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import SharePresentationsByEmailModal from './SharePresentationsByEmailModal';
import SharePresentationsByParticipantsModal from './SharePresentationsByParticipantsModal';

interface IConnectedSharePermissionModalButtonProps {
  userInformation?: IImmutableObject<IUserInformation>;
}
interface ISharePermissionModalButtonProps {
  onClose?: (number?) => void;
  permissionCode: SharePermission | null;
  series: ISeries;
  disable?: boolean;
}

interface ISharePermissionModalButtonState {
  loading: LoadStates;
  showModal: boolean;
  showByEmailModal: boolean;
  showByParticipantsModal: boolean;
}

class SharePermissionModalButton extends SrUiComponent<
  ISharePermissionModalButtonProps & IConnectedSharePermissionModalButtonProps,
  ISharePermissionModalButtonState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      showModal: false,
      showByEmailModal: false,
      showByParticipantsModal: false,
    };
  }

  handleClose() {
    this.setState({ ...this.initialState() });
    this.props.onClose();
  }

  onShareClicked(permissionCode) {
    switch (true) {
      case permissionCode === SharePermission.Open:
      case permissionCode === SharePermission.Colleagues:
        this.setPartial({
          showByEmailModal: true,
        });
        break;
      case permissionCode === SharePermission.Participants:
        this.setPartial({
          showByParticipantsModal: true,
        });
        break;
      default:
        this.setPartial({
          showByEmailModal: false,
          showByParticipantsModal: false,
        });
        break;
    }
  }

  onSharePresentationsClosed() {
    this.setPartial({
      showByEmailModal: false,
      showByParticipantsModal: false,
    });
  }

  performRender() {
    const { permissionCode, series, disable = false } = this.props;
    const { showByEmailModal, showByParticipantsModal } = this.state;

    return (
      <>
        {!isNull(permissionCode) && permissionCode !== SharePermission.Closed && (
          <div className="share-permission-modal-button d-flex justify-content-end">
            <Button
              bsStyle="default"
              className="na-btn-reset-width"
              onClick={() => this.onShareClicked(permissionCode)}
              disabled={disable}
            >
              <FaShare />
              <span className="ml-1">{Localizer.get('Share')}</span>
            </Button>

            {/* Share Permissions Open and Colleagues */}
            <SharePresentationsByEmailModal
              show={showByEmailModal}
              series={series}
              permissionCode={permissionCode}
              onClose={() => this.onSharePresentationsClosed()}
            />

            {/* Share Permissions Participants */}
            <SharePresentationsByParticipantsModal
              show={showByParticipantsModal}
              series={series}
              permissionCode={permissionCode}
              onClose={() => this.onSharePresentationsClosed()}
            />
          </div>
        )}
      </>
    );
  }
}

export default connect<
  IConnectedSharePermissionModalButtonProps,
  {},
  ISharePermissionModalButtonProps
>(AppMappers.UserMapper)(SharePermissionModalButton);
