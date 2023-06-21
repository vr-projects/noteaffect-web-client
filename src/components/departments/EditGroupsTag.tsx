import * as React from 'react';
import { Button, Clearfix } from 'react-bootstrap';
import { FaPlus, FaMinus } from 'react-icons/fa';
import { SrUiComponent } from 'react-strontium';
import IAdminTag from '../../models/IAdminTag';
import Localizer from '../../utilities/Localizer';

interface IEditGroupsTagProps {
  tag: IAdminTag;
  selected?: boolean;
  onClick: (tag: IAdminTag) => void;
}

interface IEditGroupsTagState {}

export default class EditGroupsTag extends SrUiComponent<
  IEditGroupsTagProps,
  IEditGroupsTagState
> {
  performRender() {
    const {
      selected,
      tag,
      tag: { name: tagName },
      onClick,
    } = this.props;

    return (
      <div className="edit-groups-tag">
        <div className="col-sm-8">{tagName}</div>
        <div className="col-sm-4 text-right">
          <Button
            bsStyle={selected === true ? 'warning' : 'info'}
            onClick={() => onClick(tag)}
          >
            {selected ? <FaMinus /> : <FaPlus />}
            {Localizer.get(selected === true ? 'Remove' : 'Add')}
          </Button>
        </div>
        <Clearfix />
      </div>
    );
  }
}
