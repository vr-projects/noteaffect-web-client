interface ISecurityReport {
  id?: number;
  acknowledged?: boolean;
  dateOccurred?: number;
  eventMethod?: string;
  eventType?: string;
  filePath?: string;
  filename?: string;
  ipAddress?: string;
  lectureId: number;
  lectureName?: string;
  macAddress?: string;
  notes?: string;
  participant?: string;
  resourceType?: string;
  sessionId?: string;
  slide?: number;
  userFileId?: number;
  userFilename?: string;
}
export default ISecurityReport;
