import "@infra/di/index.container";
import express, {Application} from "express";
import cors from "cors";
import helmet from "helmet";
import swaggerUi from "swagger-ui-express";
import {corsOptions} from "./cors.config";
import {ErrorHandlerMiddleware} from "@shared/middleware/errorHandler.middleware";
import {LoggerExecution} from "@infra/logger/decorators/loggerExecution";
import {commonMessages} from "@shared/constants/messages";
import {router} from "./routes";
import {openApiDocument} from "./openapi";
import {initDb} from "@infra/persistence/migrations/index.migration";

class Server {
    private readonly _app: Application;
    private readonly JSON_LIMIT_BODY_SIZE: string = '100mb';
    private readonly API_PATH: string = 'api';

    constructor() {
        this._app = express();
        this.disables();
        this.middlewares();
        this.router();
        this.errorHandling();
    };

    private disables(): void {
        this._app.disable("x-powered-by");
    }

    private middlewares(): void {
        this._app.use(/.*/, cors(corsOptions));
        this._app.use(helmet()); // Segurança HTTP
        this._app.use(express.json({limit: this.JSON_LIMIT_BODY_SIZE}))
        this._app.use(express.urlencoded({extended: true}));
        this._app.set('trust proxy', true);
    };

    private router(): void {
        this._app.use("/", swaggerUi.serve);
        this._app.get("/", swaggerUi.setup(openApiDocument, {
            explorer: true,
            customSiteTitle: "Hospital Queue API - Swagger",
        }));

        this._app.get("/openapi.json", (_req, res) => {
            res.json(openApiDocument);
        });

        this._app.use(`/${this.API_PATH}`, router)
    };

    private errorHandling(): void {
        this._app.use(ErrorHandlerMiddleware.handleError);
    };

    @LoggerExecution()
    public async start(): Promise<void> {
        try {
            initDb();
            const port: number = Number(process.env.PORT);
            this._app.listen(port, () => {
                console.log(commonMessages.info.serverRunning(port));
            });
        } catch (error) {
            console.log(error);
        }
    };
}

export default new Server();
