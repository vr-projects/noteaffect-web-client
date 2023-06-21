import React from 'react';
import { ButtonToolbar, Dropdown, MenuItem } from 'react-bootstrap';
import { FaSortAmountDownAlt } from 'react-icons/fa';
import isNull from 'lodash/isNull';

interface IMenuItem {
  label: string;
  value: string | number;
}

interface ISortByDropdownProps {
  onSelect: (item: string | number) => void;
  id: string;
  menuItems: IMenuItem[];
  className?: string;
  selectedVal: string | null;
}

const getLabel = (menuItems, selectedVal): string => {
  if (isNull(selectedVal)) return '';
  return menuItems.find((menuItem) => menuItem.value === selectedVal).label;
};

const SortByDropdown = ({
  onSelect,
  id,
  menuItems,
  className,
  selectedVal,
}: ISortByDropdownProps) => {
  return (
    <div className={`sort-by-dropdown ${className}`}>
      <ButtonToolbar className="">
        <Dropdown
          id={id}
          onSelect={(val) => {
            onSelect(val);
          }}
        >
          <Dropdown.Toggle bsStyle={`default`} className="">
            <FaSortAmountDownAlt /> Sort by {getLabel(menuItems, selectedVal)}
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {menuItems.map((menuItem) => (
              <MenuItem key={menuItem.value} eventKey={menuItem.value}>
                {menuItem.label}
              </MenuItem>
            ))}
          </Dropdown.Menu>
        </Dropdown>
      </ButtonToolbar>
    </div>
  );
};

export default SortByDropdown;
