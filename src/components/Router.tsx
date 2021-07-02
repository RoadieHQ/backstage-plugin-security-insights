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
import { Entity } from '@backstage/catalog-model';
import { Routes, Route } from 'react-router';
import { MissingAnnotationEmptyState } from '@backstage/core-components';
import { entityContentRouteRef } from '../plugin';
import { GITHUB_REPO_ANNOTATION } from './useProjectName';
import SecurityInsightsTab from './SecurityInsightsTab';
import { useEntity } from "@backstage/plugin-catalog-react";

export const isSecurityInsightsAvailable = (entity: Entity) =>
  Boolean(entity.metadata.annotations?.[GITHUB_REPO_ANNOTATION]);

type Props = {
  /** @deprecated The entity is now grabbed from context instead */
  entity?: Entity;
};

export const Router = (_props: Props) => {
  const { entity } = useEntity();
  return !isSecurityInsightsAvailable(entity) ? (
      <MissingAnnotationEmptyState annotation={GITHUB_REPO_ANNOTATION} />
  ) : (
      <Routes>
        <Route
            path={`/${entityContentRouteRef.path}`}
            element={<SecurityInsightsTab entity={entity} />}
        />
      </Routes>
  );
};
