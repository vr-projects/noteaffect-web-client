import React from 'react';
import Localizer from '../../utilities/Localizer';
import { ANALYTICS_TOGGLE } from '../../version/versionConstants';
import MultiRadioToggler, { IOption } from './MultiRadioToggler';
import Filters from '../../enums/Filters';

interface AnalyticsFilterMultiRadioToggle {
  titleNode: React.ReactNode;
  onFilterToggled: (val: Filters) => void;
  isVisible: boolean;
}

enum ANALYTICS_FILTER_TYPE {
  INCLUDE = 'include_observers',
  EXCLUDE = '',
}

const toggleOptions: IOption[] = [
  {
    label: Localizer.getFormatted(ANALYTICS_TOGGLE.INCLUDE),
    value: ANALYTICS_FILTER_TYPE.INCLUDE,
    style: 'info',
  },
  {
    label: Localizer.getFormatted(ANALYTICS_TOGGLE.EXCLUDE),
    value: ANALYTICS_FILTER_TYPE.EXCLUDE,
    style: 'info',
  },
];

export default function AnalyticsFilterMultiRadioToggler(
  props: AnalyticsFilterMultiRadioToggle
) {
  const { isVisible, titleNode, onFilterToggled } = props;

  if (!isVisible) {
    return <>{titleNode}</>;
  }

  return (
    <div className="analytics-filter-multi-radio-toggler">
      <div className="analytics-filter-multi-radio-toggler--title">
        {titleNode}
      </div>
      <MultiRadioToggler
        label={Localizer.getFormatted(ANALYTICS_TOGGLE.LABEL)}
        options={toggleOptions}
        onToggled={(val) => onFilterToggled(val)}
        defaultOptionIndex={0}
        disable={false}
        className="analytics-filter-multi-radio-toggler--toggler"
      />
    </div>
  );
}
