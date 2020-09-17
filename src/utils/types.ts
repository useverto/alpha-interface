export enum NotificationType {
  error = "error",
  warning = "warning",
  log = "log",
  success = "success",
}

export interface IWatchlistElement {
  pst: string;
  period: number; // the last x hours (for e.g. 24h)
}
