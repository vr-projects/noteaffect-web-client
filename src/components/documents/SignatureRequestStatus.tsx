import * as React from 'react';
import { SrUiComponent, LoadStates, ApiHelpers } from 'react-strontium';
import isNull from 'lodash/isNull';
import isEmpty from 'lodash/isEmpty';
import { FaCheckCircle } from 'react-icons/fa';
import IDocument from '../../models/IDocument';
import JSONutil from '../../utilities/JSONutil';
import ErrorUtil from '../../utilities/ErrorUtil';
import ISignatureRequest from '../../models/ISignatureRequest';
import DateFormatUtil, { longDateFormat } from '../../utilities/DateFormatUtil';

interface ISignatureRequestStatusProps {
  selectedDocument: IDocument;
  userTimezone: string | null;
}

interface ISignatureRequestStatusState {
  loading: LoadStates;
  signatureRequests: ISignatureRequest[];
}

class SignatureRequestStatus extends SrUiComponent<
  ISignatureRequestStatusProps,
  ISignatureRequestStatusState
> {
  initialState() {
    return {
      loading: LoadStates.Unloaded,
      signatureRequests: [],
    };
  }

  async getSignatureRequests() {
    const { selectedDocument } = this.props;

    try {
      this.setPartial({
        loading: LoadStates.Loading,
      });
      const resp = await ApiHelpers.read(
        `userfiles/${selectedDocument.id}/signature`
      );

      if (!resp.good || !JSONutil.isValid(resp.data) || !isEmpty(resp.errors)) {
        ErrorUtil.throwErrorMessage(resp.errors);
      }
      this.setPartial({
        loading: LoadStates.Succeeded,
        signatureRequests: JSON.parse(resp.data).sort((a, b) =>
          a.signatureUsername.localeCompare(b.signatureUsername)
        ),
      });
    } catch (err) {
      this.setPartial({
        loading: LoadStates.Failed,
      });
      console.error(err);
    }
  }

  onComponentMounted() {
    this.getSignatureRequests();
  }

  performRender() {
    const { userTimezone } = this.props;
    const { signatureRequests } = this.state;

    return (
      <ul className="signature-request-status">
        {signatureRequests.map((request) => (
          <li key={request.id}>
            <div>
              <FaCheckCircle
                className={`icon${
                  !isNull(request.dateSigned) ? ' signed' : ''
                }`}
              />
              {request.signatureUsername}
            </div>
            {!isNull(request.dateSigned) && (
              <div>
                {DateFormatUtil.getUnixToGivenTimezone(
                  request.dateSigned,
                  userTimezone,
                  longDateFormat
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    );
  }
}

export default SignatureRequestStatus;
