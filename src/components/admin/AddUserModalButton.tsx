import * as React from 'react';
import { Button } from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import {
  SrUiComponent,
  ApiHelpers,
  LoadStates,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import GenericModal from '../controls/GenericModal';

interface IAddUserModalButtonProps {}

interface IAddUserModalButtonState {
  showModal: boolean;
  loading: LoadStates;
  email: string;
}

export default class AddUserModalButton extends SrUiComponent<
  IAddUserModalButtonProps,
  IAddUserModalButtonState
> {
  initialState() {
    return { showModal: false, email: undefined, loading: LoadStates.Unloaded };
  }

  cancel() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setState({
      showModal: false,
      email: undefined,
      loading: LoadStates.Unloaded,
    });
  }

  async addEmail() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const email = this.state.email;
    const resp = await ApiHelpers.create(`admin/users`, { email });

    if (resp.good) {
      await this.setPartialAsync({
        email: undefined,
        loading: LoadStates.Unloaded,
      });
      this.getRef<HTMLButtonElement>('add-button').click();
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const { showModal, loading, email } = this.state;

    return (
      <div className="add-user-modal-button">
        <Button
          className="add-user-button"
          bsStyle="success"
          onClick={() => this.setPartial({ showModal: true })}
        >
          <FaPlus />
          <span className="ml-1">{Localizer.get('Add User')}</span>
        </Button>

        <GenericModal
          show={showModal}
          confirmButtonDisable={loading === LoadStates.Loading}
          modalTitle={Localizer.get('Add users by email')}
          hasCloseButton={true}
          onCloseClicked={() => this.cancel()}
          hasConfirmButton={true}
          onConfirmClicked={() => this.addEmail()}
        >
          <h3>
            {Localizer.get(
              'Unregistered users will be sent an invitation to join NoteAffect'
            )}
          </h3>
          <textarea
            disabled={loading === LoadStates.Loading}
            className="form-control resize-vertical"
            autoFocus
            value={email || ''}
            onChange={(e) => this.setState({ email: e.target.value })}
            placeholder="Email addresses (separate by line, comma, or semi-colon)"
          />
          <LoadMask state={loading} />
          <LoadIndicator
            state={loading}
            loadingMessage={Localizer.get('Adding users(s)...')}
            errorMessage={Localizer.get(
              'Something went wrong.  Please try again later.'
            )}
          />
        </GenericModal>
      </div>
    );
  }
}
