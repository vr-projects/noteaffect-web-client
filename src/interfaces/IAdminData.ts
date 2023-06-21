import ICourse from "../models/ICourse";
import IPeriod from "../models/IPeriod";
import IDepartment from "../models/IDepartment";

export default interface IAdminData {
  series: ICourse[];
  departments: IDepartment[];
  periods: IPeriod[];
}
