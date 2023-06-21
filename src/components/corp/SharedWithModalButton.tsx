import React from 'react';
import { connect } from 'react-redux';
import isEmpty from 'lodash/isEmpty';
import isNull from 'lodash/isNull';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Button, Alert, ListGroup, ListGroupItem } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import AppMappers from '../../mappers/AppMappers';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IObserver from '../../models/IObserver';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';
import IconTooltip from '../controls/IconTooltip';

interface ISharedWithModalButtonProps {
  observers?: IObserver[];
  disable?: boolean;
  className?: string;
}

interface IConnectedSharedWithModalButtonProps {
  userInformation?: IImmutableObject<IUserInformation>;
}

interface ISharedWithModalButtonState {
  isSharedWithModalOpen: boolean;
}

class SharedWithModalButton extends SrUiComponent<
  ISharedWithModalButtonProps & IConnectedSharedWithModalButtonProps,
  ISharedWithModalButtonState
> {
  initialState() {
    return {
      isSharedWithModalOpen: false,
    };
  }

  openModal() {
    this.setState({ isSharedWithModalOpen: true });
  }

  handleClose() {
    this.setPartial({
      isSharedWithModalOpen: false,
    });
  }

  getRegisteredUsers(filteredObservers) {
    return filteredObservers.filter((o) => o.userId !== 0 && isNull(o.email));
  }

  getUnregisteredUsers(filteredObservers) {
    return filteredObservers.filter((o) => o.userId === 0 && !isNull(o.email));
  }

  performRender() {
    const { observers, disable, userInformation, className = '' } = this.props;
    const { isSharedWithModalOpen } = this.state;

    const currentUserId = userInformation.toJS().id;
    const filteredObservers = !isNull(observers)
      ? observers.filter((observer) => observer.userId !== currentUserId)
      : [];
    const registeredObservers = this.getRegisteredUsers(filteredObservers);
    const unregisteredObservers = this.getUnregisteredUsers(filteredObservers);
    const hasObservers = !isEmpty(filteredObservers);

    return (
      <div className={`shared-with-modal-button ${className}`}>
        <Button
          bsStyle="link"
          className="na-btn-reset-width"
          disabled={disable}
          onClick={() => this.openModal()}
        >
          <span>
            {Localizer.get('Shared with: ')}
            {filteredObservers.length}
          </span>
        </Button>
        <GenericModal
          show={isSharedWithModalOpen}
          modalTitle={Localizer.get('Presentations Shared With:')}
          onCloseClicked={() => this.handleClose()}
          hasCloseButton={true}
          hasConfirmButton={false}
        >
          {hasObservers && (
            <>
              {!isEmpty(registeredObservers) && (
                <>
                  <h2>{Localizer.get('Registered Observers')}</h2>
                  <ListGroup>
                    {registeredObservers.map((o, index) => (
                      <ListGroupItem
                        key={`registered-observer-${o.userId}-${index}`}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <span className="mr-1">
                          {o.firstName} {o.lastName}
                        </span>
                        <IconTooltip
                          tooltipText={`${
                            o.viewed
                              ? Localizer.get(
                                  'This person has viewed this presentation set.'
                                )
                              : Localizer.get(
                                  'This person has not yet viewed this presentation set.'
                                )
                          }`}
                          placement={`bottom`}
                          className={`text-${o.viewed ? 'success' : 'danger'}`}
                          icon={() => (o.viewed ? <FaEye /> : <FaEyeSlash />)}
                        />
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                </>
              )}
              {!isEmpty(unregisteredObservers) && (
                <>
                  <h2>{Localizer.get('Unregistered Observers')}</h2>
                  <ListGroup>
                    {unregisteredObservers.map((o, index) => (
                      <ListGroupItem
                        key={`unregistered-observer-${o.userId}-${index}`}
                      >
                        <span>{o.email}</span>
                      </ListGroupItem>
                    ))}
                  </ListGroup>
                </>
              )}
            </>
          )}

          {!hasObservers && (
            <Alert bsStyle="warning">
              {Localizer.get(
                'There are currently no observers to this meeting.'
              )}
            </Alert>
          )}
        </GenericModal>
      </div>
    );
  }
}

export default connect<
  IConnectedSharedWithModalButtonProps,
  {},
  ISharedWithModalButtonProps
>(AppMappers.UserMapper)(SharedWithModalButton);
