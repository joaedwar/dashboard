/*
Copyright 2019 The Tekton Authors
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

import React, { Component } from 'react';
import { connect } from 'react-redux';
import { generatePath, NavLink } from 'react-router-dom';
import {
  SideNav as CarbonSideNav,
  SideNavItems,
  SideNavMenu,
  SideNavMenuItem
} from 'carbon-components-react';
import { ALL_NAMESPACES, urls } from '@tektoncd/dashboard-utils';

import { NamespacesDropdown } from '..';

import { selectNamespace } from '../../actions/namespaces';
import { getExtensions, getSelectedNamespace } from '../../reducers';
import { getCustomResource } from '../../api';

import './SideNav.scss';

export class SideNav extends Component {
  state = {
    isTriggersInstalled: false
  };

  componentDidMount() {
    const { match } = this.props;

    if (match && match.params.namespace) {
      this.props.selectNamespace(match.params.namespace);
    }

    this.checkTriggersInstalled();
  }

  componentDidUpdate(prevProps) {
    const { match } = this.props;
    if (!match) {
      return;
    }

    const { namespace } = match.params;
    const { match: prevMatch } = prevProps;
    const prevNamespace = prevMatch && prevMatch.params.namespace;

    if (namespace !== prevNamespace) {
      this.props.selectNamespace(namespace);
    }
  }

  getPath(path) {
    const { match } = this.props;
    if (match && match.params.namespace) {
      return urls.byNamespace({ namespace: match.params.namespace, path });
    }

    return path;
  }

  selectNamespace = event => {
    const namespace = event.selectedItem.id;
    const { history, match } = this.props;

    if (!match) {
      this.props.selectNamespace(namespace);
      return;
    }

    if (namespace === ALL_NAMESPACES) {
      this.props.selectNamespace(namespace);
      const currentURL = this.props.match.url;
      if (currentURL.includes(urls.taskRuns.all())) {
        history.push(urls.taskRuns.all());
        return;
      }
      if (currentURL.includes(urls.pipelineResources.all())) {
        history.push(urls.pipelineResources.all());
        return;
      }
      if (currentURL.includes(urls.pipelines.all())) {
        history.push(urls.pipelines.all());
        return;
      }
      history.push('/');
      return;
    }

    const newURL = generatePath(match.path, { namespace, 0: match.params[0] });
    history.push(newURL);
  };

  checkTriggersInstalled() {
    getCustomResource({
      group: 'apiextensions.k8s.io',
      version: 'v1beta1',
      type: 'customresourcedefinitions',
      name: 'eventlisteners.tekton.dev'
    })
      .then(() => {
        this.setState({ isTriggersInstalled: true });
      })
      .catch(() => {});
  }

  render() {
    const { extensions, namespace } = this.props;
    const { isTriggersInstalled } = this.state;

    return (
      <CarbonSideNav
        isFixedNav
        expanded
        isChildOfHeader={false}
        aria-label="Side navigation"
      >
        <SideNavItems>
          <SideNavMenu defaultExpanded title="Tekton">
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelines.all())}
            >
              Pipelines
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelineRuns.all())}
            >
              PipelineRuns
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.pipelineResources.all())}
            >
              PipelineResources
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.tasks.all())}
            >
              Tasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={urls.clusterTasks.all()}
            >
              ClusterTasks
            </SideNavMenuItem>
            <SideNavMenuItem
              element={NavLink}
              icon={<span />}
              to={this.getPath(urls.taskRuns.all())}
            >
              TaskRuns
            </SideNavMenuItem>
            {isTriggersInstalled && (
              <>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={urls.eventListeners.all()}
                >
                  EventListeners
                </SideNavMenuItem>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={urls.triggerBindings.all()}
                >
                  TriggerBindings
                </SideNavMenuItem>
                <SideNavMenuItem
                  element={NavLink}
                  icon={<span />}
                  to={urls.triggerTemplates.all()}
                >
                  TriggerTemplates
                </SideNavMenuItem>
              </>
            )}
          </SideNavMenu>
          <SideNavMenuItem
            element={NamespacesDropdown}
            id="sidenav-namespace-dropdown"
            selectedItem={{ id: namespace, text: namespace }}
            showAllNamespaces
            onChange={this.selectNamespace}
          >
            &nbsp;
          </SideNavMenuItem>
          <SideNavMenuItem
            element={NavLink}
            icon={<span />}
            to={urls.importResources()}
          >
            Import Tekton resources
          </SideNavMenuItem>
          <SideNavMenuItem element={NavLink} icon={<span />} to="/secrets">
            Secrets
          </SideNavMenuItem>
          <SideNavMenuItem
            element={NavLink}
            icon={<span />}
            to={urls.serviceAccounts.all()}
          >
            ServiceAccounts
          </SideNavMenuItem>
          <>
            {extensions.length > 0 &&
              extensions.map(
                ({
                  displayName,
                  name,
                  extensionType,
                  apiGroup,
                  apiVersion
                }) => (
                  <SideNavMenuItem
                    element={NavLink}
                    icon={<span />}
                    to={
                      extensionType === 'kubernetes-resource'
                        ? this.getPath(
                            urls.kubernetesResources.all({
                              group: apiGroup,
                              version: apiVersion,
                              type: name
                            })
                          )
                        : urls.extensions.byName({ name })
                    }
                    key={name}
                    title={displayName}
                  >
                    {displayName}
                  </SideNavMenuItem>
                )
              )}
          </>
        </SideNavItems>
      </CarbonSideNav>
    );
  }
}

/* istanbul ignore next */
const mapStateToProps = state => ({
  extensions: getExtensions(state),
  namespace: getSelectedNamespace(state)
});

const mapDispatchToProps = {
  selectNamespace
};

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideNav);
