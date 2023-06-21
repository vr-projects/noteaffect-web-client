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
import Datetime from 'react-datetime';
import moment from 'moment';
import Localizer from '../../utilities/Localizer';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
// TODO tech debt refactor to GenericModal

interface IAddPeriodProps extends DispatchProp<any> {}

interface IAddPeriodState {
  name: string;
  start: number;
  end: number;
  saving: LoadStates;
  errorMessage: string;
}

class AddPeriodPopover extends SrUiComponent<IAddPeriodProps, IAddPeriodState> {
  initialState() {
    return {
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
      start: undefined,
      end: undefined,
    };
  }

  cancel() {
    this.set({
      name: undefined,
      saving: LoadStates.Unloaded,
      errorMessage: undefined,
      start: undefined,
      end: undefined,
    });
    (this.refs['add-button'] as HTMLButtonElement).click();
  }

  async addPeriod() {
    const name = this.state.name || '';
    if (name.trim().length === 0) {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter a valid period name.'),
      });
      return;
    }

    if (!this.state.start || !this.state.end) {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: Localizer.get(
          "Please select the period's starting and ending dates."
        ),
      });
      return;
    }

    if (this.state.start >= this.state.end) {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: Localizer.get(
          "Please ensure the period's start is before the its end."
        ),
      });
      return;
    }

    this.setPartial({ saving: LoadStates.Loading });
    const resp = await ApiHelpers.create(`periods`, {
      name: name,
      start: this.state.start,
      end: this.state.end,
    });
    if (resp.good) {
      this.set({
        name: undefined,
        saving: LoadStates.Unloaded,
        errorMessage: undefined,
        start: undefined,
        end: undefined,
      });
      (this.refs['add-button'] as HTMLButtonElement).click();
      this.props.dispatch(DepartmentsActions.getDepartments());
    } else {
      this.setPartial({
        saving: LoadStates.Failed,
        errorMessage: Localizer.get('An error occurred adding the period.'),
      });
    }
  }

  performRender() {
    const content = (
      <div>
        <p className="helper-message">{Localizer.get('Period name')}</p>
        <input
          autoFocus
          className="form-control"
          type="text"
          value={this.state.name || ''}
          readOnly={this.state.saving === LoadStates.Loading}
          onChange={(e) => this.setPartial({ name: e.target.value })}
          placeholder="Period name"
        />
        <br />
        <p className="helper-message">{Localizer.get('Start date')}</p>
        <Datetime
          closeOnSelect
          inputProps={{
            readOnly: true,
            placeholder: Localizer.get('Start date'),
          }}
          timeFormat={false}
          onChange={(d) =>
            this.setPartial({ start: (d as moment.Moment).unix() })
          }
        />
        <br />
        <p className="helper-message">{Localizer.get('End date')}</p>
        <Datetime
          closeOnSelect
          inputProps={{
            readOnly: true,
            placeholder: Localizer.get('End date'),
          }}
          timeFormat={false}
          onChange={(d) =>
            this.setPartial({ end: (d as moment.Moment).unix() })
          }
        />
        <br />
        {this.state.saving !== LoadStates.Loading ? (
          <div className="margin margin-bottom-sm">
            <Button bsStyle="Success" onClick={() => this.addPeriod()}>
              {Localizer.get('Add Period')}
            </Button>
            <Button bsStyle="default" onClick={() => this.cancel()}>
              {Localizer.get('Cancel')}
            </Button>
          </div>
        ) : null}
        <LoadIndicator
          state={this.state.saving}
          loadingMessage={Localizer.get('Adding department...')}
          errorMessage={Localizer.get(
            this.state.errorMessage || 'There was a problem adding the period.'
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
        title={Localizer.get('Add new academic period')}
      >
        <button ref="add-button" className="btn btn-info">
          {Localizer.get('Add Period')}
        </button>
      </Popover>
    );
  }
}

export default connect<any, void, IAddPeriodProps>(() => {
  return {};
})(AddPeriodPopover);
