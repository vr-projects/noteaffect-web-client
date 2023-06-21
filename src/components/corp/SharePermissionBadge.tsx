import React from 'react';
import { Label, OverlayTrigger, Tooltip } from 'react-bootstrap';
import SharePermission from '../../enums/SharePermission';
import {
  getSharePermission,
  getSharePermissionStyle,
  getSharePermissionDescription,
} from '../../services/SharePermissionService';

interface ISharePermissionBadgeProps {
  permissionCode: SharePermission | null;
  className?: string;
  showTooltip?: boolean;
  tooltipPlacement?: 'top' | 'right' | 'bottom' | 'left';
}

const SharePermissionBadge = ({
  permissionCode,
  className = '',
  showTooltip = false,
  tooltipPlacement = 'top',
}: ISharePermissionBadgeProps) => {
  const sharePermissionLabel = getSharePermission(permissionCode);
  const sharePermissionStyle = getSharePermissionStyle(permissionCode);
  const sharePermissionDescription = getSharePermissionDescription(
    permissionCode
  );

  if (!showTooltip) {
    return (
      <span className={`${className}`}>
        <Label bsStyle={sharePermissionStyle}>{sharePermissionLabel}</Label>
      </span>
    );
  }

  return (
    <span className={`${className}`}>
      <OverlayTrigger
        placement={tooltipPlacement}
        overlay={
          <Tooltip id="share-permission-badge-description">
            {sharePermissionDescription}
          </Tooltip>
        }
      >
        <Label bsStyle={sharePermissionStyle}>{sharePermissionLabel}</Label>
      </OverlayTrigger>
    </span>
  );
};

export default SharePermissionBadge;
