import React from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

interface ILinkProps {
  className?: string;
  href: string;
  target?: string;
  rel?: string;
  disabled?: boolean;
  disabledTooltipMessage?: string;
  children: React.ReactNode;
}

const Link = ({
  className = '',
  href,
  target = '_self',
  rel = 'noopener noreferrer',
  disabled = false,
  disabledTooltipMessage,
  children,
}: ILinkProps) => {
  return (
    <>
      {disabled ? (
        <OverlayTrigger
          placement="top"
          overlay={
            <Tooltip id="disabled-link">{disabledTooltipMessage}</Tooltip>
          }
        >
          <a
            className={`${className} link-disabled`}
            tabIndex={0}
            target={target}
            rel={rel}
            href={href}
            onClick={(e) => e.preventDefault()}
          >
            {children}
          </a>
        </OverlayTrigger>
      ) : (
        <a
          className={`${className}`}
          tabIndex={0}
          target={target}
          rel={rel}
          href={href}
        >
          {children}
        </a>
      )}
    </>
  );
};

export default Link;
