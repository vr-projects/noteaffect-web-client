import * as React from 'react';
import { Button } from 'react-bootstrap';

interface IDrilldownMenuItemProps {
  onClick: () => void;
  title: string;
  subtitle: string;
}

const DrilldownMenuItem = ({
  onClick,
  title,
  subtitle,
}: IDrilldownMenuItemProps) => {
  return (
    <Button
      bsStyle="default"
      className={'drilldown-menu-item'}
      onClick={() => onClick()}
    >
      <p className="drilldown-menu-item-title">{title}</p>
      <p className="drilldown-menu-item-subtitle">{subtitle}</p>
    </Button>
  );
};

export default DrilldownMenuItem;
