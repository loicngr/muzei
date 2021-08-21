export type RequestPagination = {
  cursor: string;
};

export type RequestTotal = {
  total: number;
};

export type RequestData = {
  data: [];
};

export type StreamValue = {
  username: string;
  player: {
    height: number;
    width: number;
  };
  chat: {
    height: number;
    width: number;
  };
};
export const StreamStubValue = {
  username: "",
  player: {
    height: 378,
    width: 620,
  },
  chat: {
    height: 378,
    width: 200,
  },
};

export type StreamItemValue = {
  username: string;
  height?: number;
  width?: number;
  forced?: boolean;
};
export const StreamPlayerStubValue = {
  username: "",
  height: 378,
  width: 620,
  forced: false,
};
export const StreamChatStubValue = {
  username: "",
  height: 378,
  width: 200,
  forced: false,
};
