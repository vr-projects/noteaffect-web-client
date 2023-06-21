import IObserver from '../models/IObserver';
import IUser from '../models/IUser';
import IParticipant from '../models/IParticipant';
import IUnregisteredParticipant from '../models/IUnregisteredParticipant';

export default class ParticipantsUtil {
  static getSharedWithByParticipants(observer: IObserver[]) {
    return [...observer];
  }
  public static displayName(user: IUser) {
    return this.validNameParts(user).join(' ');
  }

  public static titleBlockText(participant: IParticipant) {
    var parts = this.validNameParts(participant);
    return parts.map((p) => p.substr(0, 1).toUpperCase()).join('');
  }

  public static validNameParts(user: IUser) {
    return [user.firstName, user.lastName].filter(
      (n) => (n || '').trim().length > 0
    );
  }

  public static sort(
    participants: IParticipant[],
    prioritizeInstructors: boolean = true,
    excludeInstructors: boolean = false
  ) {
    const results = participants.slice().sort((a, b) => {
      if (prioritizeInstructors) {
        const lecturer = a.lecturer === b.lecturer ? 0 : a.lecturer ? -1 : 1;
        if (lecturer !== 0) {
          return lecturer;
        }
      }

      const last = a.lastName.localeCompare(b.lastName);
      if (last !== 0) {
        return last;
      }

      return a.firstName.localeCompare(b.firstName);
    });

    if (excludeInstructors) {
      return results.filter((p) => !p.lecturer);
    }

    return results;
  }

  public static sortByEmail(items) {
    return [...items].sort((a, b) => a.email.localeCompare(b.email));
  }

  public static getInstructorsPresenters(
    participants: IParticipant[]
  ): IParticipant[] {
    return [...participants]
      .filter((p) => p.lecturer === true)
      .sort((a, b) => {
        return a.lastName.localeCompare(b.lastName);
      });
  }

  public static getStudentsParticipants(
    participants: IParticipant[]
  ): IParticipant[] {
    return [...participants]
      .filter((p) => p.lecturer === false)
      .sort((a, b) => {
        const last = a.lastName.localeCompare(b.lastName);
        if (last !== 0) {
          return last;
        }

        return a.firstName.localeCompare(b.firstName);
      });
  }

  public static getUnregistered(unregistereds: IUnregisteredParticipant[]) {
    if (!unregistereds) {
      return [];
    }
    return [...unregistereds].sort((a, b) => {
      return a.email.localeCompare(b.email);
    });
  }
}
