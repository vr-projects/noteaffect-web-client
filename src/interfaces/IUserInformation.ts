interface IUserInformationDepartment {
  id: number;
  name: string;
  default: boolean;
}

export default interface IUserInformation {
  id: number;
  departments?: IUserInformationDepartment[];
  email: string;
  firstName: string;
  imageUrl: string;
  language: string;
  lastName: string;
  organizationName?: string;
  timezone: string;
}
