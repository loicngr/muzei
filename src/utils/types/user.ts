// https://dev.twitch.tv/docs/api/reference#get-users
import { RequestPagination } from "@/utils/types/index";

export type UserData = {
  id: number;
  login: string;
  display_name: string;
  type: string;
  broadcaster_type: string;
  description: string;
  created_at: string;
  profile_image_url: string;
  offline_image_url: string;
};

// https://dev.twitch.tv/docs/api/reference#get-channel-information
export type UserChannelData = {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  broadcaster_language: string;
  game_id: string;
  game_name: string;
  title: string;
  delay: number;
};

// https://dev.twitch.tv/docs/api/reference#get-streams
export type UserStreamsData = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
  is_mature: boolean;
  notified?: boolean;
};

export const stubUserStreamsData = {
  id: "",
  user_id: "",
  user_login: "",
  user_name: "",
  game_id: "",
  game_name: "",
  type: "",
  title: "",
  viewer_count: 0,
  started_at: "",
  language: "",
  thumbnail_url: "",
  tag_ids: [""],
  is_mature: "",
};

// https://dev.twitch.tv/docs/api/reference#get-broadcaster-subscriptions
export type UserSubscriptionsData = {
  broadcaster_id: string;
  broadcaster_login: string;
  broadcaster_name: string;
  gifter_id: string;
  gifter_login: string;
  gifter_name: string;
  is_gift: boolean;
  tier: string;
  plan_name: string;
  user_id: string;
  user_name: string;
  user_login: string;
};

// https://dev.twitch.tv/docs/api/reference#get-followed-streams
export type UserStreamsFollowedData = {
  id: string;
  user_id: string;
  user_login: string;
  user_name: string;
  game_id: string;
  game_name: string;
  type: string;
  title: string;
  viewer_count: number;
  started_at: string;
  language: string;
  thumbnail_url: string;
  tag_ids: string[];
};

// https://dev.twitch.tv/docs/api/reference#get-users-follows
export type UserFollowsData = {
  from_id: string;
  from_login: string;
  from_name: string;
  to_id: string;
  to_name: string;
  followed_at: string;
  streams?: UsersStreamsData;
};

export type UsersData = {
  data: UserData[];
};

export type UsersChannelData = {
  data: UserChannelData[];
};

export type UsersStreamsData = {
  data: UserStreamsData[];
  pagination: RequestPagination;
};

export type UsersStreamsFollowedData = {
  data: UserStreamsFollowedData[];
  pagination: RequestPagination;
};

export type UsersSubscriptionsData = {
  data: UserSubscriptionsData[];
  pagination: RequestPagination;
  total: number;
};

export type UsersFollowsData = {
  data: UserFollowsData[];
  pagination: RequestPagination;
  total: number;
};

export type UsersOnStreams = {
  data: UserStreamsData[];
};
