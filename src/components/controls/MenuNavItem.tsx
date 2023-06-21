/**
 * Warning
 * This is an extremely non-standard implementation of both sidebar and tab controls
 * The parent <MenuView> disregards and reconstructs this component in the MenuView.tsx file
 * When adding props to this, you must also add them in MenuView in the map function that reconstructs
 * these MenuNavItems
 */
import * as React from 'react';
import { SrUiComponent } from 'react-strontium';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';

export interface IMenuNavItemProps {
  id: string;
  disabled?: boolean;
  content: () => React.ReactNode; // Passed up to MenuView and created there
  hidden?: boolean;
  selected?: boolean;
  onSelected?: (id: string) => void;
  className?: string;
}

interface IMenuNavItemState {}

export default class MenuNavItem extends SrUiComponent<
  IMenuNavItemProps,
  IMenuNavItemState
> {
  static defaultProps: IMenuNavItemProps = {
    id: null,
    content: null,
    disabled: false,
    hidden: false,
    selected: false,
  };

  performRender() {
    const {
      hidden,
      selected,
      onSelected,
      disabled = false,
      id,
      className = '',
      children,
    } = this.props;
    if (hidden) {
      return null;
    }

    return (
      <li
        role="presentation"
        className={`menu-nav-item ${selected ? 'selected' : ''} ${className}`}
      >
        <button
          className="menu-nav-button"
          role="navigation"
          tabIndex={0}
          disabled={disabled}
          onClick={() => {
            onSelected(id);
          }}
          onKeyDown={(e) =>
            AccessibilityUtil.handleEnterKey(e, () => onSelected(id))
          }
        >
          {children}
        </button>
      </li>
    );
  }
}
