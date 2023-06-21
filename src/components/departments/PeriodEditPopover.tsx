import * as React from 'react';
import Datetime from 'react-datetime';
import moment from 'moment';
import { Button } from 'react-bootstrap';
import { FaPen } from 'react-icons/fa';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  LoadMask,
  Popover,
} from 'react-strontium';
import ApiHelpers from 'react-strontium/dist/api/ApiHelpers';
import Localizer from '../../utilities/Localizer';
import { DispatchProp, connect } from 'react-redux';
import * as DepartmentsActions from '../../store/departments/DepartmentsActions';
import IPeriod from '../../models/IPeriod';

interface IPeriodEditProps extends DispatchProp<any> {
  period: IPeriod;
}

interface IPeriodEditState {
  name: string;
  start: number;
  end: number;
  loading: LoadStates;
  errorMessage: string;
}

class PeriodEditPopover extends SrUiComponent<
  IPeriodEditProps,
  IPeriodEditState
> {
  initialState() {
    return {
      name: this.props.period.name,
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
      start: this.props.period.start,
      end: this.props.period.end,
    };
  }

  onNewProps(props: IPeriodEditProps) {
    if (props.period) {
      this.setPartial({
        name: props.period.name,
        start: props.period.start,
        end: props.period.end,
      });
    }
  }

  cancel() {
    this.setState({
      name: this.props.period.name,
      loading: LoadStates.Unloaded,
      errorMessage: undefined,
    });
    (this.refs['open-button'] as HTMLButtonElement).click();
  }

  async save() {
    const name = this.state.name || '';
    if (name.trim().length === 0) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get('Please enter a valid period name.'),
      });
      return;
    }

    if (!this.state.start || !this.state.end) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get(
          "Please select the period's starting and ending dates."
        ),
      });
      return;
    }

    if (this.state.start >= this.state.end) {
      this.setPartial({
        loading: LoadStates.Failed,
        errorMessage: Localizer.get(
          "Please ensure the period's start is before the its end."
        ),
      });
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, errorMessage: undefined });
    const resp = await ApiHelpers.update(`periods/${this.props.period.id}`, {
      name: this.state.name,
      start: this.state.start,
      end: this.state.end,
    });
    if (resp.good) {
      this.setState({
        name: undefined,
        loading: LoadStates.Unloaded,
        errorMessage: undefined,
      });
      (this.refs['open-button'] as HTMLButtonElement).click();
      this.props.dispatch(DepartmentsActions.getDepartments());
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const poContent = (
      <>
        <div className="rel">
          <p className="helper-message">{Localizer.get('Period name')}</p>
          <input
            autoFocus
            className="form-control"
            type="text"
            value={this.state.name || ''}
            readOnly={this.state.loading === LoadStates.Loading}
            onChange={(e) => this.setPartial({ name: e.target.value })}
            placeholder="Period name"
          />
          <br />
          <p className="helper-message">{Localizer.get('Start date')}</p>
          <Datetime
            defaultValue={moment(this.state.start * 1000)}
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
            defaultValue={moment(this.state.end * 1000)}
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
          {this.state.loading !== LoadStates.Loading ? (
            <div className="margin margin-top-sm margin-bottom-sm">
              <Button bsStyle="info" onClick={() => this.save()}>
                {Localizer.get('Save')}
              </Button>
              <Button bsStyle="default" onClick={() => this.cancel()}>
                {Localizer.get('Cancel')}
              </Button>
            </div>
          ) : null}
          <LoadMask state={this.state.loading} />
        </div>
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.get('Saving name...')}
          errorMessage={
            this.state.errorMessage ||
            Localizer.get(
              'There was a problem saving the name.  Please try later.'
            )
          }
        />
      </>
    );

    return (
      <Popover
        title={Localizer.get('Rename Period')}
        rootClose={false}
        id="update-lecture-name"
        content={poContent}
      >
        <button ref="open-button" className="btn btn-link na-btn-reset-width">
          <FaPen className="light" />
        </button>
      </Popover>
    );
  }
}

export default connect<any, void, IPeriodEditProps>(() => {
  return {};
})(PeriodEditPopover);
