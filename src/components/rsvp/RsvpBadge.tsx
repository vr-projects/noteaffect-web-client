import React from 'react';
import isNull from 'lodash/isNull';
import RsvpResponses from '../../enums/RsvpResponses';

interface IRsvpBadgeProps {
  code: RsvpResponses;
}

const rsvpCodeMapper = {
  [RsvpResponses.Accept]: {
    label: 'ACCEPTED',
    class: 'text-success',
  },
  [RsvpResponses.Tentative]: {
    label: 'TENTATIVE',
    class: 'text-default',
  },
  [RsvpResponses.Decline]: {
    label: 'DECLINED',
    class: 'text-danger',
  },
};

const getRsvpLabelData = (code: RsvpResponses) => {
  switch (code) {
    case RsvpResponses.Accept:
    case RsvpResponses.Tentative:
    case RsvpResponses.Decline:
      return rsvpCodeMapper[code];
    default:
      return null;
  }
};

const RsvpBadge = ({ code }: IRsvpBadgeProps) => {
  const displayData = getRsvpLabelData(code);

  return (
    !isNull(displayData) && (
      <span className={`rsvp-badge ${displayData.class}`}>
        {displayData.label}
      </span>
    )
  );
};

export default RsvpBadge;
