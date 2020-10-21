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

import React, { FC } from 'react';
import { makeStyles } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import { InfoCard, Progress, useApi, githubAuthApiRef } from '@backstage/core';
import { useAsync } from 'react-use';
import { Octokit } from '@octokit/rest';
import { useProjectEntity } from '../useProjectEntity';
import { SecurityInsight, SecurityInsightsWidgetProps } from '../../types';

const useStyles = makeStyles(theme => ({
  infoCard: {
    marginBottom: theme.spacing(3),
    '& + .MuiAlert-root': {
      marginTop: theme.spacing(3),
    },
  },
}));

export const SecurityInsightsWidget: FC<SecurityInsightsWidgetProps> = ({ entity }) => {
  const { owner, repo } = useProjectEntity(entity);
  const classes = useStyles();
  const auth = useApi(githubAuthApiRef);
  const { value, loading, error } = useAsync(async (): Promise<SecurityInsight[]> => {
    const token = await auth.getAccessToken(['repo']);
    const octokit = new Octokit({auth: token});
    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner,
      repo,
    });
    const data = await response.data;
    return data;
  }, []);

  if (loading) {
    return <Progress />;
  } else if (error) {
    return <Alert severity="error" className={classes.infoCard}>{error.message}</Alert>;
  }
  return value ? (
    <InfoCard title="Security Insights" className={classes.infoCard}>
      Open issues: 8
    </InfoCard>
  ) : null;
}