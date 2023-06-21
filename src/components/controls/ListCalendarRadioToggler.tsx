import React from 'react';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';
import { FaList, FaRegCalendarAlt } from 'react-icons/fa';

export enum VIEW_TYPE {
  'LIST' = 'list',
  'CALENDAR' = 'calendar',
}

interface IListCalendarRadioTogglerProps {
  onToggled: (value) => void;
  className?: string;
}

interface IListCalendarRadioTogglerState {
  value: VIEW_TYPE;
}

class ListCalendarRadioToggler extends React.Component<
  IListCalendarRadioTogglerProps,
  IListCalendarRadioTogglerState
> {
  state = {
    value: VIEW_TYPE.LIST,
  };

  handleToggle(value) {
    this.setState({
      value,
    });
    this.props.onToggled(value);
  }

  render() {
    const { className = '' } = this.props;
    const { value } = this.state;

    return (
      <div className={`list-calendar-radio-toggler ${className}`}>
        <span className="title">VIEW</span>
        <ToggleButtonGroup
          type="radio"
          name="list-calendar"
          value={value}
          onChange={(value) => this.handleToggle(value)}
        >
          <ToggleButton value={VIEW_TYPE.LIST} className={`na-btn-reset-width`}>
            <FaList />
          </ToggleButton>
          <ToggleButton
            value={VIEW_TYPE.CALENDAR}
            className={`na-btn-reset-width`}
          >
            <FaRegCalendarAlt />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    );
  }
}

export default ListCalendarRadioToggler;
