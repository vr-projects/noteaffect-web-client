import * as React from 'react';
import { connect, DispatchProp } from 'react-redux';
import { Button } from 'react-bootstrap';
import { SrUiComponent, Popover, ApiHelpers } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import * as AdminActions from '../../store/admin/AdminActions';

interface IAddPeriodProps extends DispatchProp<any> {}

interface IAddPeriodState {
  name: string;
}

class AddPeriodPopover extends SrUiComponent<IAddPeriodProps, IAddPeriodState> {
  async addPeriod() {
    const name = this.state.name;
    document.getElementsByTagName('body')[0].click();
    this.setPartial({ name: undefined });
    const resp = await ApiHelpers.create(`periods`, { name });
    if (resp.good) {
      this.props.dispatch(AdminActions.loadData());
    }
  }

  initialState() {
    return {
      name: undefined,
    };
  }

  performRender() {
    const content = (
      <div>
        <input
          className="form-control"
          type="text"
          value={this.state.name || ''}
          onChange={(e) => this.setPartial({ name: e.target.value })}
          placeholder="Period name"
        />
        <br />
        <button onClick={() => this.addPeriod()} className="btn btn-success">
          Add Period
        </button>
      </div>
    );
    return (
      <Popover
        id="add-period-po"
        placement="top"
        content={content}
        title="Add new period"
      >
        <Button bsStyle="info">{Localizer.get('Add Period')}</Button>
      </Popover>
    );
  }
}

export default connect<any, void, IAddPeriodProps>(() => {
  return {};
})(AddPeriodPopover);
