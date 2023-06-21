import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import { LECTURE_SEARCH_AND_SORT_COMPONENT } from '../../version/versionConstants';
import Localizer from '../../utilities/Localizer';
import SortByDropdown from '../controls/SortByDropdown';
import SearchFilterInput from '../controls/SearchFilterInput';

interface ILectureSearchAndSortProps {
  filterBy: string;
  orderBy: string;
  onFilterChange: (filter: string) => void;
  onSortChange: (sort: string) => void;
}

interface ILectureSearchAndSortState {}

const sortByMenuItems = [
  { label: 'Date', value: 'Date' },
  { label: 'Name', value: 'Name' },
];

export default class LectureSearchAndSort extends SrUiComponent<
  ILectureSearchAndSortProps,
  ILectureSearchAndSortState
> {
  updateFilter(value) {
    if (this.props.onFilterChange) {
      this.props.onFilterChange(value);
    }
  }

  updateOrderBy(value) {
    if (this.props.onSortChange) {
      this.props.onSortChange(value);
    }
  }

  performRender() {
    const { orderBy } = this.props;

    return (
      <div className="lecture-search-and-sort search-filter">
        <div className="d-flex">
          <div className="search-container flex-grow">
            <SearchFilterInput
              placeholder={Localizer.getFormatted(
                LECTURE_SEARCH_AND_SORT_COMPONENT.SEARCH
              )}
              updateCurrentVal={(val) => this.updateFilter(val)}
              clearedInput={() => this.updateFilter('')}
            />
          </div>
          <div className="sort-container ml-1">
            <SortByDropdown
              id={`sortby-questions`}
              className="lecture-search-and-sort-dropdown"
              menuItems={sortByMenuItems}
              onSelect={(val: string) => this.updateOrderBy(val)}
              selectedVal={orderBy}
            />
          </div>
        </div>
      </div>
    );
  }
}
