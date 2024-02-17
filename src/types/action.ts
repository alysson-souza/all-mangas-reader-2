export type SearchListAction = { action: "searchList"; mirror: string; search: string }

export type BaseAction = { key: string; action: string; url: string; mirror?: string }

export type AllActions = BaseAction | SearchListAction
