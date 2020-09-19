export enum NotificationType {
  error = "error",
  warning = "warning",
  log = "log",
  success = "success",
}

export interface GraphqlQuery {
  query: string
  variables: Record<string, any> | null
}