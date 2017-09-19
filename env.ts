export const IS_PROD = process.env.NODE_ENV === "production";

export const API_BASE = IS_PROD
    ? "https://elune.fuli.news/api/"
    : "http://127.0.0.1:9000/api/";

// SSR Server
export const SSR_SERVER_HOST = IS_PROD
    ? "http://127.0.0.1"
    : "http://127.0.0.1";
export const SSR_SERVER_PORT = IS_PROD ? 9002 : 9002;
export const SESSION_COOKIE_NAME = "SESSIONID";
