import React from 'react';
import { Alert, ListGroup } from 'react-bootstrap';
import isEmpty from 'lodash/isEmpty';
import IParticipant from '../../models/IParticipant';
import IUnregisteredParticipant from '../../models/IUnregisteredParticipant';
import IDistributionInvitation from '../../models/IDistributionInvitation';
import ParticipantsUtil from '../../utilities/ParticipantsUtil';
import ParticipantItem from './ParticipantItem';
import EmailListItem from './EmailListItem';
import Localizer from '../../utilities/Localizer';
import { GENERAL_COMPONENT } from '../../version/versionConstants';
import IObserver from '../../models/IObserver';
import ObserverItem from './ObserverItem';

interface IParticipantsGridProps {
  participants?: IParticipant[];
  observers?: IObserver[];
  unregisteredParticipants?: IUnregisteredParticipant[];
  distributionInvitations?: IDistributionInvitation[];
  isCorpVersion?: boolean;
  onParticipantSelected?: (participant: IParticipant) => void;
  disableDrilldown?: boolean;
  className?: string;
}

const ParticipantsGrid = ({
  participants = [],
  observers = [],
  unregisteredParticipants = [],
  distributionInvitations = [],
  disableDrilldown,
  onParticipantSelected,
  isCorpVersion,
  className = '',
}: IParticipantsGridProps) => {
  const lecturersPresenters = ParticipantsUtil.getInstructorsPresenters(
    participants
  );
  const registeredParticipants = ParticipantsUtil.getStudentsParticipants(
    participants
  );
  const sortedUnregisteredParticipants = ParticipantsUtil.getUnregistered(
    unregisteredParticipants
  );
  const sortedDistributionInvitations = ParticipantsUtil.sortByEmail(
    distributionInvitations
  );
  const sharedWithByParticipants = ParticipantsUtil.getSharedWithByParticipants(
    observers
  );

  return (
    <div className={`participants-grid ${className}`}>
      <div className="instructors-container grid-item">
        <h4>
          {`${Localizer.getFormatted(GENERAL_COMPONENT.INSTRUCTOR_PRESENTER)}:`}
        </h4>
        <ListGroup className="instructors-list list-group">
          {lecturersPresenters.map((p) => (
            <ParticipantItem
              key={p.id}
              participant={p}
              disableDrilldown={disableDrilldown}
              onSelected={() => onParticipantSelected(p)}
            />
          ))}
        </ListGroup>
      </div>
      <div className="registered-container grid-item">
        <h4>
          {`${Localizer.getFormatted(
            GENERAL_COMPONENT.REGISTERED_PARTICIPANTS
          )}:`}
        </h4>
        {registeredParticipants.length > 0 ? (
          <ListGroup className="registered-list list-group">
            {registeredParticipants.map((p) => (
              <ParticipantItem
                key={`registered-${p.id}`}
                participant={p}
                disableDrilldown={disableDrilldown}
                onSelected={() => onParticipantSelected(p)}
              />
            ))}
          </ListGroup>
        ) : (
          <Alert bsStyle="info">
            {Localizer.get('There are currently no registered participants.')}
          </Alert>
        )}
      </div>
      {!isEmpty(sortedUnregisteredParticipants) && (
        <div className="unregistered-container grid-item">
          <h4>
            {`${Localizer.getFormatted(
              GENERAL_COMPONENT.UNREGISTERED_PARTICIPANTS
            )}:`}
          </h4>
          <ListGroup className="unregistered-list list-group">
            {sortedUnregisteredParticipants.map((item) => (
              <EmailListItem
                key={`unregistered-${item.id}`}
                emailListItem={item}
              />
            ))}
          </ListGroup>
        </div>
      )}
      <div className="shared-with-by-container grid-item">
        <h4>{`${Localizer.get('Shared with by Participants')}`}</h4>
        {sharedWithByParticipants.length > 0 ? (
          <ListGroup className="shared-with-by-list list-group">
            {sharedWithByParticipants.map((o, index) => (
              <ObserverItem
                key={`shared-with-by-${o.id}-${index}`}
                observer={o}
                disableDrilldown={o.id === 0}
                onSelected={() =>
                  onParticipantSelected((o as any) as IParticipant)
                }
              />
            ))}
          </ListGroup>
        ) : (
          <Alert bsStyle="info">
            {Localizer.get('There are currently no participants sharing this.')}
          </Alert>
        )}
      </div>
      {isCorpVersion && !isEmpty(sortedDistributionInvitations) && (
        <div className="distroinvites-container grid-item">
          <h4>
            {`${Localizer.getFormatted(
              GENERAL_COMPONENT.DISTROLIST_INVITATIONS
            )}:`}
          </h4>
          <ListGroup className="distroinvite-list list-group">
            {sortedDistributionInvitations.map((item) => (
              <EmailListItem
                key={`distrolist-${item.id}`}
                emailListItem={item}
              />
            ))}
          </ListGroup>
        </div>
      )}
    </div>
  );
};

export default ParticipantsGrid;
