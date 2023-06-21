export const isDevMode = () => {
  return process.env.NODE_ENV !== 'production';
};

export const isDevModeCallback = (cb: Function) => {
  if (isDevMode()) {
    return cb();
  }
};
