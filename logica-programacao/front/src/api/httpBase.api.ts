import axios from "axios";
import {handleHttpResponseApi} from "./handleHttpResponse.api.ts";
import {createRequestId} from "@shared/telemetry/requestId.ts";

const httpBase = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
    headers: {"Content-Type": "application/json"},
    timeout: 10000,
    withCredentials: true,
});

httpBase.interceptors.request.use((config) => {
    const requestId = createRequestId();
    config.headers["X-Request-Id"] = requestId;
    config.headers["X-Trace-Id"] = requestId;
    return config;
});

httpBase.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(handleHttpResponseApi.mapAxiosError(error)),
);

export default httpBase;
