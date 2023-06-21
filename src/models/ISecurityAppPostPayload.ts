export enum ResourceTypes {
  Slide = 1,
  UserFile = 2,
}

interface ISecurityAppPostItem {
  lectureId?: number;
  slide?: number;
  userFileId?: number | string;
}

interface ISecurityAppPostContextDet {
  seriesId: number;
  resourceType: ResourceTypes;
  item: ISecurityAppPostItem;
}
interface ISecurityAppPostContext {
  userId: number;
  contextDet: ISecurityAppPostContextDet;
}

interface ISecurityAppPostPayload {
  isMonitoring: boolean;
  isLive: boolean;
  id: string;
  context: ISecurityAppPostContext;
}

export default ISecurityAppPostPayload;
