import React from 'react';
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Button,
  Alert,
} from 'react-bootstrap';
import { FaPlus } from 'react-icons/fa';
import { Animated } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import { TAB_GROUP_TYPE } from '../shared/EditParticipantsModal';

interface IAddEmailsFormGroupProps {
  controlId: string;
  validator: any | 'error' | null;
  label: string;
  emails: string;
  disabled: boolean;
  onChange: (e) => any;
  disableAddBtn?: () => boolean;
  validationError: boolean;
  errorMessage: string;
  btnAlignment?: 'start' | 'center' | 'end' | 'stretch';
  hideAddBtn?: boolean;
  className?: string;
  groupType?: TAB_GROUP_TYPE;
}

const AddEmailsFormGroup = ({
  controlId,
  validator,
  label,
  emails,
  disabled,
  onChange,
  disableAddBtn = () => false,
  validationError,
  errorMessage,
  btnAlignment = 'start',
  hideAddBtn = false,
  className = '',
  groupType = TAB_GROUP_TYPE.INDIVIDUAL,
}: IAddEmailsFormGroupProps) => {
  return (
    <FormGroup
      controlId={controlId}
      validationState={validator}
      className={`add-emails-form-group ${className} mb-2`}
    >
      <ControlLabel className="mt-2 mb-1">{label}</ControlLabel>

      <div className="textarea-button-container d-flex">
        <FormControl
          disabled={disabled}
          required
          value={emails}
          componentClass="textarea"
          className="resize-vertical"
          placeholder={
            groupType === TAB_GROUP_TYPE.INDIVIDUAL
              ? Localizer.get(
                  'Email addresses (separate by line, comma, or semi-colon)'
                )
              : Localizer.get(
                  'Distribution lists (separate by line, comma, or semi-colon)'
                )
          }
          onChange={(e) => onChange(e)}
        />
        {!hideAddBtn && (
          <Button
            type="submit"
            bsStyle="success"
            className={`add-button align-self-${btnAlignment} ml-1`}
            disabled={disableAddBtn()}
          >
            <FaPlus />
            <span>&nbsp;{Localizer.get('Add')}</span>
          </Button>
        )}
      </div>

      {validationError && (
        <Animated in>
          <Alert bsStyle="danger" className="mt-2">
            <p>{errorMessage}</p>
          </Alert>
        </Animated>
      )}
    </FormGroup>
  );
};

export default AddEmailsFormGroup;
