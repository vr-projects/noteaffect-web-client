import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import { SrUiComponent, Popover, ApiHelpers } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IDepartment from '../../models/IDepartment';
import IPeriod from '../../models/IPeriod';
import AdminMappers from '../../mappers/AdminMappers';
import * as AdminActions from '../../store/admin/AdminActions';

interface IAddSeriesProps extends DispatchProp<any> {
  periods: IPeriod[];
  departments: IDepartment[];
}

interface IAddSeriesState {
  departmentId: any;
  periodId: any;
  name: string;
}

class AddSeriesPopover extends SrUiComponent<IAddSeriesProps, IAddSeriesState> {
  initialState() {
    return {
      periodId: this.props.periods[0].id,
      departmentId: this.props.departments[0].id,
      name: undefined,
    };
  }

  async addSeries() {
    const name = this.state.name;
    const periodId = this.state.periodId;
    const departmentId = this.state.departmentId;
    document.getElementsByTagName('body')[0].click();
    this.setPartial({ name: undefined });
    const resp = await ApiHelpers.create(`series`, {
      name,
      periodId,
      departmentId,
    });
    if (resp.good) {
      this.props.dispatch(AdminActions.loadData());
    }
  }

  performRender() {
    const content = (
      <div>
        <div className="form-group">
          <label className="col-sm-4 control-label">
            {Localizer.get('Department')}
          </label>
          <div className="col-sm-8">
            <select
              className="form-control"
              value={this.state.departmentId}
              onChange={(e) =>
                this.setPartial({
                  departmentId: e.target.value,
                })
              }
            >
              {this.props.departments.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="col-sm-4 control-label">
            {Localizer.get('Period')}
          </label>
          <div className="col-sm-8">
            <select
              className="form-control"
              value={this.state.periodId}
              onChange={(e) => this.setPartial({ periodId: e.target.value })}
            >
              {this.props.periods.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <input
          type="text"
          className="form-control"
          value={this.state.name || ''}
          onChange={(e) => this.setPartial({ name: e.target.value })}
          placeholder="Series name"
        />
        <br />
        <Button bsStyle="success" onClick={() => this.addSeries()}>
          {Localizer.get('Add Series')}
        </Button>
      </div>
    );
    return (
      <Popover
        id="add-series-po"
        placement="top"
        content={content}
        title="Add new series"
      >
        <Button bsStyle="info">{Localizer.get('Add Series')}</Button>
      </Popover>
    );
  }
}

export default connect<any, void, IAddSeriesProps>(
  AdminMappers.AddSeriesMapper
)(AddSeriesPopover);
