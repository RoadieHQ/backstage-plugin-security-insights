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
import { Typography, Box } from '@material-ui/core';
import GitHubIcon from '@material-ui/icons/GitHub';
import WarningRoundedIcon from '@material-ui/icons/WarningRounded';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import NoteRoundedIcon from '@material-ui/icons/NoteRounded';
import { Progress, Table, TableColumn, useApi, githubAuthApiRef } from '@backstage/core';
import Alert from '@material-ui/lab/Alert';
import { Octokit } from '@octokit/rest';
import { useAsync } from 'react-use';
import moment from 'moment';
import { useProjectName } from '../useProjectName';
import { useProjectEntity } from '../useProjectEntity';
import { UpdateSeverityStatusModal } from '../UpdateSeverityStatusModal';
import { StateFilterComponent } from './components/StateFilterComponent';
import {
  SecurityInsightsTabProps,
  SecurityInsight,
  SecurityInsightFilterState
} from '../../types';

const getElapsedTime = (start: string) => {
  return moment(start).fromNow();
};

const getSeverityBadge = (severityLevel: string) => {
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

export const SecurityInsightsTable: FC<SecurityInsightsTabProps> = ({ entity }) => {
  const [insightsStatusFilter, setInsightsStatusFilter] = useState<SecurityInsightFilterState>(null);
  const [filteredTableData, setFilteredTableData] = useState<SecurityInsight[]>([]);
  const [tableData, setTableData] = useState<SecurityInsight[]>([]);
  const {owner, repo} = useProjectEntity(entity);
  const projectName = useProjectName(entity);
  const auth = useApi(githubAuthApiRef);

  const { value, loading, error } = useAsync(async (): Promise<SecurityInsight[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});
    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner: 'RoadieHQ' || owner,
      repo: 'backstage' || repo,
    });
    const data = await response.data;
    setTableData(data);
    return data;
  }, []);

  const generatedColumns: TableColumn[] = [
    {
      title: 'ID',
      field: 'number',
      width: '50px',
      highlight: true,
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
      field: 'rule.description',
      highlight: true,
      render: (row: Partial<SecurityInsight>) => (
        <Typography variant="body2" noWrap>
          {row?.rule?.description}
        </Typography>
      ),
    },
    {
    title: 'Severity',
    field: 'rule.severity',
    highlight: true,
    render: (row: Partial<SecurityInsight>) => {
      const severityLevel = row?.rule?.severity;
      return (
        <Box display="flex" alignItems="center" fontWeight="fontWeightLight">
          {severityLevel && getSeverityBadge(severityLevel)}
        </Box>
      )
    },
    },
    {
      title: 'State',
      field: 'state',
      highlight: true,
      render: (row: Partial<SecurityInsight>) => (
        row.state && row.number && (
          <UpdateSeverityStatusModal
            owner={owner}
            repo={repo}
            severityData={row.state}
            id={row.number}
            tableData={tableData}
            setTableData={setTableData}
          />
        )
      ),
    },
    {
      title: 'Tool',
      field: 'tool.name',
      highlight: true,
      render: (row: Partial<SecurityInsight>) => (
        <Typography variant="body2" noWrap>
          {row?.tool?.name}
        </Typography>
      ),
      },
    {
      title: 'Detected',
      field: 'created_at',
      highlight: true,
      render: (row: Partial<SecurityInsight>) => (
        <Typography variant="body2" noWrap>
          {getElapsedTime((row.created_at as string))}
        </Typography>
      ),
    },
  ];

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error">{error.message}</Alert>;
  }

  return value ? (
    <Table
      isLoading={loading}
      options={{
        paging: true,
        padding: 'dense',
      }}
      data={(insightsStatusFilter !== null && filteredTableData) || tableData}
      title={
        <>
          <Box display="flex" alignItems="center">
            <GitHubIcon />
            <Box mr={1} />
            <Typography variant="h6">{projectName}</Typography>
          </Box>
          <StateFilterComponent
            insightsStatusFilter={insightsStatusFilter}
            value={value}
            setInsightsStatusFilter={setInsightsStatusFilter}
            setFilteredTableData={setFilteredTableData}
          />
        </>
      }
      columns={generatedColumns}
    />
  ) : null;
};
