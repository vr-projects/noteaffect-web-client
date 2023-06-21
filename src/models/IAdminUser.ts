import IAdminUserDepartment from './IAdminUserDepartment';

export default interface IAdminUser {
  id: number;
  firstName: string;
  lastName: string;
  imageUrl: string;
  email: string;
  admin: boolean;
  departmentAdmin: boolean;
  presenter: boolean;
  salesPresenter: boolean;
  clientAdmin: boolean;
  departments: IAdminUserDepartment[];
}
