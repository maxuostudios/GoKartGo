import { Client } from "colyseus.js";

export const SERVER_URL = !import.meta.env.PROD
    ? `${location.protocol}//${location.host}/colyseus`
    : process.env.SERVER_URL_ENV;

export const colyseusSDK = new Client(SERVER_URL);