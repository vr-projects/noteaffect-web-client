import React from 'react';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { ToggleButtonGroup, ToggleButton } from 'react-bootstrap';

export interface IOption {
  label: string;
  value: string;
  style?: 'primary' | 'info' | 'success' | 'warning' | 'danger';
}

interface IMultiRadioTogglerProps {
  options: IOption[];
  defaultOptionIndex?: number | null;
  label?: string;
  onToggled: (value) => void;
  disable: boolean;
  className?: string;
}

interface IMultiRadioTogglerState {
  selectedValue: string;
}

class MultiRadioToggler extends React.Component<
  IMultiRadioTogglerProps,
  IMultiRadioTogglerState
> {
  state = {
    selectedValue:
      isNull(this.props.defaultOptionIndex) ||
      isUndefined(this.props.defaultOptionIndex)
        ? null
        : this.props.options[this.props.defaultOptionIndex].value,
  };

  handleToggle(selectedValue) {
    const { onToggled } = this.props;
    this.setState({
      selectedValue,
    });
    onToggled(selectedValue);
  }

  render() {
    const { label, options, disable = false, className = '' } = this.props;
    const { selectedValue } = this.state;

    return (
      <div className={`multi-radio-toggler ${className}`}>
        {label && (
          <span className="multi-radio-toggler--label mx-1">
            <span className="multi-radio-toggler--label-text">{label}</span>
          </span>
        )}
        <div className="multi-radio-toggler--toggles">
          <ToggleButtonGroup
            type="radio"
            name="multiradio-toggler"
            onChange={(newValue) => this.handleToggle(newValue)}
          >
            {options.map((option, index) => (
              <ToggleButton
                key={`${index}-${option.value}`}
                value={option.value}
                disabled={disable}
                className={`na-btn-reset-width btn-${
                  selectedValue === option.value ? option.style : 'default'
                }`}
              >
                <span>{option.label}</span>
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        </div>
      </div>
    );
  }
}

export default MultiRadioToggler;
