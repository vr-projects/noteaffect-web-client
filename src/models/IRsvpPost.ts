import RsvpResponses from '../enums/RsvpResponses';

export default interface IRsvpPost {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
  lecturer: boolean;
  userId: number;
  email: string;
  rsvp: RsvpResponses;
}
