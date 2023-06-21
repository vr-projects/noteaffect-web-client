import * as React from 'react';
import { FaBars, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SrUiComponent, Log } from 'react-strontium';
import MenuNavItem, { IMenuNavItemProps } from './MenuNavItem';
import Localizer from '../../utilities/Localizer';
import AccessibilityUtil from '../../utilities/AccessibilityUtil';

interface IMenuViewProps {
  onNavItemSelected: (id: string) => void;
  header?: string;
  currentSelection: string;
  className?: string;
  horizontal?: boolean;
}

interface IMenuViewState {
  collapsed: boolean;
  smallScreenMode: boolean;
}

export default class MenuView extends SrUiComponent<
  IMenuViewProps,
  IMenuViewState
> {
  initialState() {
    return { collapsed: false, smallScreenMode: false };
  }

  onComponentMounted(): void {
    this.checkValidNavItem();
    this.onWindowResized();
  }

  onNewProps(props: IMenuViewProps): void {
    this.checkValidNavItem(props.currentSelection);
  }

  checkValidNavItem(id: string = null) {
    const navItemIds = this.navItemIds();
    if (!this.validId(id || this.props.currentSelection)) {
      if (navItemIds && navItemIds.length > 0) {
        this.setNavItemSelected(navItemIds[0]);
      }
    }
  }

  resizeCallback() {
    return () => this.onWindowResized();
  }

  onWindowResized() {
    if (this.props.horizontal === true) {
      return;
    }

    this.setPartial({ smallScreenMode: window.innerWidth <= 600 });
  }

  smallScreen() {
    return !this.props.horizontal && this.state.smallScreenMode;
  }

  getMenuLabelText(): string {
    if (!this.props.header) return '';

    return (this.props.header.toUpperCase().match(/[A-Z]/) || []).pop();
  }

  validId(id: string) {
    return (
      this.navItemIds().filter((t) => {
        return t === id;
      }).length > 0
    );
  }

  navItemIds(): string[] {
    let ids = this.validMenuNavItems().map((navItem) => navItem.props.id);
    return ids.filter((id) => id);
  }

  isId(id) {
    return id === this.props.currentSelection;
  }

  setNavItemSelected(id: string) {
    if (
      id === this.props.currentSelection ||
      this.props.currentSelection === null
    ) {
      return;
    }
    Log.t(this, 'NavItem selected', { id: id });
    this.props.onNavItemSelected(id);
  }

  getMainContent() {
    let mainContentElement: React.ReactNode = null;

    const validNavItem = this.validMenuNavItems().find((navView) => {
      return navView.props.id === this.props.currentSelection;
    });

    if (validNavItem !== undefined) {
      mainContentElement = validNavItem.props.content();
    }

    return mainContentElement;
  }

  validMenuNavItems(): React.ReactElement<IMenuNavItemProps>[] {
    const children: React.ReactElement<IMenuNavItemProps>[] = [];
    React.Children.forEach(this.props.children, (child, index) => {
      if (React.isValidElement<IMenuNavItemProps>(child)) {
        let props = child.props;
        if (
          typeof props['id'] === 'string' &&
          typeof props['content'] === 'function' &&
          (typeof props['hidden'] === 'undefined' ||
            typeof props['hidden'] === 'boolean') &&
          (typeof props['selected'] === 'undefined' ||
            typeof props['selected'] === 'boolean') &&
          (typeof props['onSelected'] === 'undefined' ||
            typeof props['onSelected'] === 'function')
        ) {
          children.push(child);
        }
      }
    });
    return children;
  }

  toggleCollapsed() {
    this.setPartial({ collapsed: !this.state.collapsed });
  }

  performRender() {
    const { horizontal, header, className = '' } = this.props;
    const { collapsed } = this.state;
    const menuLabel = this.getMenuLabelText();

    return (
      <div
        className={`menu-viewer ${className} ${
          horizontal ? 'h-menu-view' : 'menu-view'
        }`}
      >
        <div
          className={`${
            horizontal ? 'h-menu-view-container' : 'menu-view-container'
          } ${collapsed ? 'collapsed-menu' : ''} ${
            this.smallScreen() ? 'small-screen' : ''
          }`}
        >
          {this.smallScreen() ? (
            <>
              <div
                className={`${
                  horizontal ? '' : 'menu-header'
                } small-screen-header`}
              >
                <button
                  className="menu-hamburger"
                  title={header}
                  onClick={() => this.setPartial({ collapsed: !collapsed })}
                >
                  <FaBars className="ml-1" />
                </button>
                <div className="menu-title" title={header}>
                  <h1>{header}</h1>
                </div>
              </div>
            </>
          ) : null}

          <div className={horizontal ? 'h-menu-content' : 'menu-content'}>
            {header && !horizontal && !this.smallScreen() ? (
              <div className="menu-header">
                <div className="menu-label" title={header}>
                  {menuLabel}
                </div>
                <div className="menu-title" title={header}>
                  <h1>{header}</h1>
                </div>
              </div>
            ) : null}
            <div className={horizontal ? 'h-menu-items' : 'menu-items'}>
              <ul
                className={this.classes('menu-nav-ul nav nav-tabs', className)}
              >
                {this.validMenuNavItems().map((navItem, idx) => (
                  <MenuNavItem
                    className={`${horizontal ? 'horizontal' : ''}`}
                    key={idx + ' ' + navItem.props.id}
                    id={navItem.props.id}
                    content={navItem.props.content}
                    disabled={navItem.props.disabled}
                    hidden={navItem.props.hidden}
                    selected={this.isId(navItem.props.id)}
                    onSelected={(id: string) =>
                      this.props.onNavItemSelected(id)
                    }
                  >
                    {(navItem.props as any).children}
                  </MenuNavItem>
                ))}
                {!horizontal ? (
                  <li
                    role="presentation"
                    className="menu-collapser-btn-container menu-nav-item "
                  >
                    <button
                      className="menu-collapser-btn"
                      onClick={() => this.toggleCollapsed()}
                      onKeyDown={(e) =>
                        AccessibilityUtil.handleEnterKey(e, () =>
                          this.toggleCollapsed()
                        )
                      }
                    >
                      {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                      <span>{Localizer.get('Hide menu')}</span>
                    </button>
                  </li>
                ) : null}
              </ul>
            </div>
            {/* {!horizontal ? (
              <>
                <button
                  className="menu-collapser-btn"
                  onClick={() => this.toggleCollapsed()}
                  onKeyDown={(e) =>
                    AccessibilityUtil.handleEnterKey(e, () =>
                      this.toggleCollapsed()
                    )
                  }
                >
                  {collapsed ? <FaChevronRight /> : <FaChevronLeft />}
                  <span>{Localizer.get('Hide menu')}</span>
                </button>
              </>
            ) : null} */}
          </div>
          <div className="main-content">{this.getMainContent()}</div>
        </div>
      </div>
    );
  }
}
