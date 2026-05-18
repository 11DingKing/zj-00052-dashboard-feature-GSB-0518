export type CardType =
  | "line"
  | "bar"
  | "pie"
  | "heatmap"
  | "metric"
  | "table"
  | "progress"
  | "ranking";

export type RefreshInterval = 1 | 5 | 30 | "manual";

export type DashboardType = "ecommerce" | "logistics" | "customerService";

export type DataFieldType = "number" | "string" | "boolean";

export type ThresholdOperator = ">" | ">=" | "<" | "<=" | "==" | "!=";

export interface DataField {
  name: string;
  type: DataFieldType;
  label: string;
}

export interface DataGenerationRule {
  min: number;
  max: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export interface DataSource {
  id: string;
  name: string;
  description?: string;
  fields: DataField[];
  generationRules: Record<string, DataGenerationRule>;
  createdAt: number;
  updatedAt: number;
}

export interface AlertThreshold {
  field: string;
  operator: ThresholdOperator;
  value: number;
  enabled: boolean;
}

export interface CardConfig {
  id: string;
  type: CardType;
  title: string;
  x: number;
  y: number;
  w: number;
  h: number;
  dataSource: string;
  refreshInterval: RefreshInterval;
  colors: string[];
  unit: string;
  locked: boolean;
  alertThresholds: AlertThreshold[];
}

export interface Dashboard {
  id: string;
  name: string;
  type: DashboardType;
  cards: CardConfig[];
  createdAt: number;
  updatedAt: number;
}

export interface ShareToken {
  id: string;
  dashboardId: string;
  token: string;
  createdAt: number;
  expiresAt: number | null;
  viewCount: number;
}

export interface DataPoint {
  timestamp: number;
  value: number;
  [key: string]: any;
}

export interface ThemeState {
  isDark: boolean;
}
