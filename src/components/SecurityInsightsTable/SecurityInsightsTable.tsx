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

import React, { FC, useState, useEffect } from 'react';
import { Typography, Box, Paper, ButtonGroup, Button, Chip, makeStyles } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Progress, Table, TableColumn, useApi, githubAuthApiRef } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { useProjectName } from '../useProjectName';
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import moment from 'moment';
import { SecurityInsightFilterState } from '../../types';
import { Entity } from '@backstage/catalog-model';

const useStyles = makeStyles(() => ({
  repositoryTitle: {
    maxWidth: '100%',
  }
}));

type Props = {
  loading: boolean;
  projectName: string;
  prData?: SecurityInsight[];
  StateFilterComponent: FC<{}>;
};

type SecurityInsight = {
  number: number;
  html_url: string;
  title: string;
  state: string;
  rule: {
    severity: string;
    description: string;
  },
  tool: {
    name: string;
  }
  created_at: string;
};

type SecurityInsightsProps = {
  entity: Entity;
}

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const getSeverityBadge = (severityLevel: string|undefined) => {
  switch(severityLevel) {
    case 'warning':
      return 'Warning'
    case 'error':
      return 'Error'
    case 'note':
      return 'Note'
    default: return '';
  }
}

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'number',
    width: '50px',
    render: (row: Partial<SecurityInsight>) => (
      <Box fontWeight="fontWeightBold">
        <a target="_blank" href={row.html_url}>
          #{row.number}
        </a>
      </Box>
    ),
  },
  {
    title: 'Description',
    field: 'description',
    highlight: true,
    render: (row: Partial<SecurityInsight>) => (
      <Typography variant="body2" noWrap>
        {row?.rule?.description}
      </Typography>
    ),
  },
  {
  title: 'Severity',
  field: 'severity',
  highlight: true,
  render: (row: Partial<SecurityInsight>) => {
    const severityLevel = row?.rule?.severity;
    return (
      <Typography variant="body2" noWrap>
        {getSeverityBadge(severityLevel)}
      </Typography>
    )
  },
  },
  {
    title: 'State',
    field: 'state',
    render: (row: Partial<SecurityInsight>) => (
      row?.state === 'open'
        ? (
          <Chip
            label="Open"
            color="primary"
            variant="outlined"
            size="small"
          />
        )
        : (
          <Chip
            label="Dismissed"
            color="secondary"
            variant="outlined"
            size="small"
          />
        )
    ),
  },
  {
    title: 'Tool',
    field: 'tool',
    highlight: true,
    render: (row: Partial<SecurityInsight>) => (
      <Typography variant="body2" noWrap>
        {row?.tool?.name}
      </Typography>
    ),
    },
  {
    title: 'Detected',
    field: 'detectedTime',
    highlight: true,
    render: (row: Partial<SecurityInsight>) => (
      <Typography variant="body2" noWrap>
        {getElapsedTime((row.created_at as string))}
      </Typography>
    ),
  },
];

export const SecurityInsightsTableView: FC<Props> = ({
  projectName,
  loading,
  prData,
  StateFilterComponent,
}) => {
  const classes = useStyles();
  return (
  <Table
    isLoading={loading}
    options={{
      paging: true,
      padding: 'dense'
    }}
    actions={[]}
    data={prData || []}
    title={
      <>
        <Box display="flex" alignItems="center" className={classes.repositoryTitle}>
          <GitHubIcon />
          <Box mr={1} />
          <Typography variant="h6">{projectName}</Typography>
        </Box>
        <StateFilterComponent />
      </>
    }
    columns={generatedColumns}
  />
)};

export const SecurityInsightsTable: FC<SecurityInsightsProps> = ({ entity }) => {
  const [insightsStatusFilter, setinsightsStatusFilter] = useState<SecurityInsightFilterState>(null);
  // const projectName = useProjectName(entity);
  const projectName = 'RoadieHQ/backstage'
  const [owner, repo] = projectName.split('/');
  const auth = useApi(githubAuthApiRef);
  useEffect(() => {

  }, [insightsStatusFilter]);
  const { value, loading, error } = useAsync(async (): Promise<SecurityInsight[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});
    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner,
      repo,
      ...(insightsStatusFilter && {insightsStatusFilter}),
    });
    const data = await response.data;
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  const StateFilterComponent = () => (
    <Paper>
      <Box position="absolute" right={300} top={20}>
        <ButtonGroup color="primary" aria-label="text primary button group">
          <Button
            color={insightsStatusFilter === 'open' ? 'primary' : 'default'}
            onClick={() => setinsightsStatusFilter('open')}
          >
            OPEN
          </Button>
          <Button
            color={insightsStatusFilter === 'fixed' ? 'primary' : 'default'}
            onClick={() => setinsightsStatusFilter('fixed')}
          >
            FIXED
          </Button>
          <Button
            color={insightsStatusFilter === 'dismissed' ? 'primary' : 'default'}
            onClick={() => setinsightsStatusFilter('dismissed')}
          >
            DISMISSED
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );

  return (
    <>
      <SecurityInsightsTableView
        prData={value}
        projectName={projectName}
        StateFilterComponent={StateFilterComponent}
        loading={loading}
      />
    </>
  );
};
