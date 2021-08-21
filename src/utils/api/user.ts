import {
  UserChannelData,
  UserData,
  UsersChannelData,
  UsersData,
  UsersFollowsData,
  UsersStreamsData,
} from "@/utils/types/user";
import {
  $http,
  CHANNELS_ENDPOINT,
  STREAMS_ENDPOINT,
  USERS_ENDPOINT,
  USERS_FOLLOWS_ENDPOINT,
} from "@/utils/api/index";
import _ from "lodash";
import store from "@/store";
import { EventUserFollows } from "@/utils/types/events";

async function fetchUsers(
  id?: number,
  login?: string,
  users_id?: number[]
): Promise<UsersData> {
  let userEndpoint: string = USERS_ENDPOINT();

  if (users_id) {
    users_id.forEach((_user_id, i) => {
      const _wordEndpoint = i === 0 ? "?" : "&";
      userEndpoint += `${_wordEndpoint}id=${_user_id}`;
    });
  } else {
    if (id) {
      userEndpoint += `?id=${id}`;
    } else if (login) {
      userEndpoint += `?login=${login}`;
    }
  }

  return new Promise((resolve, reject) => {
    $http
      .get<UsersData>(userEndpoint)
      .then((response) => resolve(response["data"]))
      .catch((error) => reject(error));
  });
}

async function fetchUserChannel(
  broadcaster_id?: number
): Promise<UserChannelData> {
  let channelEndpoint: string = CHANNELS_ENDPOINT();

  if (!broadcaster_id) {
    const userData: UserData = store.getters["userData"];
    broadcaster_id = userData.id;
  }

  channelEndpoint += `?broadcaster_id=${broadcaster_id}`;

  return new Promise((resolve, reject) => {
    $http
      .get<UsersChannelData>(channelEndpoint)
      .then((response) => resolve(_.get(response, ["data", "data"], [])[0]))
      .catch((error) => reject(error));
  });
}

async function fetchUserFollows(
  params: EventUserFollows
): Promise<UsersFollowsData> {
  let followsEndpoint: string = USERS_FOLLOWS_ENDPOINT();

  if (!params.first) {
    params.first = 100;
  }
  if (params.from_id) {
    followsEndpoint += `?from_id=${params.from_id}`;
  } else if (params.to_id) {
    followsEndpoint += `?to_id=${params.to_id}`;
  }
  followsEndpoint += `&first=${params.first}`;

  return new Promise((resolve, reject) => {
    $http
      .get<UsersFollowsData>(followsEndpoint)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

async function fetchUserStreams(
  user_id?: number,
  users_id?: number[]
): Promise<UsersStreamsData> {
  let streamEndpoint: string = STREAMS_ENDPOINT();

  if (users_id) {
    users_id.forEach((_user_id, i) => {
      const _wordEndpoint = i === 0 ? "?" : "&";
      streamEndpoint += `${_wordEndpoint}user_id=${_user_id}`;
    });
  } else {
    if (!user_id) {
      const userData: UserData = store.getters["userData"];
      user_id = userData.id;
    }
    streamEndpoint += `?user_id=${user_id}`;
  }

  return new Promise((resolve, reject) => {
    $http
      .get<UsersStreamsData>(streamEndpoint)
      .then((response) => resolve(response.data))
      .catch((error) => reject(error));
  });
}

export { fetchUsers, fetchUserChannel, fetchUserFollows, fetchUserStreams };
