import isNull from 'lodash/isNull';

export const loadingDashString = (loading, potentialString) => {
  if (loading || isNull(potentialString)) {
    return '—— ——';
  }
  return potentialString;
};
