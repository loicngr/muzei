import { AxiosInstance } from "axios";
import axiosInstance from "@/lib/axiosInstance";
import {
  TWITCH_BASE_URL,
  TWITCH_CLIENT_ID,
  TWITCH_OAUTH_BASE_URL,
  TWITCH_REDIRECT_URL,
  TWITCH_SCOPES,
} from "@/main";
import { RequestPagination } from "@/utils/types";

export const $http: AxiosInstance = axiosInstance;

export const USERS_ENDPOINT = (): string => TWITCH_BASE_URL + "/users";
export const CHANNELS_ENDPOINT = (): string => TWITCH_BASE_URL + "/channels";
export const STREAMS_ENDPOINT = (): string => TWITCH_BASE_URL + "/streams";
export const USERS_FOLLOWS_ENDPOINT = (): string =>
  USERS_ENDPOINT() + "/follows";

export const OAUTH_ENDPOINT = (
  clientId?: string,
  redirectUrl?: string,
  responseType?: string,
  scopes?: string
): string => {
  let _clientId = "?client_id=";
  _clientId += clientId ? clientId : TWITCH_CLIENT_ID;

  let _redirectUrl = "&redirect_uri=";
  _redirectUrl += redirectUrl ? redirectUrl : TWITCH_REDIRECT_URL;

  let _responseType = "&response_type=";
  _responseType += responseType ? responseType : "token";

  let _scopes = "&scope=";
  _scopes += scopes ? scopes : TWITCH_SCOPES;

  const urlParams = [_clientId, _redirectUrl, _responseType, _scopes].join("");
  return TWITCH_OAUTH_BASE_URL + urlParams;
};

export type PaginationDataTotal<E> = {
  endpoint: string;
  endpointOpts: string;
  data: Array<E>;
  pagination: RequestPagination;
  total: number;
};

export async function fetchPaginationData<E>(
  params: PaginationDataTotal<E>
): Promise<PaginationDataTotal<E>> {
  return new Promise((resolve, reject) => {
    const endpoint = `${params.endpoint}${params.endpointOpts}&after=${params.pagination.cursor}`;

    $http
      .get<PaginationDataTotal<E>>(endpoint)
      .then((response) => {
        params.pagination.cursor = response.data.pagination.cursor;
        params.data.push(...response.data.data);

        if (!params.pagination.cursor) {
          return resolve(params);
        }

        fetchPaginationData(params)
          .then((subResponse) => resolve(subResponse))
          .catch((error) => reject(error));
      })
      .catch((error) => reject(error));
  });
}
