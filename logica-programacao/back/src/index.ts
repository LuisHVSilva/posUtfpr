import "./bootstrap/env";
import {commonMessages} from "@shared/constants/messages";
import server from "./framework/server";

(async () => {
    try {
        await server.start();
    } catch (err) {
        console.error(commonMessages.error.serverError, err);
    }
})();
