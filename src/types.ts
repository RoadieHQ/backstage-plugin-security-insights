import { FC } from 'react';
import { Entity } from '@backstage/catalog-model';

export type SecurityInsightFilterState = null | 'open' | 'fixed' | 'dismissed';

export type SecurityInsightsTableProps = {
  scanData?: SecurityInsight[];
  loading: boolean;
  projectName: string;
  StateFilterComponent: FC<{}>;
};

export type SecurityInsight = {
  number: number;
  html_url: string;
  title: string;
  state: SecurityInsightFilterState;
  rule: {
    severity: 'warning' | 'error' | 'note' ;
    description: string;
  },
  tool: {
    name: string;
  }
  created_at: string;
};

export type SecurityInsightsTabProps = {
  entity: Entity;
}
