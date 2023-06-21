import * as React from 'react';
import {
  SrUiComponent,
  LoadStates,
  LoadIndicator,
  ApiHelpers,
} from 'react-strontium';
import Localizer from '../../utilities/Localizer';
import IInstallSetting from '../../models/IInstallSetting';

interface IAdminSettingsItemProps {
  setting: IInstallSetting;
  updated: () => void;
}

interface IAdminSettingsItemState {
  loading: LoadStates;
  value: string;
  enabled: boolean;
}

export default class AdminSettingsItem extends SrUiComponent<
  IAdminSettingsItemProps,
  IAdminSettingsItemState
> {
  initialState() {
    return {
      loading: LoadStates.Succeeded,
      value: this.props.setting.value,
      enabled: this.props.setting.enabled,
    };
  }

  onNewProps(props: IAdminSettingsItemProps) {
    this.setPartial({
      value: props.setting.value,
      enabled: props.setting.enabled,
    });
  }

  valueControl(value: string, enabled: boolean) {
    if (!this.props.setting.type || this.props.setting.type === 'boolean') {
      return (
        <input
          type="checkbox"
          checked={value === 'True'}
          disabled={!enabled}
          onChange={(e) =>
            this.updateSetting(e.target.checked, this.state.enabled)
          }
        />
      );
    } else {
      return (
        <input
          type="text"
          value={value || ''}
          disabled={!enabled}
          onChange={(e) =>
            this.updateSetting(e.target.value, this.state.enabled)
          }
        />
      );
    }
  }

  async updateSetting(value: any, enabled: boolean) {
    if (this.state.loading === LoadStates.Loading) {
      return;
    }

    this.setPartial({ loading: LoadStates.Loading });
    const resp = await ApiHelpers.update(
      `admin/settings/${this.props.setting.key}`,
      { value, enabled }
    );
    if (!this.mounted()) {
      return;
    }
    if (resp.good) {
      this.props.updated();
      this.setPartial({ loading: LoadStates.Succeeded });
    } else {
      this.setPartial({ loading: LoadStates.Failed });
    }
  }

  performRender() {
    return (
      <tr className="admin-settings-item">
        {this.state.loading !== LoadStates.Succeeded ? (
          <td colSpan={4}>
            <LoadIndicator
              state={this.state.loading}
              errorMessage={Localizer.get(
                'There was a problem updating this setting.'
              )}
              loadingMessage={Localizer.get('Updating setting...')}
            />
          </td>
        ) : (
          <>
            <td>{this.props.setting.displayName}</td>
            <td>{this.valueControl(this.state.value, true)}</td>
            <td>{this.valueControl(this.props.setting.defaultValue, false)}</td>
            <td>
              {
                <input
                  type="checkbox"
                  checked={this.state.enabled}
                  onChange={(e) =>
                    this.updateSetting(this.state.value, e.target.checked)
                  }
                />
              }
            </td>
          </>
        )}
      </tr>
    );
  }
}
