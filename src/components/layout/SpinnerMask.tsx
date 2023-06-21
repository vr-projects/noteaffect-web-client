import * as React from 'react';
import { LoadMask, WaitSpinner, LoadStates } from 'react-strontium';

interface ISpinnerMask {
  loading: LoadStates;
}

const SpinnerMask = ({ loading }: ISpinnerMask) => {
  if (loading !== LoadStates.Loading) return null;
  return (
    <div className="spinner-mask">
      <LoadMask state={loading} />
      <WaitSpinner className="wait-spinner" />
    </div>
  );
};

export default SpinnerMask;
