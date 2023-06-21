import React from 'react';
import { FaTimes } from 'react-icons/fa';
import { BsSearch } from 'react-icons/bs';
import { SrUiComponent } from 'react-strontium';
import {
  FormGroup,
  ControlLabel,
  InputGroup,
  FormControl,
  Button,
} from 'react-bootstrap';
import Localizer from '../../utilities/Localizer';

interface ISearchFilterInputProps {
  labelKey?: string; // Should tie to internationalization
  placeholder?: string;
  className?: string;
  updateCurrentVal: (val) => void;
  clearedInput: () => void;
}

interface ISearchFilterInputState {
  inputVal: string;
}

class SearchFilterInput extends SrUiComponent<
  ISearchFilterInputProps,
  ISearchFilterInputState
> {
  initialState() {
    return {
      inputVal: '',
    };
  }

  handleSearchInputChange(e) {
    this.setPartial({
      inputVal: e.target.value,
    });
    this.props.updateCurrentVal(e.target.value.toLowerCase());
  }

  handleClearInput() {
    this.setPartial({
      inputVal: '',
    });

    this.props.clearedInput();
  }

  onComponentWillUnmount() {
    this.handleClearInput();
  }

  performRender() {
    const {
      className = '',
      labelKey,
      placeholder = Localizer.get('Enter Search Term'),
    } = this.props;
    const { inputVal } = this.state;

    return (
      <div className={`search-filter-input ${className}`}>
        <FormGroup>
          {labelKey && <ControlLabel>{Localizer.get(labelKey)}</ControlLabel>}
          <InputGroup className="search-filter-input-container">
            <BsSearch className="search-filter-input-icon" />
            <FormControl
              type="text"
              value={inputVal}
              placeholder={placeholder}
              onChange={(e) => this.handleSearchInputChange(e)}
              className={`bt tn-default search-filter-input-field`}
            />

            <Button
              type="reset"
              className="na-btn-reset-width btn-light-danger"
              onClick={() => this.handleClearInput()}
              disabled={inputVal === ''}
            >
              <FaTimes />
            </Button>
          </InputGroup>
        </FormGroup>
      </div>
    );
  }
}

export default SearchFilterInput;
