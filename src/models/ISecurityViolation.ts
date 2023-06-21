interface IItem {
  lectureId?: number;
  slideId?: number;
}

interface IContextDet {
  item?: IItem;
  resourceType?: string;
  seriesId?: number;
}

interface ISecurityViolation {
  contextDet?: IContextDet;
  detail?: string;
  eventDate?: string;
  eventMethod?: string; // File, ClipBoard, Network
  eventType?: string; // Capture, Recording, Sharing
  fileName?: string;
  path?: string;
}

export default ISecurityViolation;
