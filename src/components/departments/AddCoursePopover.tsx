import * as React from 'react';
import { Button } from 'react-bootstrap';
import {
  SrUiComponent,
  Popover,
  ApiHelpers,
  LoadStates,
  LoadMask,
  LoadIndicator,
} from 'react-strontium';
import { ADD_COURSE_POPOVER_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IPeriod from '../../models/IPeriod';
import IDepartment from '../../models/IDepartment';
import Numbers from '../../utilities/Numbers';

// TODO tech debt refactor to GenericModal
interface IAddSeriesState {
  loading: LoadStates;
  name: string;
  departmentId: number;
  periodId?: number;
  error: string;
}

interface IAddSeriesProps {
  isEduVersion: boolean;
  departments: IDepartment[];
  departmentId?: number;
  periods: IPeriod[];
  periodId?: number;
  onDone: () => void;
}

export default class AddCoursePopover extends SrUiComponent<
  IAddSeriesProps,
  IAddSeriesState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      name: undefined,
      departmentId: undefined,
      periodId: undefined,
      error: undefined,
    };
  }

  currentDepartmentId() {
    let id = this.state.departmentId || this.props.departmentId;
    if (!!id) {
      return id;
    }

    let picker = this.refs['department-picker'] as HTMLSelectElement;
    if (picker) {
      return Numbers.parse(
        (this.refs['department-picker'] as HTMLSelectElement).value
      );
    }

    return undefined;
  }

  currentPeriodId() {
    let id = this.state.periodId || this.props.periodId;
    if (!!id) {
      return id;
    }

    let picker = this.refs['period-picker'] as HTMLSelectElement;
    if (picker) {
      return Numbers.parse(
        (this.refs['period-picker'] as HTMLSelectElement).value
      );
    }

    return undefined;
  }

  cancel() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.set(this.initialState());
    this.getRef<HTMLButtonElement>('add-course-button').click();
  }

  async addSeries() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading, error: undefined });
    const name = this.state.name || '';
    if (name.trim().length === 0) {
      this.setPartial({
        loading: LoadStates.Failed,
        error: Localizer.getFormatted(ADD_COURSE_POPOVER_COMPONENT.ERROR_NAME),
      });
    }

    const resp = await ApiHelpers.create(
      `departments/${this.currentDepartmentId()}/series`,
      { name, periodId: this.currentPeriodId() }
    );
    if (resp.good) {
      this.set(this.initialState());
      this.getRef<HTMLButtonElement>('add-course-button').click();
      this.props.onDone();
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    const content = (
      <>
        <div className="rel">
          <input
            type="text"
            className="form-control"
            value={this.state.name || ''}
            onChange={(e) => this.setPartial({ name: e.target.value })}
            placeholder={Localizer.getFormatted(
              ADD_COURSE_POPOVER_COMPONENT.ERROR_NAME
            )}
          />
          <br />
          {!!this.props.departmentId ? null : (
            <>
              <p className="helper-message">{Localizer.get('Department')}</p>
              <select
                ref="department-picker"
                value={this.currentDepartmentId()}
                onChange={(e) =>
                  this.setPartial({
                    departmentId: Numbers.parse(e.target.value),
                  })
                }
              >
                {this.props.departments.map((d) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>
              <br />
            </>
          )}
          {!this.props.isEduVersion || !!this.props.periodId ? null : (
            <>
              <p className="helper-message">
                {Localizer.get('Academic Period')}
              </p>
              <select
                ref="period-picker"
                value={this.currentPeriodId()}
                onChange={(e) =>
                  this.setPartial({ periodId: Numbers.parse(e.target.value) })
                }
              >
                {this.props.periods.map((d) => (
                  <option key={d.id} value={d.id.toString()}>
                    {d.name}
                  </option>
                ))}
              </select>
              <br />
            </>
          )}
          <div className="margin margin-top-md">
            <Button bsStyle="success" onClick={() => this.addSeries()}>
              {Localizer.getFormatted(
                ADD_COURSE_POPOVER_COMPONENT.BUTTON_LABEL
              )}
            </Button>
            <Button onClick={() => this.cancel()} bsStyle="default">
              {Localizer.get('Cancel')}
            </Button>
          </div>
          <LoadMask state={this.state.loading} />
        </div>
        <LoadIndicator
          alertClassName="margin margin-top-md"
          state={this.state.loading}
          loadingMessage={Localizer.getFormatted(
            ADD_COURSE_POPOVER_COMPONENT.LOADING
          )}
          errorMessage={
            this.state.error ||
            Localizer.getFormatted(ADD_COURSE_POPOVER_COMPONENT.ERROR_SAVING)
          }
        />
      </>
    );
    return (
      <Popover
        id="add-course-to-dept-po"
        placement="bottom"
        content={content}
        title={Localizer.getFormatted(
          ADD_COURSE_POPOVER_COMPONENT.POPOVER_TITLE
        )}
        rootClose={false}
      >
        {/* // TODO tech debt needs refactor to react-bootstrap, no ref */}
        <button ref="add-course-button" className="btn btn-info">
          {Localizer.getFormatted(ADD_COURSE_POPOVER_COMPONENT.BUTTON_LABEL)}
        </button>
      </Popover>
    );
  }
}
