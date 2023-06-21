import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import ParticipantPermissions from '../enums/ParticipantPermissions';

export const getIsParticipant = (series, currentUserId) => {
  const currentUser = series.participants.find(
    (participant) => participant.userId === currentUserId
  );
  if (isUndefined(currentUser)) return false;

  return (
    currentUser.permissions === ParticipantPermissions.Viewer ||
    currentUser.permissions === ParticipantPermissions.ViewerLecturer ||
    currentUser.permissions === ParticipantPermissions.ViewerObserver
  );
};

export const getIsParticipantObserver = (series, currentUserId) => {
  const currentUser = series.participants.find(
    (participant) => participant.userId === currentUserId
  );
  if (isUndefined(currentUser)) return false;

  return currentUser.permissions === ParticipantPermissions.ViewerObserver;
};

export const getIsParticipantOnly = (series, currentUserId) => {
  const currentUser = series.participants.find(
    (participant) => participant.userId === currentUserId
  );
  if (isUndefined(currentUser)) return false;

  return currentUser.permissions === ParticipantPermissions.Viewer;
};

export const getIsObserverOnly = (
  series = { participants: [] },
  currentUserId
) => {
  if (isNull(series)) return false;

  const currentUser = series.participants.find(
    (participant) => participant.userId === currentUserId
  );
  
  if (isUndefined(currentUser)) return false;

  return currentUser.permissions === ParticipantPermissions.Observer;
};
