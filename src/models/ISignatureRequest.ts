export default interface ISignatureRequest {
  id: number;
  userFileId: number;
  userFileName: string;
  userFileUrl: string;
  signatureUsername: string;
  signatureDue: number;
  dateSigned: number;
  nameSigned: string;
  requestDate: number;
  requestorUsername: string;
}
