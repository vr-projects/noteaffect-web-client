import IUserInformation from './interfaces/IUserInformation';
import IUserPermissions from './interfaces/IUserPermissions';
import IAppEnvironment from './interfaces/IAppEnvironment';
import ILecture from './models/ILecture';
import ISlideNotes from './models/ISlideNotes';
import ILecturePollingResults from './interfaces/ILecturePollingResults';

declare global {
  interface Window {
    userInformation: IUserInformation;
    userPermissions: IUserPermissions;
    appEnvironment: IAppEnvironment;
    exportData: {
      lecture: ILecture;
      polling: ILecturePollingResults[];
      notes: ISlideNotes[];
    };
  }
}
