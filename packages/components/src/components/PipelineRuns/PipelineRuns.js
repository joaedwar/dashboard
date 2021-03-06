/*
Copyright 2019-2020 The Tekton Authors
Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React from 'react';
import { injectIntl } from 'react-intl';
import { Link } from 'react-router-dom';
import { Table } from '@tektoncd/dashboard-components';
import 'carbon-components-react';
import { getStatus, getStatusIcon, urls } from '@tektoncd/dashboard-utils';

import { FormattedDate, FormattedDuration, RunDropdown } from '..';

import './PipelineRuns.scss';

const PipelineRuns = ({
  createPipelineRunURL = urls.pipelineRuns.byName,
  createPipelineRunDisplayName = ({ pipelineRunMetadata }) =>
    pipelineRunMetadata.name,
  createPipelineRunsByPipelineURL = urls.pipelineRuns.byPipeline,
  getPipelineRunStatus = (pipelineRun, intl) => {
    const { reason } = getStatus(pipelineRun);
    return (
      reason ||
      intl.formatMessage({
        id: 'dashboard.pipelineRuns.status.pending',
        defaultMessage: 'Pending'
      })
    );
  },
  getPipelineRunStatusIcon = pipelineRun => {
    const { reason, status } = getStatus(pipelineRun);
    return getStatusIcon({ reason, status });
  },
  getPipelineRunStatusTooltip = (pipelineRun, intl) => {
    const { message } = getStatus(pipelineRun);
    const reason = getPipelineRunStatus(pipelineRun, intl);
    if (!message) {
      return reason;
    }
    return `${reason}: ${message}`;
  },
  hideNamespace,
  hidePipeline,
  intl,
  loading,
  selectedNamespace,
  pipelineRuns,
  pipelineRunActions
}) => {
  const initialHeaders = [
    {
      key: 'status',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.status',
        defaultMessage: 'Status'
      })
    },
    {
      key: 'name',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.name',
        defaultMessage: 'Name'
      })
    },
    !hidePipeline && {
      key: 'pipeline',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.pipeline',
        defaultMessage: 'Pipeline'
      })
    },
    !hideNamespace && {
      key: 'namespace',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.namespace',
        defaultMessage: 'Namespace'
      })
    },
    {
      key: 'createdTime',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.createdTime',
        defaultMessage: 'Created'
      })
    },
    {
      key: 'duration',
      header: intl.formatMessage({
        id: 'dashboard.tableHeader.duration',
        defaultMessage: 'Duration'
      })
    },
    {
      key: 'dropdown',
      header: ''
    }
  ];

  const headers = [];
  initialHeaders.forEach(header => {
    if (header.key !== undefined) {
      headers.push(header);
    }
  });

  const pipelineRunsFormatted = pipelineRuns.map(pipelineRun => {
    const { annotations, creationTimestamp, namespace } = pipelineRun.metadata;
    const pipelineRunName = createPipelineRunDisplayName({
      pipelineRunMetadata: pipelineRun.metadata
    });
    const pipelineRefName = pipelineRun.spec.pipelineRef.name;
    const pipelineRunType = pipelineRun.spec.type;
    const { lastTransitionTime, reason, status } = getStatus(pipelineRun);
    const statusIcon = getPipelineRunStatusIcon(pipelineRun);
    const url = createPipelineRunURL({
      namespace,
      pipelineRunName,
      annotations
    });

    let endTime = Date.now();
    if (status === 'False' || status === 'True') {
      endTime = new Date(lastTransitionTime).getTime();
    }

    const duration = (
      <FormattedDuration
        milliseconds={endTime - new Date(creationTimestamp).getTime()}
      />
    );

    return {
      id: `${namespace}:${pipelineRunName}`,
      name: url ? (
        <Link to={url} title={pipelineRunName}>
          {pipelineRunName}
        </Link>
      ) : (
        pipelineRunName
      ),
      pipeline:
        !hidePipeline &&
        (pipelineRefName ? (
          <Link
            to={createPipelineRunsByPipelineURL({
              namespace,
              pipelineName: pipelineRefName
            })}
            title={pipelineRefName}
          >
            {pipelineRefName}
          </Link>
        ) : (
          ''
        )),
      namespace: !hideNamespace && namespace,
      status: (
        <div className="definition">
          <div
            className="status"
            data-status={status}
            data-reason={reason}
            title={getPipelineRunStatusTooltip(pipelineRun, intl)}
          >
            {statusIcon}
          </div>
        </div>
      ),
      createdTime: <FormattedDate date={creationTimestamp} relative />,
      duration,
      type: pipelineRunType,
      dropdown: (
        <RunDropdown items={pipelineRunActions} resource={pipelineRun} />
      )
    };
  });

  return (
    <Table
      headers={headers}
      rows={pipelineRunsFormatted}
      loading={loading}
      selectedNamespace={selectedNamespace}
      emptyTextAllNamespaces={intl.formatMessage(
        {
          id: 'dashboard.emptyState.allNamespaces',
          defaultMessage: 'No {kind} under any namespace.'
        },
        { kind: 'PipelineRuns' }
      )}
      emptyTextSelectedNamespace={intl.formatMessage(
        {
          id: 'dashboard.emptyState.selectedNamespace',
          defaultMessage: 'No {kind} under namespace {selectedNamespace}'
        },
        { kind: 'PipelineRuns', selectedNamespace }
      )}
    />
  );
};

export default injectIntl(PipelineRuns);
