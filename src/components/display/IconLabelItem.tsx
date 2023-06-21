import * as React from 'react';
import DashUtil from '../../utilities/DashUtil';

interface IIconLabelItem {
  icon: React.ReactNode;
  textNode: React.ReactNode;
  ariaLabel: string;
  showDashes: boolean;
  className?: string;
}

const IconLabelItem = ({
  icon: Icon,
  textNode: TextNode,
  ariaLabel,
  showDashes = false,
  className = '',
}) => {
  return (
    <div className={`icon-label-item ${className}`} aria-label={ariaLabel}>
      <Icon />
      {!showDashes ? <TextNode /> : DashUtil.giveMeDashes()}
    </div>
  );
};

export default IconLabelItem;
