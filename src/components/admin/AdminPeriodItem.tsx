import { SrUiComponent } from 'react-strontium';
import * as React from 'react';
import IPeriod from '../../models/IPeriod';

interface IAdminPeriodItemProps {
  period: IPeriod;
}

interface IAdminPeriodItemState {}

export default class AdminPeriodItem extends SrUiComponent<
  IAdminPeriodItemProps,
  IAdminPeriodItemState
> {
  performRender() {
    return (
      <div className="admin-period-item row">
        <div className="col-sm-6">{this.props.period.name}</div>
        <div className="col-sm-6"></div>
      </div>
    );
  }
}
