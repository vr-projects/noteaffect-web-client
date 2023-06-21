export default class DataStorageUtilities {
  private static _storageAvailable: boolean = undefined;

  public static localStorageAvailable(): boolean {
    if (this._storageAvailable === undefined) {
      this._storageAvailable = this.checkForLocalStorage();
    }

    return this._storageAvailable;
  }

  private static checkForLocalStorage(): boolean {
    const storage = window["localStorage"];
    try {
      const storageTest = "__storage_test__";
      storage.setItem(storageTest, storageTest);
      storage.removeItem(storageTest);
      return true;
    } catch (e) {
      return (
        e instanceof DOMException &&
        (e.code === 22 ||
          e.code === 1014 ||
          e.name === "QuotaExceededError" ||
          e.name === "NS_ERROR_DOM_QUOTA_REACHED") &&
        storage.length !== 0
      );
    }
  }
}
