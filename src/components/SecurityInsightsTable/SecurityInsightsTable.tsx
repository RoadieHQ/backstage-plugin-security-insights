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
import { Typography, Box, Paper, ButtonGroup, Button, Chip } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import NoteRoundedIcon from '@material-ui/icons/NoteRounded';
import { Progress, Table, TableColumn, useApi, githubAuthApiRef } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { useProjectName } from '../useProjectName';
import { useProjectEntity } from '../useProjectEntity';
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import moment from 'moment';
import {
  SecurityInsightsTableProps,
  SecurityInsightsTabProps,
  SecurityInsight,
  SecurityInsightFilterState
} from '../../types';

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const getSeverityBadge = (severityLevel: string|undefined) => {
  switch(severityLevel) {
    case 'warning':
      return (
        <Box display="flex" alignItems="center" fontWeight="fontWeightLight" style={{ color: '#f57c00'}}>
          <WarningRoundedIcon fontSize="small"/> Warning
        </Box>
    );
    case 'error':
      return (
        <Box display="flex" alignItems="center" fontWeight="fontWeightLight" style={{ color: '#d32f2f'}}>
          <ErrorRoundedIcon fontSize="small"/> Error
        </Box>
    );
    case 'note':
      return (
        <Box display="flex" alignItems="center" fontWeight="fontWeightLight" style={{ color: '#1976d2'}}>
          <NoteRoundedIcon fontSize="small"/> Note
        </Box>
    );
    default: return 'Unknown';
  }
}

const getSeverityState = (severityState: SecurityInsightFilterState) => {
  switch(severityState) {
    case 'open':
      return (          
        <Chip
          label="Open"
          color="primary"
          variant="outlined"
          size="small"
        />
      );
    case 'dismissed':
      return (          
        <Chip
          label="Dismissed"
          color="primary"
          variant="outlined"
          size="small"
        />
      );
    case 'fixed':
      return (          
        <Chip
          label="Fixed"
          color="primary"
          variant="outlined"
          size="small"
        />
      )  ; 
    default: return 'Unknown';
  }
}

const generatedColumns: TableColumn[] = [
  {
    title: 'ID',
    field: 'number',
    width: '50px',
    render: (row: Partial<SecurityInsight>) => (
      <Box fontWeight="fontWeightBold">
        <a target="_blank" rel="noopener noreferrer" href={row.html_url}>
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
      <Box display="flex" alignItems="center" fontWeight="fontWeightLight" style={{ color: 'red'}}>
        {getSeverityBadge(severityLevel)}
      </Box>
    )
  },
  },
  {
    title: 'State',
    field: 'state',
    render: (row: Partial<SecurityInsight>) => (
      row.state && getSeverityState(row.state)
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

export const SecurityInsightsTableView: FC<SecurityInsightsTableProps> = ({
  projectName,
  loading,
  scanData,
  StateFilterComponent,
}) => (
  <Table
    isLoading={loading}
    options={{
      paging: true,
      padding: 'dense'
    }}
    actions={[]}
    data={scanData || []}
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

export const SecurityInsightsTable: FC<SecurityInsightsTabProps> = ({ entity }) => {
  const [insightsStatusFilter, setInsightsStatusFilter] = useState<SecurityInsightFilterState>(null);
  const [filteredTableData, setFilteredTableData] = useState<SecurityInsight[]>([]);
  const {owner, repo} = useProjectEntity(entity);
  const projectName = useProjectName(entity);
  const auth = useApi(githubAuthApiRef);

  const { value, loading, error } = useAsync(async (): Promise<SecurityInsight[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});
    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner: 'Roadiehq',
      repo: 'backstage',
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
            onClick={() => {
              insightsStatusFilter === 'open' ? setInsightsStatusFilter(null) : setInsightsStatusFilter('open');
              value && setFilteredTableData(value.filter(entry => entry.state ===  'open'))}
            }
          >
            OPEN
          </Button>
          <Button
            color={insightsStatusFilter === 'fixed' ? 'primary' : 'default'}
            onClick={() => {
              insightsStatusFilter === 'fixed' ? setInsightsStatusFilter(null) : setInsightsStatusFilter('fixed');
              value && setFilteredTableData(value.filter(entry => entry.state ===  'fixed'))}
            }
          >
            FIXED
          </Button>
          <Button
            color={insightsStatusFilter === 'dismissed' ? 'primary' : 'default'}
            onClick={() => {
              insightsStatusFilter === 'dismissed' ? setInsightsStatusFilter(null) : setInsightsStatusFilter('dismissed');
              value && setFilteredTableData(value.filter(entry => entry.state ===  'dismissed'))}
            }
          >
            DISMISSED
          </Button>
        </ButtonGroup>
      </Box>
    </Paper>
  );

  return value ? (
    <SecurityInsightsTableView
      scanData={(insightsStatusFilter !== null && filteredTableData) || value}
      projectName={projectName}
      StateFilterComponent={StateFilterComponent}
      loading={loading}
    />
  ) : null;
};
