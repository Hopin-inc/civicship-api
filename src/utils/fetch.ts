import fetch, { RequestInit, ResponseInit } from "node-fetch";

export const fetchData = async <T = unknown>(
  url: string,
  init?: RequestInit,
  onError?: (response: ResponseInit) => void,
): Promise<T> =>{
  const response = await fetch(url, init);

  if (!response.ok) {
    if (onError) {
      onError(response);
    } else {
      throw new Error(`HTTP error! Status: ${ response.status }`);
    }
  }

  return await response.json() as T;
};
