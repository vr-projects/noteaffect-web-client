import * as React from 'react';
import { FaBriefcase } from 'react-icons/fa';
import { SrUiComponent, QueryUtility } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import MenuView from '../controls/MenuView';
import MenuNavItem from '../controls/MenuNavItem';
import AsyncComponentLoader from '../AsyncComponentLoader';

interface ICorpAccountMenuProps {
  isAdmin: boolean;
  options: any;
}

interface ICorpAccountMenuState {}

class CorpAccountMenu extends SrUiComponent<
  ICorpAccountMenuProps,
  ICorpAccountMenuState
> {
  private _allowedMenus: string[];

  onComponentMounted() {
    this.setupView();
  }

  async setupView() {
    const allowedViews = ['account'];
    this._allowedMenus = allowedViews;

    this.forceUpdate();
  }

  handleShowMenuView = (id) => {
    this.updateQuery(QueryUtility.buildQuery({ menu: id }, true));
  };

  allowedMenu() {
    if (
      !this.props.options.menu ||
      !this._allowedMenus ||
      this._allowedMenus.indexOf(this.props.options.menu) === -1
    ) {
      return 'account';
    }

    return this.props.options.menu;
  }

  performRender() {
    return (
      <div className="corp-account-menu">
        <MenuView
          header={'Account Management'}
          onNavItemSelected={(id) => this.handleShowMenuView(id)}
          currentSelection={this.allowedMenu()}
        >
          <MenuNavItem
            id="account"
            content={() => (
              <div key="corp-account-tab">
                <AsyncComponentLoader
                  loader={() => import('./CorpAccountForm')}
                  options={this.props.options}
                  isAdmin={this.props.isAdmin}
                />
              </div>
            )}
          >
            <FaBriefcase />
            <span>{Localizer.get('Account')}</span>
          </MenuNavItem>
        </MenuView>
      </div>
    );
  }
}

export default CorpAccountMenu;
