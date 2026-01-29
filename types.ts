export interface ChatItem {
  element: HTMLElement,
  children: ChatItem[]
}

export interface favouritedChat {
  iconName: string,
  chatId: string,
  scrollTop: number,
  preview: string,
  url?: string,
  title?: string,
  provider?: string,
}


export interface ReactComponentMap {
  [key: string]: React.ComponentType<any>
}
