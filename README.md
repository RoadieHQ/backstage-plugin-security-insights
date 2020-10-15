# GitHub Plugin for Backstage

![GitHub Plugin for Backstage by Roadie](https://github.com/RoadieHQ/backstage-plugin-github/blob/master/docs/roadie-backstage-github-plugin.jpg?raw=true)

## Plugin Setup

1. If you have standalone app (you didn't clone this repo), then do

```bash
yarn add @roadiehq/backstage-plugin-github
```

3. Add plugin to the list of plugins:

```ts
// packages/app/src/plugins.ts
export { plugin as GitHub } from '@roadiehq/backstage-plugin-github';
```

4. Add plugin API to your Backstage instance:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { InsightsRouter, PullRequestsRouter } from '@roadiehq/backstage-plugin-github';

...

const ServiceEntityPage = ({ entity }: { entity: Entity }) => (
  <EntityPageLayout>
    ...
    <EntityPageLayout.Content
      path="/code-insights"
      title="Code Insights"
      element={<InsightsRouter entity={entity} />}
    />
    <EntityPageLayout.Content
      path="/pull-request"
      title="Pull Requests"
      element={<InsightsRouter entity={entity} />}
    />
  </EntityPageLayout>
);

const WebsiteEntityPage = ({ entity }: { entity: Entity }) => (
  <EntityPageLayout>
    ...
    <EntityPageLayout.Content
      path="/code-insights"
      title="Code Insights"
      element={<InsightsRouter entity={entity} />}
    />
    <EntityPageLayout.Content
      path="/pull-request"
      title="Pull Requests"
      element={<InsightsRouter entity={entity} />}
    />
  </EntityPageLayout>
);
```

5. Run backstage app with `yarn start` and navigate to services tabs.

## Widgets setup

1. You must install plugin first (this is step is necessary only if you don't installed plugin in previous step).

```bash
yarn add @roadiehq/backstage-plugin-github
```

2. There are five widgets to choose from right now:
  * Pull Requests - shows Pull Requests statistics
  * Contributors - shows project contributors list
  * Languages - shows with programming languages used in project
  * ReadMe - shows ReadMe text
  * Releases - shows informations about releases

3. Adding widgets to your Overview tab is simple. For example in order to add Pull Requests widget:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { ContributorsCard } from '@roadiehq/backstage-plugin-github';

...

const OverviewContent = ({ entity }: { entity: Entity }) => (
  <Grid container spacing={3}>
    ...
    <Grid item md={6}>
      <ContributorsCard entity={entity} />
    </Grid>
  </Grid>
);

```

4. All widgets can be added same way as the Pull Request widget using following names to import:
  * PullRequestsStatsCard
  * ContributorsCard
  * LanguagesCard
  * ReadMeCard
  * ReleasesCard

so for example you wanna add ReadMe widget:

```ts
// packages/app/src/components/catalog/EntityPage.tsx
import { ReadMeCard } from '@roadiehq/backstage-plugin-github';

...

const OverviewContent = ({ entity }: { entity: Entity }) => (
  <Grid container spacing={3}>
    ...
    <Grid item md={6}>
      <ReadMeCard entity={entity} />
    </Grid>
  </Grid>
);

```
## Features

- List Pull Requests with filtering and search as well as Releases, Contributors, Languages and Read Me for your repository.
- 5 widgets available to show data directly on the Overview tab of your component.

## Links

- [Backstage](https://backstage.io)
- Get hosted, managed Backstage for your company: https://roadie.io
