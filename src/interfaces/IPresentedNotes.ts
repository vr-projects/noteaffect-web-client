import IImmutableObject from './IImmutableObject';

export interface IPresentationAnnotations {
  scale: number;
  data: any;
}

export interface IPresentationNotesData {
  notes: string;
}

export interface IPresentationNotes {
  annotations?:
    | IPresentationAnnotations
    | IImmutableObject<IPresentationAnnotations>;
  sharedAnnotations?:
    | IPresentationAnnotations
    | IImmutableObject<IPresentationAnnotations>;
  notes?: IPresentationNotesData | IImmutableObject<IPresentationNotesData>;
  sharedNotes?:
    | IPresentationNotesData
    | IImmutableObject<IPresentationNotesData>;
}

export interface IImmutablePresentationNotesProps extends IPresentationNotes {
  annotations?: IImmutableObject<IPresentationAnnotations>;
  sharedAnnotations?: IImmutableObject<IPresentationAnnotations>;
  notes?: IImmutableObject<IPresentationNotesData>;
  sharedNotes?: IImmutableObject<IPresentationNotesData>;
}

export interface IImmutablePresentationNotes
  extends IImmutableObject<IImmutablePresentationNotesProps> {}
