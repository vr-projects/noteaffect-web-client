import * as React from 'react';
import {
  SrUiComponent,
  LoadStates,
  ApiHelpers,
  LoadIndicator,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IInstallSetting from '../../models/IInstallSetting';
import AdminSettingsItem from './AdminSettingsItem';

interface IAdminSettingsEditorProps {}

interface IAdminSettingsEditorState {
  settings: IInstallSetting[];
  loading: LoadStates;
}

export default class AdminSettingsEditor extends SrUiComponent<
  IAdminSettingsEditorProps,
  IAdminSettingsEditorState
> {
  initialState() {
    return { settings: [], loading: LoadStates.Unloaded };
  }

  onComponentMounted() {
    this.loadSettings();
  }

  async loadSettings() {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.read('admin/settings');
    if (resp.good) {
      this.setState({
        loading: LoadStates.Succeeded,
        settings: JSON.parse(resp.data),
      });
    } else {
      this.setState({ loading: LoadStates.Failed, settings: [] });
    }
  }

  settingsForTable() {
    return this.state.settings.filter((s) => s.key !== 'ltiSecret');
  }

  ltiSecret() {
    const setting = this.state.settings.filter((s) => s.key === 'ltiSecret')[0];
    if (setting) {
      return setting.value;
    }
    return null;
  }

  configUrl() {
    return `${window.location.protocol}//${window.location.hostname}/integrations/lti/canvas/xml`;
  }

  performRender() {
    const secret = this.ltiSecret();
    return (
      <div className="admin-settings-editor">
        <h3>{Localizer.get('Install Settings')}</h3>
        {this.state.settings.length > 0 ? (
          <table>
            <thead>
              <tr>
                <th>{Localizer.get('Name')}</th>
                <th>{Localizer.get('Current Value')}</th>
                <th>{Localizer.get('Default Value')}</th>
                <th>{Localizer.get('Enabled')}</th>
              </tr>
            </thead>
            <tbody>
              {this.settingsForTable().map((u) => (
                <AdminSettingsItem
                  setting={u}
                  key={u.key}
                  updated={() => this.loadSettings()}
                />
              ))}
            </tbody>
          </table>
        ) : null}
        {secret ? (
          <>
            <h3>{Localizer.get('LTI Integration')}</h3>
            <p>
              {Localizer.get(
                'LTI Integration is currently supported for only the Canvas LMS. Ensure the "LTI Integration Required" setting is checked and enabled above, before adding to a Canvas course.'
              )}
            </p>
            <p>
              <strong>{Localizer.get('How to add to a Canvas course')}</strong>
            </p>
            <ol>
              <li>{Localizer.get('Open your course in Canvas')}</li>
              <li>{Localizer.get('Click the "Settings" menu')}</li>
              <li>{Localizer.get('Click the "Apps" tab')}</li>
              <li>
                {Localizer.get('Click the "View App Configurations" button')}
              </li>
              <li>{Localizer.get('Click the "+ App" button')}</li>
              <li>
                {Localizer.get(
                  'Under the "Configuration Type" dropdown, select "By URL"'
                )}
              </li>
              <li>{Localizer.get('Enter "NoteAffect" in the Name box')}</li>
              <li>
                {Localizer.get(
                  'Copy the following code in the Shared Secret box:'
                )}{' '}
                <strong>{secret}</strong>
              </li>
              <li>
                {Localizer.get('Copy the following URL in the Config URL box:')}{' '}
                <strong>{this.configUrl()}</strong>
              </li>
              <li>{Localizer.get('Click the "Submit" button')}</li>
              <li>{Localizer.get('Click the "Home" course menu item')}</li>
              <li>
                {Localizer.get(
                  'All done - the NoteAffect menu item will be added to the Course menu and will launch your course in NoteAffect'
                )}
              </li>
            </ol>
            <p>
              <strong>{Localizer.get('LTI Secret')}</strong>
            </p>
            <p>{secret}</p>
          </>
        ) : null}
        <LoadIndicator
          state={this.state.loading}
          loadingMessage={Localizer.get('Getting settings...')}
          errorMessage={Localizer.get('There was a problem getting settings.')}
        />
      </div>
    );
  }
}
