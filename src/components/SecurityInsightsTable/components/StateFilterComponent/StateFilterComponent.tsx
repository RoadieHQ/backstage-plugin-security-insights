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
import { Box, Paper, ButtonGroup, Button } from '@material-ui/core';
import { StateFilterComponentProps } from '../../../../types';

export const StateFilterComponent: FC<StateFilterComponentProps> = ({
  insightsStatusFilter, value, setInsightsStatusFilter, setFilteredTableData
}) => (
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