import {
  UserChannelData,
  UserData,
  UsersFollowsData,
  UsersOnStreams,
  UserStreamsData,
} from "@/utils/types/user";

export interface State {
  loading: boolean;
  user: UserData | null;
  users: null | Record<string, UserData>;
  stream: UserStreamsData | null;
  streams: UsersOnStreams | [];
  channel: UserChannelData | null;
  follows: UsersFollowsData | null;
  leftDrawerOpen: boolean;
  firstLaunch: boolean;
}
