import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface IconTooltipProps {
  tooltipText: string;
  srText?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
  icon: React.ReactType;
}

const IconTooltip = ({
  tooltipText,
  srText = tooltipText,
  placement = 'bottom',
  className = '',
  icon: Icon,
}: IconTooltipProps) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip id="tooltip">
          <span>{tooltipText}</span>
        </Tooltip>
      }
    >
      <span className={`${className}`} tabIndex={0}>
        <Icon />
        <span className="sr-only">{srText}</span>
      </span>
    </OverlayTrigger>
  );
};

export default IconTooltip;
