# GitHub Security Insights Plugin for Backstage

![a list of security alerts](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-security-insights/main/docs/roadie-backstage-security-plugin.jpg)

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @roadiehq/backstage-plugin-security-insights
```

3. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as SecurityInsights } from '@roadiehq/backstage-plugin-security-insights';
```

4. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { Router as SecurityInsightsRouter } from '@roadiehq/backstage-plugin-security-insights';

...

const ServiceEntityPage = ({ entity }: { entity: Entity }) => (
  <EntityPageLayout>
    ...
    <EntityPageLayout.Content
          path="/security-insights"
          title="Security Insights"
          element={<SecurityInsightsRouter entity={entity} />}
        />
  </EntityPageLayout>
```

5. Run backstage app with `yarn start` and navigate to services tabs.

## Widget setup

![a list of security alert](https://raw.githubusercontent.com/RoadieHQ/backstage-plugin-security-insights/main/docs/backstage-plugin-security-widget-1.png)

1. You must install plugin by following the steps above to add widgets to your Overview.

2. Add widget to your Overview tab:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import {
  SecurityInsightsWidget,
  isPluginApplicableToEntity as isSecurityInsightsAvailable,
} from '@roadiehq/backstage-plugin-security-insights';

...

const OverviewContent = ({ entity }: { entity: Entity }) => (
  <Grid container spacing={3}>
    ...
    {isSecurityInsightsAvailable(entity) && (
      <>
        <Grid item md={6}>
          <SecurityInsightsWidget entity={entity} />
        </Grid>
      </>
    )}
  </Grid>
);

```

## Features

- List detected vulnerabilities for your repository, with filtering and search.
- Show basic statistics widget about detected vulnerabilities for your repository and branches.

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
