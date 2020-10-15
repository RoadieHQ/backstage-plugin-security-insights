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

import { GithubPullRequestsApi } from './GithubPullRequestsApi';
import { Octokit } from '@octokit/rest';
import { PullsListResponseData } from '@octokit/types';
import { PullRequestState } from '../types';

export class GithubPullRequestsClient implements GithubPullRequestsApi {
  async listPullRequests({
    token,
    owner,
    repo,
    state,
  }: {
    token: string;
    owner: string;
    repo: string;
    state?: PullRequestState;
  }): Promise<{
    maxTotalItems?: number;
    pullRequestsData: PullsListResponseData;
  }> {
    const octokit = new Octokit({ auth: token });
    const repoTest = await octokit.request('GET /repos/{owner}/{repo}/languages', {
      owner: 'Roadiehq',
      repo: 'backstage-plugin-github',
    });
    const data2 = await repoTest.data;
    console.log(data2);

    const response = await octokit.request('GET /repos/{owner}/{repo}/code-scanning/alerts', {
      owner,
      repo,
      ...(state && {state}),
    });
    const data = await response.data;
    return {
      pullRequestsData: (data as any) as PullsListResponseData,
    };
  }
}
