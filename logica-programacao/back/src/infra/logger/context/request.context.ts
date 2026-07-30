import {AsyncLocalStorage} from "async_hooks";

export interface RequestLogContext {
    requestId: string;
    method: string;
    path: string;
    participantId?: number;
}

const storage = new AsyncLocalStorage<RequestLogContext>();

export const RequestContext = {
    run<T>(context: RequestLogContext, callback: () => T): T {
        return storage.run(context, callback);
    },

    get(): RequestLogContext | undefined {
        return storage.getStore();
    },
};
