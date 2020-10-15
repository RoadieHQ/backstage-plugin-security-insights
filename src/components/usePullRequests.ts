/* eslint-disable @typescript-eslint/camelcase */
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
import { useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { githubPullRequestsApiRef } from '../api/GithubPullRequestsApi';
import { useApi, githubAuthApiRef } from '@backstage/core';
import { PullsListResponseData } from '@octokit/types';
import moment from 'moment';
import { PullRequestState } from '../types';

export type PullRequest = {
  id: number;
  number: number;
  url: string;
  title: string;
  updatedTime: string;
  createdTime: string;
};

export function usePullRequests({
  owner,
  repo,
  state,
}: {
  owner: string;
  repo: string;
  branch?: string;
  state?: PullRequestState;
}) {
  const api = useApi(githubPullRequestsApiRef);
  const auth = useApi(githubAuthApiRef);

  const getElapsedTime = (start: string) => {
    return moment(start).fromNow();
  };

  const { loading, value: prData, retry, error } = useAsyncRetry<PullRequest[]>(
  async () => {
    const token = await auth.getAccessToken(['repo']);
    if (!repo) {
      return [];
    };
    return (
      api
        // GitHub API pagination count starts from 1
        .listPullRequests({
          token,
          owner,
          repo,
          state,
        })
        .then(
          ({
            pullRequestsData,
          }: {
            pullRequestsData: PullsListResponseData;
          }) => {
            console.log(pullRequestsData);
            return pullRequestsData.map(
              (element) => ({
                id: element.id,
                url: element.html_url,
                number: element.number,
                description: element.rule.description,
                title: element.number,
                createdTime: getElapsedTime(element.created_at),
              }),
            );
          },
        )
    );
  }, []);

  useEffect(() => {
    retry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);

  return [
    {
      loading,
      prData,
      projectName: `${owner}/${repo}`,
      error,
    },
    {
      prData,
      retry,
    },
  ] as const;
}
