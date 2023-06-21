import * as React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface ITooltipWrapperProps {
  id: string;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  tooltipText: string;
  disabled?: boolean;
  hideTooltip?: boolean;
  children: React.ReactNode;
}

const TooltipWrapper = ({
  id,
  placement = 'bottom',
  tooltipText,
  disabled = false,
  hideTooltip = false,
  children,
}: ITooltipWrapperProps) => {
  return (
    <>
      {disabled || hideTooltip ? (
        <>{children}</>
      ) : (
        <OverlayTrigger
          delayShow={200}
          placement={placement}
          trigger={['hover', 'focus']}
          rootClose
          overlay={
            <Tooltip id={id}>
              <span>{tooltipText}</span>
            </Tooltip>
          }
        >
          {children}
        </OverlayTrigger>
      )}
    </>
  );
};

export default TooltipWrapper;
