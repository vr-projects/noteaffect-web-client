import * as Immutable from 'immutable';
import IImmutableObject from '../../interfaces/IImmutableObject';
import IUserInformation from '../../interfaces/IUserInformation';
import IUserPermissions from '../../interfaces/IUserPermissions';
import IAppEnvironment from '../../interfaces/IAppEnvironment';
import IClientData from '../../interfaces/IClientData';

interface IAppState {
  menu?: string;
  userInformation?: IImmutableObject<IUserInformation>;
  userPermissions?: IImmutableObject<IUserPermissions>;
  appEnvironment?: IImmutableObject<IAppEnvironment>;
  clientData?: IImmutableObject<IClientData>;
  logoUrl?: string | null;
  isPresentationFullscreen?: boolean;
  storeLoading?: boolean;
}

const defaultProps = {
  menu: null,
  userInformation: Immutable.Map<string, any>(),
  userPermissions: Immutable.Map<string, any>(),
  appEnvironment: Immutable.Map<string, any>(),
  clientData: Immutable.Map<string, any>(),
  isPresentationFullscreen: false,
  logoUrl: null,
  storeLoading: true,
};

export default class AppRecord extends Immutable.Record(defaultProps) {
  constructor(params?: IAppState) {
    params ? super(params) : super();
  }

  get<T extends keyof IAppState>(value: T): IAppState[T] {
    return super.get(value);
  }

  with(values: IAppState) {
    return this.merge(values) as this;
  }
}
