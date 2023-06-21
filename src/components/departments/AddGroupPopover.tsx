import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  Popover,
  ApiHelpers,
  LoadStates,
  LoadIndicator,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
// TODO tech debt refactor to GenericModal

interface IAddGroupProps extends DispatchProp<any> {}

interface IAddGroupState {
  name: string;
  saving: LoadStates;
  errorMessage: string;
}

class AddGroupPopover extends SrUiComponent<IAddGroupProps, IAddGroupState> {
  initialState() {
    return {
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
    };
  }

  cancel() {
    this.set({
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
    });
    (this.refs['add-button'] as HTMLButtonElement).click();
  }

  async addGroup() {
    const name = this.state.name || '';
    if (name.trim().length === 0) {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: 'Please enter a valid group name.',
      });
      return;
    }
    this.setPartial({ saving: LoadStates.Loading });
    const resp = await ApiHelpers.create('departments/tags', { name });
    if (resp.good) {
      this.set({
        name: undefined,
        saving: LoadStates.Unloaded,
        errorMessage: undefined,
      });
      (this.refs['add-button'] as HTMLButtonElement).click();
      this.props.dispatch(DepartmentsActions.getDepartments());
    } else {
      this.setPartial({ saving: LoadStates.Failed });
    }
  }

  performRender() {
    const content = (
      <div>
        <input
          autoFocus
          className="form-control"
          type="text"
          value={this.state.name || ''}
          readOnly={this.state.saving === LoadStates.Loading}
          onChange={(e) => this.setPartial({ name: e.target.value })}
          placeholder="Group name"
        />
        <br />
        {this.state.saving !== LoadStates.Loading ? (
          <div className="margin margin-bottom-sm">
            <Button bsStyle="success" onClick={() => this.addGroup()}>
              {Localizer.get('Add Group')}
            </Button>
            <Button bsStyle="default" onClick={() => this.cancel()}>
              {Localizer.get('Cancel')}
            </Button>
          </div>
        ) : null}
        <LoadIndicator
          state={this.state.saving}
          loadingMessage={Localizer.get('Adding group...')}
          errorMessage={Localizer.get(
            this.state.errorMessage || 'There was a problem adding the group.'
          )}
        />
      </div>
    );

    return (
      <Popover
        id="add-dept-po"
        rootClose={false}
        placement="bottom"
        content={content}
        title={Localizer.get('Add new group')}
      >
        <button ref="add-button" className="btn btn-info">
          {Localizer.get('Add Group')}
        </button>
      </Popover>
    );
  }
}

export default connect<any, void, IAddGroupProps>(() => {
  return {};
})(AddGroupPopover);
