import {CorsOptions} from 'cors';
import {infrastructureMessages} from "@shared/constants/messages";


export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = process.env.CORS_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean) ?? [];

        if (!origin) {
            return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error(infrastructureMessages.error.corsBlockedOrigin(origin)));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    exposedHeaders: ["X-Request-Id"],
};
