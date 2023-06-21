import * as React from 'react';
import isNull from 'lodash/isNull';
import isUndefined from 'lodash/isUndefined';
import { Button, MenuItem } from 'react-bootstrap';
import { SrUiComponent } from 'react-strontium';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';

interface INavMenuItemProps {
  type?: 'button' | 'dropdownItem';
  menu?: string;
  target: string | null;
  currentMenu: string;
  show: boolean;
  onClicked?: () => void;
  className?: string;
}

interface INavMenuItemState {}

export default class NavMenuItem extends SrUiComponent<
  INavMenuItemProps,
  INavMenuItemState
> {
  isActive(): boolean {
    const { menu, target, currentMenu } = this.props;

    return (menu || target) === currentMenu;
  }

  handleNavigate() {
    const { target, onClicked } = this.props;
    if (isNull(target)) {
      if (!isUndefined(onClicked)) {
        onClicked();
        return;
      }
      return;
    }
    this.navigate(target);
  }

  performRender() {
    const {
      type = 'dropdownItem',
      show,
      children,
      className = '',
    } = this.props;
    if (!show) {
      return null;
    }

    if (type === 'button') {
      return (
        <MenuItem>
          <Button
            id="nav-participant-menu"
            role="navigation"
            bsStyle={this.isActive() ? 'warning' : 'info'}
            className={`nav-menu-item ${
              this.isActive() ? 'active' : ''
            } ${className}`}
            onClick={() => this.handleNavigate()}
            onKeyDown={(e) =>
              AccessibilityUtil.handleEnterKey(e, () => this.handleNavigate())
            }
          >
            <span className="nav-menu-item-title">{children}</span>
          </Button>
        </MenuItem>
      );
    }

    return (
      <MenuItem
        role="navigation"
        className={`nav-menu-item ${
          this.isActive() ? 'active' : ''
        } ${className}`}
        onClick={() => this.handleNavigate()}
        onKeyDown={(e) =>
          AccessibilityUtil.handleEnterKey(e, () => this.handleNavigate())
        }
      >
        <span className="nav-menu-item-title">{children}</span>
      </MenuItem>
    );
  }
}
