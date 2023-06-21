import { runtime } from 'react-strontium';
import isUndefined from 'lodash/isUndefined';
import ServiceReduxConnectionServices from './ServiceReduxConnectionServices';
import SystemRoles from '../enums/SystemRoles';

class SystemRoleServiceClass {
  getUserRoles() {
    let svc = runtime.services.get<ServiceReduxConnectionServices>(
      'serviceReduxConnection'
    );
    if (isUndefined(svc)) {
      return window.userPermissions;
    }
    const userPermissions = svc.getUserPermissions();
    return userPermissions;
  }

  hasSomeRoles(roles: SystemRoles[]) {
    let hasSomeRoles = false;
    const userRoles = this.getUserRoles();
    roles.forEach((role) => {
      if (userRoles[role] === true) {
        hasSomeRoles = true;
      }
    });
    return hasSomeRoles;
  }
}

const SystemRoleService = new SystemRoleServiceClass();
export default SystemRoleService;
