import { runtime } from 'react-strontium';
import ServiceReduxConnectionServices from '../services/ServiceReduxConnectionServices';

export default class Dispatcher {
  public static dispatch(item: any) {
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    svc.dispatch(item);
  }
}
