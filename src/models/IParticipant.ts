import SharePermission from '../enums/SharePermission';
import RsvpResponses from '../enums/RsvpResponses';
import IUser from './IUser';

export default interface IParticipant extends IUser {
  id: number;
  email?: string;
  hasPresenterRole?: boolean;
  imageUrl: string;
  lecturer: boolean;
  permissions?: SharePermission;
  rsvp?: RsvpResponses;
  shareRemarks?: string;
  sharedBy?: string;
}
