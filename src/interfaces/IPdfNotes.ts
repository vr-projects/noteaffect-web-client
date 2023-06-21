import IImmutableObject from './IImmutableObject';

export interface IPdfAnnotations {
  scale: number;
  data: any;
}

export interface IPdfNotes {
  notes: string;
}

export interface IPdfNotesDataJS {
  annotations: IPdfAnnotations;
  sharedAnnotations: IPdfAnnotations;
  notes: string;
  sharedNotes: string;
}

export interface IPdfNotesData {
  annotations?: IPdfAnnotations | IImmutableObject<IPdfAnnotations>;
  sharedAnnotations?: IPdfAnnotations | IImmutableObject<IPdfAnnotations>;
  notes?: IPdfNotes | IImmutableObject<IPdfNotes>;
  sharedNotes?: IPdfNotes | IImmutableObject<IPdfNotes>;
}

export interface IImmutablePdfNotesProps extends IPdfNotesData {
  annotations?: IImmutableObject<IPdfAnnotations>;
  sharedAnnotations?: IImmutableObject<IPdfAnnotations>;
  notes?: IImmutableObject<IPdfNotes>;
  sharedNotes?: IImmutableObject<IPdfNotes>;
}

export interface IImmutablePdfNotes
  extends IImmutableObject<IImmutablePdfNotesProps> {}
