import IUser from './IUser';

export default interface IObserver extends IUser {
  id: number;
  email: string | null;
  viewed: boolean;
}
