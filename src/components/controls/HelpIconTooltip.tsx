import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaQuestionCircle } from 'react-icons/fa';

interface HelpIconTooltipProps {
  tooltipText: string;
  srText?: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

const HelpIconTooltip = ({
  tooltipText,
  srText = tooltipText,
  placement = 'bottom',
  className = '',
}: HelpIconTooltipProps) => {
  return (
    <OverlayTrigger
      placement={placement}
      overlay={
        <Tooltip id="tooltip">
          <span>{tooltipText}</span>
        </Tooltip>
      }
    >
      <span
        className={`btn btn-link na-btn-reset-width na-help-icon ${className}`}
        tabIndex={0}
      >
        <FaQuestionCircle />
        <span className="sr-only">{srText}</span>
      </span>
    </OverlayTrigger>
  );
};

export default HelpIconTooltip;
