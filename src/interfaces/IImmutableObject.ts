import * as Immutable from "immutable";

export default interface IImmutableObject<T>
  extends Immutable.Map<string, any> {
  toJS(): T;
  get<K extends keyof T>(key: K): T[K];
  set<K extends keyof T>(key: keyof T, value: T[K]): Immutable.Map<string, any>;
}
