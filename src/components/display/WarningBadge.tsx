import * as React from 'react';
import { BsBellFill } from 'react-icons/bs';

interface IWarningBadge {
  show: boolean;
  size: 'small' | 'medium' | 'large';
  position: 'bottom-right' | 'bottom-left';
}

const WarningBadge = ({
  show,
  size = 'medium',
  position = 'bottom-right',
}: IWarningBadge) => {
  if (!show) return null;

  return (
    <span className={`warning-badge ${size} ${position}`}>
      <BsBellFill className="icon" />
    </span>
  );
};

export default WarningBadge;
