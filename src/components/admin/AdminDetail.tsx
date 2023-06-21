import * as React from 'react';
import { SrUiComponent, LoadStates, LoadIndicator } from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IAdminProps from '../../interfaces/IAdminProps';
// import AdminPeriodsEditor from './AdminPeriodsEditor';
// import UsersEditor from './UsersEditor';
import AdminSettingsEditor from './AdminSettingsEditor';

export default class AdminDetail extends SrUiComponent<IAdminProps, {}> {
  performRender() {
    return (
      <div className="admin-detail">
        <h1>{Localizer.get('Admin')}</h1>
        <LoadIndicator
          state={this.props.adminLoading}
          loadingMessage={Localizer.get('Loading admin...')}
          errorMessage={Localizer.get('There was an error loading the admin.')}
        />
        {this.props.adminLoading === LoadStates.Succeeded ? (
          <>
            {/* <UsersEditor /> */}
            <AdminSettingsEditor />
          </>
        ) : null}
      </div>
    );
  }
}
