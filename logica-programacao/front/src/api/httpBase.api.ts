import axios from "axios";
import {handleHttpResponseApi} from "./handleHttpResponse.api.ts";

const httpBase = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000/api",
    headers: {"Content-Type": "application/json"},
    timeout: 10000,
    withCredentials: true,
});

httpBase.interceptors.response.use(
    (response) => response,
    (error: unknown) => Promise.reject(handleHttpResponseApi.mapAxiosError(error)),
);

export default httpBase;
