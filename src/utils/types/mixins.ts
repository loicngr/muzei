export type eventsHandlerItem = {
  type: string;
  action: string;
};

export type eventsHandler = {
  autoInit: boolean;
  autoDestroy: boolean;
  events: eventsHandlerItem[] | [];
};
