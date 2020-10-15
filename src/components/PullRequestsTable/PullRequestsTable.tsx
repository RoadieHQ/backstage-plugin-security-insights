/*
 * Copyright 2020 RoadieHQ
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React, { FC, useState } from 'react';
import { Typography, Box, Paper, ButtonGroup, Button } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Table, TableColumn } from '@backstage/core';
import { useProjectName } from '../useProjectName';
import { usePullRequests, PullRequest } from '../usePullRequests';
import { PullRequestState } from '../../types';
import { Entity } from '@backstage/catalog-model';

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'number',
    width: '150px',
    render: (row: Partial<PullRequest>) => (
      <Box fontWeight="fontWeightBold">
        <a target="_blank" href={row.url!}>
          #{row.number}
        </a>
      </Box>
    ),
  },
  {
    title: 'Description',
    field: 'description',
    highlight: true,
    render: (row: Partial<PullRequest>) => (
      <Typography variant="body2" noWrap>
        {row.description}
      </Typography>
    ),
  },
  {
    title: 'Created',
    field: 'createdTime',
    highlight: true,
    render: (row: Partial<PullRequest>) => (
      <Typography variant="body2" noWrap>
        {row.createdTime}
      </Typography>
    ),
  },
];

type Props = {
  loading: boolean;
  retry: () => void;
  projectName: string;
  prData?: PullRequest[];
  StateFilterComponent: FC<{}>;
};

type SecurityInsightsProps = {
  entity: Entity;
}

export const PullRequestsTableView: FC<Props> = ({
  projectName,
  loading,
  prData,
  StateFilterComponent,
}) => (
  <Table
    isLoading={loading}
    options={{ paging: true, padding: 'dense' }}
    actions={[]}
    data={prData || []}
    title={
      <>
        <Box display="flex" alignItems="center">
          <GitHubIcon />
          <Box mr={1} />
          <Typography variant="h6">{projectName}</Typography>
        </Box>
        <StateFilterComponent />
      </>
    }
    columns={generatedColumns}
  />
);

export const PullRequestsTable: FC<SecurityInsightsProps> = ({ entity }) => {
  const [PRStatusFilter, setPRStatusFilter] = useState<PullRequestState>(null);
  // const projectName = useProjectName(entity);
  const projectName = 'RoadieHQ/backstage-plugin-github-pull-requests'
  const [owner, repo] = projectName.split('/');

  const [tableProps, { retry }] = usePullRequests({
    state: PRStatusFilter,
    owner,
    repo,
  });

  const StateFilterComponent = () => (
    <Paper>
      <Box position="absolute" right={300} top={20}>
        <ButtonGroup color="primary" aria-label="text primary button group">
          <Button
            color={PRStatusFilter === 'open' ? 'primary' : 'default'}
            onClick={() => setPRStatusFilter('open')}
          >
            OPEN
          </Button>
          <Button
            color={PRStatusFilter === 'fixed' ? 'primary' : 'default'}
            onClick={() => setPRStatusFilter('fixed')}
          >
            FIXED
          </Button>
          <Button
            color={PRStatusFilter === 'dismissed' ? 'primary' : 'default'}
            onClick={() => setPRStatusFilter('dismissed')}
          >
            DISMISSED
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );

  return (
    <>
      <PullRequestsTableView
        {...tableProps}
        StateFilterComponent={StateFilterComponent}
        loading={tableProps.loading}
        retry={retry}
      />
    </>
  );
};
