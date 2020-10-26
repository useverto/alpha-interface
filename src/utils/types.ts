import type { DocumentNode } from "graphql";

export enum NotificationType {
  error = "error",
  warning = "warning",
  log = "log",
  success = "success",
}

export interface IWatchlistElement {
  id: string;
  name: string;
  ticker: string;
  period: number; // the last x hours (for e.g. 24h)
}

export interface GraphqlQuery {
  query: DocumentNode | string;
  variables: Record<string, any> | null;
}

export interface TradingPost {
  addr: string;
  reputation: number;
  balance: string;
  stake: number;
}

export interface Transaction {
  id: string;
  amount: number;
  type: string;
  status: string;
  timestamp: number;
}

export interface Token {
  id: string;
  name: string;
  ticker: string;
}

export interface Exchange {
  id: string;
  timestamp: string;
  type: string;
  sent: string;
  received: string;
  status: string;
  duration: string;
}

export interface LatestExchange {
  id: string;
  type: string;
  sent: string;
  received: string;
  rate: string;
  ticker: string;
  matched: boolean;
}

export interface Trade {
  id: string;
  amount: number;
  pst: string;
}

export interface TokenInstance {
  txID: string;
  amnt: number;
  rate?: number;
  addr: string;
  type: string;
  createdAt: Date;
  received: number;
}

export enum Theme {
  Light = "Light",
  Dark = "Dark",
  Auto = "Auto",
}

export enum DisplayTheme {
  Light = "Light",
  Dark = "Dark",
}

export interface IProfile {
  address: string;
  keyfile: string;
}

export enum TradeMode {
  Buy = "Buy",
  Sell = "Sell",
}

export enum SwapMode {
  CHAIN = "CHAIN",
  AR = "AR",
}
