import * as React from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { ListGroupItem } from 'react-bootstrap';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import IParticipant from '../../models/IParticipant';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import RsvpBadge from '../rsvp/RsvpBadge';

interface ICourseParticipantItemProps {
  participant: IParticipant;
  disableDrilldown?: boolean;
  onSelected?: () => void;
  className?: string;
}

const ParticipantItem = ({
  participant,
  disableDrilldown,
  onSelected,
  className = '',
}: ICourseParticipantItemProps) => {
  // TODO tech debt confirm lecturer key, confirm will have lecturer on participants
  const { lecturer: isLecturer } = participant;

  return (
    <ListGroupItem className={`participant-item ${className}`}>
      <div className="participant-item-meta">
        <span className="participant-name break-all">
          {ParticipantsUtil.displayName(participant)}
        </span>
        {isLecturer && (
          <span className="instructor-label label label-info">
            {Localizer.getFormatted(GENERAL_COMPONENT.INSTRUCTOR_PRESENTER)}
          </span>
        )}
        {!isLecturer && <RsvpBadge code={participant.rsvp} />}
      </div>
      {!disableDrilldown && (
        <button
          className={`participant-item-details-btn btn na-btn-reset-width btn-light-primary align-self-start`}
          onClick={(e) => {
            e.stopPropagation();
            if (onSelected) {
              onSelected();
            }
          }}
        >
          <FaUserAlt />
        </button>
      )}
    </ListGroupItem>
  );
};

export default ParticipantItem;
