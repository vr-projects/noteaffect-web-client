import React from 'react';
import isNull from 'lodash/isNull';
import { Well } from 'react-bootstrap';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import SharePermission from '../../enums/SharePermission';
import SharePermissionModalButton from './SharePermissionModalButton';
import SharedWithModalButton from './SharedWithModalButton';

import {
  getSharePermission,
  getSharePermissionStyle,
  getSharePermissionDescription,
} from '../../services/SharePermissionService';
import ISeries from '../../models/ICourse';

interface ISharePermissionPanelProps {
  permissionCode: SharePermission;
  isPresenter?: boolean;
  isObserverOnly?: boolean;
  className?: string;
  series: ISeries;
  hasPresentations?: boolean;
  hasDocuments?: boolean;
}

const SharePermissionPanel = ({
  permissionCode,
  className = '',
  isPresenter = false,
  isObserverOnly = false,
  series,
  hasPresentations = false,
  hasDocuments = false,
}: ISharePermissionPanelProps) => {
  const sharePermissionLabel = getSharePermission(permissionCode, 'UNSET');
  const sharePermissionStyle = getSharePermissionStyle(permissionCode);
  const sharePermissionDescription = getSharePermissionDescription(
    permissionCode
  );
  const showShareButtons =
    !isPresenter &&
    !isObserverOnly &&
    permissionCode !== SharePermission.Closed;

  return (
    <div className={`share-permission-panel ${className}`}>
      <div
        className={`title-container bg-${
          !isNull(permissionCode) ? sharePermissionStyle : 'default'
        }-solid`}
      >
        <span className="lock-icon">
          {permissionCode === SharePermission.Open ? (
            <FaLockOpen />
          ) : (
            <FaLock />
          )}
        </span>
        <span className="title">{sharePermissionLabel}</span>
      </div>
      <div className="well-container">
        <Well className="p-1 m-0">
          <div className="share-permission-description">
            {sharePermissionDescription}
          </div>
          {showShareButtons && (
            <div className="mt-1 d-flex align-items-center">
              <SharePermissionModalButton
                permissionCode={permissionCode}
                series={series}
                disable={!hasPresentations && !hasDocuments}
              />
              <SharedWithModalButton
                observers={series.observers}
                disable={!hasPresentations && !hasDocuments}
              />
            </div>
          )}
        </Well>
      </div>
    </div>
  );
};

export default SharePermissionPanel;
