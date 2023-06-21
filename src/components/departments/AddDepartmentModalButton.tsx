import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { FaPlus } from 'react-icons/fa';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  ApiHelpers,
  LoadStates,
  LoadIndicator,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
import GenericModal from '../controls/GenericModal';

interface IAddDepartmentModalButtonProps extends DispatchProp<any> {}

interface IAddDepartmentModalButtonState {
  name: string;
  saving: LoadStates;
  errorMessage: string;
  showModal: boolean;
}

class AddDepartmentModalButton extends SrUiComponent<
  IAddDepartmentModalButtonProps,
  IAddDepartmentModalButtonState
> {
  initialState() {
    return {
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
      showModal: false,
    };
  }

  cancel() {
    this.setPartial({
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
      showModal: false,
    });
  }

  async addDepartment() {
    const name = this.state.name || '';
    if (name.trim().length === 0) {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: 'Please enter a valid department name.',
      });
      return;
    }
    this.setPartial({ saving: LoadStates.Loading });

    try {
      const resp = await ApiHelpers.create(`departments`, { name });

      if (!resp.good) {
        throw new Error('Error adding department');
      }

      this.setPartial({
        name: undefined,
        saving: LoadStates.Unloaded,
        errorMessage: undefined,
      });
      this.props.dispatch(DepartmentsActions.getDepartments());
    } catch (error) {
      console.error(error);
      this.setPartial({ saving: LoadStates.Failed });
    }
  }

  performRender() {
    const { showModal } = this.state;

    return (
      <div className="add-department-modal-button">
        <Button
          bsStyle="success"
          onClick={() => this.setPartial({ showModal: true })}
        >
          <FaPlus />
          <span className="ml-1">{Localizer.get('Add Categorie')}</span>
        </Button>

        <GenericModal
          show={showModal}
          modalTitle={Localizer.get('Add Categorie')}
          hasCloseButton={true}
          onCloseClicked={() => this.cancel()}
          hasConfirmButton={true}
          onConfirmClicked={() => this.addDepartment()}
        >
          <div className="generic-modal-content">
            <input
              autoFocus
              className="form-control"
              type="text"
              value={this.state.name || ''}
              readOnly={this.state.saving === LoadStates.Loading}
              onChange={(e) => this.setPartial({ name: e.target.value })}
              placeholder="Categorie name"
            />
          </div>
          <LoadIndicator
            state={this.state.saving}
            loadingMessage={Localizer.get('Adding department...')}
            errorMessage={Localizer.get(
              this.state.errorMessage ||
                'There was a problem adding the department.'
            )}
          />
        </GenericModal>
      </div>
    );
  }
}

export default connect<any, void, IAddDepartmentModalButtonProps>(() => {
  return {};
})(AddDepartmentModalButton);
