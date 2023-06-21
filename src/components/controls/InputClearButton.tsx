import React from 'react';
import { Button } from 'react-bootstrap';
import { FaTimes } from 'react-icons/fa';

interface IInputClearButtonProps {
  handleClick: () => void;
  className?: string | null;
}

const InputClearButton = ({
  handleClick,
  className,
}: IInputClearButtonProps) => (
  <Button onClick={handleClick} className={className ? className : ''}>
    <FaTimes />
  </Button>
);

export default InputClearButton;
