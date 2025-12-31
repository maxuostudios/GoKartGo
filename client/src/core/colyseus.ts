import { Client } from "colyseus.js";

export const SERVER_URL = !import.meta.env.PROD
    ? `${location.protocol}//${location.host}/colyseus`
    : "";

export const colyseusSDK = new Client(SERVER_URL);