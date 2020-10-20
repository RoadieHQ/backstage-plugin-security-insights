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

import React from 'react';
import { render } from '@testing-library/react';
import mockFetch from 'jest-fetch-mock';
import { SecurityInsightsTableView } from './SecurityInsightsTable';

describe('SecurityInsightsTable', () => {
  it('should render', async () => {
    mockFetch.mockResponse(() => new Promise(() => {}));
    const testProjectName = 'octokit/test-project-name';
    const rendered = render(
      <SecurityInsightsTableView
        projectName={testProjectName}
        loading={false}
        StateFilterComponent={() => <></>}
        scanData={[]}
      />,
    );
    expect(await rendered.findByText(testProjectName)).toBeInTheDocument();
  });
  it('should render table list item', async () => {
    mockFetch.mockResponse(() => new Promise(() => {}));
    const testTitle = 'Add migration for entity_search column fix';
    const rendered = render(
      <>
        <SecurityInsightsTableView
          projectName="test"
          loading={false}
          StateFilterComponent={() => <></>}
          scanData={[
            {
              number: 1862,
              title: testTitle,
              html_url: 'https://api.github.com/repos/spotify/backstage/pulls/1862',
              state: 'open',
              rule: {
                severity: 'warning',
                description: 'Example warning',
              },
              tool: {
                name: 'CodeQL Scan'
              },
              created_at: '2 hours ago',
            },
          ]}
        />
        ,
      </>,
    );
    expect(await rendered.findByText(testTitle)).toBeInTheDocument();
  });
});
