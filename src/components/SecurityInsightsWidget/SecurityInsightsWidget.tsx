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

import React, { useState, useEffect, FC } from 'react';
import {
  Box,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  makeStyles,
} from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress, StructuredMetadataTable, useApi, githubAuthApiRef } from '@backstage/core';
import { useAsync, useAsyncFn } from 'react-use';
import { Octokit } from '@octokit/rest';
import { useProjectEntity } from '../useProjectEntity';
import { getSeverityBadge } from '../utils';
import { 
  SecurityInsight,
  BranchList,
  SecurityInsightsWidgetProps,
  IssuesCounterProps,
  SeverityLevels,
  SecurityInsightFilterState,
} from '../../types';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    minHeight: '544px',
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

const IssuesCounter: FC<IssuesCounterProps> = ({ issues, issueStatus = null }) => {
  const countIssues = (type: SecurityInsightFilterState, severityLevel: SeverityLevels) => issues.reduce((acc, cur) =>
  (cur.state === type || issueStatus === null) && cur.rule.severity === severityLevel ? ++acc : acc, 0);

  const countWarningIssues = countIssues(issueStatus, 'warning');
  const countErrorIssues = countIssues(issueStatus, 'error');
  const countNoteIssues = countIssues(issueStatus, 'note');
  return (
    <Box display="flex" flexDirection="column">
      { getSeverityBadge('warning', countWarningIssues) }
      { getSeverityBadge('error', countErrorIssues) }
      { getSeverityBadge('note', countNoteIssues) }
    </Box>
  )
};

export const SecurityInsightsWidget: FC<SecurityInsightsWidgetProps> = ({ entity }) => {
  const { owner, repo } = useProjectEntity(entity);
  const classes = useStyles();
  const auth = useApi(githubAuthApiRef);
  const [branchName, setBranchName] = useState('');

  const [alerts, getAlerts] = useAsyncFn(async (ref): Promise<SecurityInsight[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});

    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner,
      repo,
      ...(ref && {ref: `refs/heads/${ref}`})
    });
    const data = await response.data;
    return data;
  }, []);

  const { value, loading, error } = useAsync(async (): Promise<BranchList[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});

    const response = await octokit.request('GET /repos/{owner}/{repo}/branches', {
      owner,
      repo,
    });

    const data = await response.data;
    return data;
  }, []);

  useEffect(() => {
    getAlerts(branchName);
  }, [branchName]);

  return (
    <InfoCard
      title="Security Insights"
      className={classes.infoCard}
      deepLink={{
        link: `https://github.com/${owner}/${repo}/security/code-scanning`,
        title: 'Security insights',
        onClick: (e) => {
          e.preventDefault();
          window.open(`https://github.com/${owner}/${repo}/security/code-scanning`);
        }
      }}
    >
      <Box position="relative">

        { error || alerts.error ? (
          <Alert severity="error" className={classes.infoCard}>
            {(error as Error | undefined)?.message || alerts.error?.message}
          </Alert>
        ) : null}
    
        { loading || alerts.loading ? <Box my={3}><Progress /></Box> 
        : (
          <>
            { alerts.value ? 
              <StructuredMetadataTable metadata={{
                'Total Issues': <IssuesCounter issues={alerts.value} />,
                'Open Issues': <IssuesCounter issues={alerts.value} issueStatus="open" />,
                'Dismissed Issues': <IssuesCounter issues={alerts.value} issueStatus="dismissed" />,
                'Fixed Isuess': <IssuesCounter issues={alerts.value} issueStatus="fixed" />,
              }} /> 
            : null }

            <Box display="flex" mt={3} justifyContent="flex-end">
              <FormControl>
                <Select
                  value={branchName}
                  displayEmpty
                  onChange={event => setBranchName((event.target.value as string))}
                  autoWidth
                >
                  <MenuItem value="">Default</MenuItem>
                  {value?.map(branch => <MenuItem key={branch.name} value={branch.name}>{branch.name}</MenuItem> )}
                </Select>
                <FormHelperText>Branch Name</FormHelperText>
              </FormControl>
            </Box>
          </>
        )}
      </Box>
    </InfoCard>
  );
}