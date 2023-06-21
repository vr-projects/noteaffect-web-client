class PromiseUtilClass {
  public promiseTimeout(cb: Function, delay = 0) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(cb());
      }, delay);
    });
  }
}
const PromiseUtil = new PromiseUtilClass();
export default PromiseUtil;
