import * as React from 'react';
import { FaUserAlt } from 'react-icons/fa';
import { ListGroupItem } from 'react-bootstrap';
import IObserver from '../../models/IObserver';

interface ICourseObserverItemProps {
  observer: IObserver;
  disableDrilldown?: boolean;
  onSelected?: () => void;
  className?: string;
}

const ObserverItem = ({
  observer,
  disableDrilldown,
  onSelected,
  className = '',
}: ICourseObserverItemProps) => {
  const { firstName, lastName, email, id } = observer;

  return (
    <ListGroupItem className={`observer-item ${className}`}>
      <div className="observer-item-meta">
        <span className="observer-name break-all">
          {id === 0 && email}
          {id !== 0 &&
            `${firstName ? firstName : ''} ${lastName ? lastName : ''}`}
        </span>
      </div>
      {!disableDrilldown && (
        <button
          className={`observer-item-details-btn btn na-btn-reset-width btn-light-primary align-self-start`}
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

export default ObserverItem;
