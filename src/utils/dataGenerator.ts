import { faker } from "@faker-js/faker";
import type { DataSource } from "@/types";

export const dataSources = [
  "sales",
  "orders",
  "users",
  "traffic",
  "conversion",
  "delivery",
  "inventory",
  "complaints",
  "satisfaction",
  "responseTime",
];

export function generateDataPoint(source: string): any {
  const baseValue = getBaseValue(source);
  const variation = baseValue * 0.1;

  switch (source) {
    case "sales":
      return {
        timestamp: Date.now(),
        value: faker.number.int({
          min: baseValue - variation,
          max: baseValue + variation,
        }),
        orders: faker.number.int({ min: 50, max: 200 }),
        avgOrderValue: faker.number.float({
          min: 50,
          max: 500,
          fractionDigits: 2,
        }),
      };
    case "orders":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 50, max: 200 }),
        pending: faker.number.int({ min: 5, max: 30 }),
        completed: faker.number.int({ min: 30, max: 150 }),
        cancelled: faker.number.int({ min: 1, max: 10 }),
      };
    case "users":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 100, max: 500 }),
        newUsers: faker.number.int({ min: 10, max: 100 }),
        activeUsers: faker.number.int({ min: 50, max: 300 }),
      };
    case "traffic":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 1000, max: 10000 }),
        pv: faker.number.int({ min: 5000, max: 50000 }),
        uv: faker.number.int({ min: 1000, max: 10000 }),
      };
    case "conversion":
      return {
        timestamp: Date.now(),
        value: faker.number.float({ min: 1, max: 10, fractionDigits: 2 }),
        cartToOrder: faker.number.float({
          min: 20,
          max: 60,
          fractionDigits: 2,
        }),
        visitToCart: faker.number.float({ min: 5, max: 20, fractionDigits: 2 }),
      };
    case "delivery":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 50, max: 200 }),
        onTime: faker.number.int({ min: 40, max: 180 }),
        delayed: faker.number.int({ min: 1, max: 20 }),
        avgTime: faker.number.float({ min: 2, max: 48, fractionDigits: 1 }),
      };
    case "inventory":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 1000, max: 10000 }),
        lowStock: faker.number.int({ min: 10, max: 100 }),
        outOfStock: faker.number.int({ min: 0, max: 20 }),
      };
    case "complaints":
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 0, max: 50 }),
        resolved: faker.number.int({ min: 0, max: 40 }),
        pending: faker.number.int({ min: 0, max: 20 }),
      };
    case "satisfaction":
      return {
        timestamp: Date.now(),
        value: faker.number.float({ min: 3, max: 5, fractionDigits: 2 }),
        verySatisfied: faker.number.int({ min: 100, max: 500 }),
        satisfied: faker.number.int({ min: 50, max: 300 }),
        neutral: faker.number.int({ min: 20, max: 100 }),
        dissatisfied: faker.number.int({ min: 0, max: 50 }),
      };
    case "responseTime":
      return {
        timestamp: Date.now(),
        value: faker.number.float({ min: 10, max: 300, fractionDigits: 1 }),
        avgResponse: faker.number.float({
          min: 30,
          max: 120,
          fractionDigits: 1,
        }),
        maxResponse: faker.number.float({
          min: 100,
          max: 600,
          fractionDigits: 1,
        }),
      };
    default:
      return {
        timestamp: Date.now(),
        value: faker.number.int({ min: 100, max: 1000 }),
      };
  }
}

export function generateDataPointForCustomSource(dataSource: DataSource): any {
  const point: any = { timestamp: Date.now() };

  dataSource.fields.forEach((field) => {
    const rule = dataSource.generationRules[field.name];
    if (field.type === "number" && rule) {
      const min = rule.min || 0;
      const max = rule.max || 100;
      const decimals = rule.decimals || 0;
      point[field.name] = faker.number.float({
        min,
        max,
        fractionDigits: decimals,
      });
    } else if (field.type === "string") {
      point[field.name] = faker.lorem.word();
    } else if (field.type === "boolean") {
      point[field.name] = faker.datatype.boolean();
    }
  });

  if (!point.value && dataSource.fields.length > 0) {
    const firstNumberField = dataSource.fields.find((f) => f.type === "number");
    if (firstNumberField) {
      point.value = point[firstNumberField.name];
    }
  }

  return point;
}

function getBaseValue(source: string): number {
  const baseValues: Record<string, number> = {
    sales: 10000,
    orders: 100,
    users: 300,
    traffic: 5000,
    conversion: 5,
    delivery: 100,
    inventory: 5000,
    complaints: 20,
    satisfaction: 4.5,
    responseTime: 60,
  };
  return baseValues[source] || 1000;
}

export function generateInitialHistory(
  source: string,
  count: number = 50,
): any[] {
  const history: any[] = [];
  const now = Date.now();
  for (let i = count - 1; i >= 0; i--) {
    const point = generateDataPoint(source);
    point.timestamp = now - i * 60000;
    history.push(point);
  }
  return history;
}

export function generateRankingData(
  count: number = 10,
): Array<{ name: string; value: number }> {
  return Array.from({ length: count }, () => ({
    name: faker.commerce.productName(),
    value: faker.number.int({ min: 100, max: 10000 }),
  })).sort((a, b) => b.value - a.value);
}

export function generateTableData(rows: number = 10): any[] {
  return Array.from({ length: rows }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    status: faker.helpers.arrayElement([
      "pending",
      "processing",
      "completed",
      "cancelled",
    ]),
    amount: faker.number.float({ min: 10, max: 1000, fractionDigits: 2 }),
    date: faker.date.recent().toLocaleDateString(),
  }));
}

export function generateHeatmapData(): number[][] {
  const data: number[][] = [];
  for (let i = 0; i < 10; i++) {
    const row: number[] = [];
    for (let j = 0; j < 10; j++) {
      row.push(faker.number.int({ min: 0, max: 100 }));
    }
    data.push(row);
  }
  return data;
}
