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

import {
  createComponentExtension,
  createPlugin,
  createRoutableExtension,
  createRouteRef,
} from '@backstage/core-plugin-api';

export const entityContentRouteRef = createRouteRef({
  title: 'security-insights',
});

export const securityInsightsPlugin = createPlugin({
  id: 'security-insights',
  routes: {
    entityContent: entityContentRouteRef,
  },
});

export const EntitySecurityInsightsContent = securityInsightsPlugin.provide(
  createRoutableExtension({
    component: () => import('./components/Router').then((m) => m.Router),
    mountPoint: entityContentRouteRef,
  })
);

export const EntitySecurityInsightsCard = securityInsightsPlugin.provide(
  createComponentExtension({
    component: {
      lazy: () =>
        import('./components/SecurityInsightsWidget').then(
          (m) => m.SecurityInsightsWidget
        ),
    },
  })
);
