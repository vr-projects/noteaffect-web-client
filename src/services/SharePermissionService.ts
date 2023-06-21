import SharePermission from '../enums/SharePermission';

export const SharePermissionMap = {
  None: 0,
  Open: 1,
  Colleagues: 2,
  Participants: 3,
  Closed: 4,
};

export const SharePermissionDescription = {
  None: 'No meeting share permission has been set',
  Open:
    'Meeting security level is set to allow you to share this meeting content with anyone.',
  Colleagues:
    'Meeting security level is set to allow you to share meeting content only with members of your organization.',
  Participants:
    'Meeting security level is set to allow you to share meeting content only with other meeting participants.',
  Closed:
    'Meeting security level is restricted, meeting content sharing will not be permitted.',
};

export const SharePermissionStyleMap = {
  None: 'default',
  Open: 'success',
  Colleagues: 'primary',
  Participants: 'warning',
  Closed: 'danger',
};

export const getSharePermission = (
  value: SharePermission,
  placeholder?: string
): string => {
  if (value === null && placeholder) return placeholder;
  let key = Object.keys(SharePermissionMap).find(
    (k) => SharePermissionMap[k] === value
  );
  return key;
};

export const getSharePermissionStyle = (value: SharePermission): string => {
  if (value === null) return 'default';
  const sharePermissionKey = getSharePermission(value);
  return SharePermissionStyleMap[sharePermissionKey];
};

export const getSharePermissionDescription = (
  value: SharePermission
): string => {
  if (value === null) return 'No sharing permission set';
  const sharePermissionKey = getSharePermission(value);
  return SharePermissionDescription[sharePermissionKey];
};

export const getIsSecuredSeries = (value: SharePermission): boolean => {
  return value !== SharePermission.Open;
};
