import * as React from 'react';
import {
  Button,
  Alert,
  FormGroup,
  ControlLabel,
  FormControl,
} from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  LoadMask,
  Animated,
} from 'react-strontium';
import ApiHelpers from 'react-strontium/dist/api/ApiHelpers';
import IDepartment from '../../models/IDepartment';
import Localizer from '../../utilities/Localizer';
import { DispatchProp, connect } from 'react-redux';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
import GenericModal from '../controls/GenericModal';

interface IDepartmentRenameModalButtonProps extends DispatchProp<any> {
  department: IDepartment;
}

interface IDepartmentRenameModalButtonState {
  name: string;
  loading: LoadStates;
  errorMessage: string;
  showModal: boolean;
}

class DepartmentRenameModalButton extends SrUiComponent<
  IDepartmentRenameModalButtonProps,
  IDepartmentRenameModalButtonState
> {
  initialState() {
    return {
      name: this.props.department.name || '',
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
      showModal: false,
    };
  }

  onNewProps(props: IDepartmentRenameModalButtonProps) {
    if (props.department) {
      this.setPartial({ name: props.department.name });
    }
  }

  handleRenameChange(e: any) {
    e.preventDefault();

    this.setPartial({ name: e.target.value });
  }

  cancel() {
    this.setState({
      name: this.props.department.name,
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
      showModal: false,
    });
  }

  async save() {
    if ((this.state.name || '').trim().length === 0) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter a present and valid name.'),
      });
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, errorMessage: undefined });

    try {
      const resp = await ApiHelpers.update(
        `departments/${this.props.department.id}`,
        { name: this.state.name }
      );

      if (!resp.good) {
        throw new Error('Error updating department');
      }

      this.setState({
        // name: undefined,
        loading: LoadStates.Succeeded,
        errorMessage: null,
      });

      this.props.dispatch(DepartmentsActions.getDepartments());

      setTimeout(() => {
        this.setState({
          name: undefined,
        });
        this.cancel();
      }, 2000);
    } catch (error) {
      console.error(error);
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const { showModal, loading, name } = this.state;

    return (
      <span className="department-rename-modal-button">
        <Button
          className="department-rename-button"
          bsStyle="link"
          onClick={() => this.setPartial({ showModal: true })}
        >
          <FaPen className="light" />
        </Button>

        <GenericModal
          show={showModal}
          confirmButtonDisable={loading === LoadStates.Loading}
          modalTitle={Localizer.get('Rename Department')}
          hasCloseButton={true}
          onCloseClicked={() => this.cancel()}
          hasConfirmButton={true}
          onConfirmClicked={() => this.save()}
        >
          <div className="rel">
            {loading === LoadStates.Succeeded && (
              <Animated in>
                <Alert bsStyle="success">
                  {Localizer.get('Successfully renamed department')}
                </Alert>
              </Animated>
            )}
            {loading === LoadStates.Failed && (
              <Animated in>
                <Alert bsStyle="danger">
                  {Localizer.get('Error saving renamed department')}
                </Alert>
              </Animated>
            )}
            {loading === LoadStates.Loading && (
              <Animated in>
                <LoadIndicator
                  state={loading}
                  loadingMessage={Localizer.get('Saving name...')}
                />
              </Animated>
            )}

            <form noValidate onSubmit={(e) => e.preventDefault()}>
              <FormGroup controlId="formControlRenameDepartment">
                <ControlLabel>{Localizer.get('Department name')}</ControlLabel>
                <FormControl
                  placeholder={Localizer.get('Department name')}
                  readOnly={loading === LoadStates.Loading}
                  autoFocus
                  type="text"
                  value={name || ''}
                  onChange={(e) => this.handleRenameChange(e)}
                />
              </FormGroup>
            </form>
          </div>
        </GenericModal>
      </span>
    );
  }
}

export default connect<any, void, IDepartmentRenameModalButtonProps>(() => {
  return {};
})(DepartmentRenameModalButton);
