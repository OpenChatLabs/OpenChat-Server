/** 用户相对某聊天节点的位置（节点域名为路由目标） */
export type Location = {
  /** 登记用户；仅表示本机节点（如 /me）时可省略 */
  username?: string
  domain: string
}
export type MyLocation = {
  location: Location
}
/** 按用户名查询到的在线节点 */
export type UserLocation = {
  username: string
  location: Location
}
