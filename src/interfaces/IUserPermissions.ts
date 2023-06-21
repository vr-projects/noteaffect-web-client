export default interface IUserPermissions {
  canBuildQuestions: boolean;
  canViewDepartments: boolean;
  instructorOnly: boolean;
  isAdmin: boolean;
  isDepartmentAdmin: boolean;
  isClientAdmin: boolean;
  isPresenter: boolean;
  isSalesPresenter: boolean;
}
