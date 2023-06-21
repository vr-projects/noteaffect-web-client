import ICourse from './ICourse';

export default interface IDocument {
  id: number | null;
  fileName?: string | null;
  fileUrl?: string | null;
  created?: number | null;
  series?: ICourse[];
  totalSignatureRequestCount?: number | null;
  signedSignatureRequestCount?: number | null;
}
