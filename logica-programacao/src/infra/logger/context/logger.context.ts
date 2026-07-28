export class LoggerContext {
    constructor(
        public readonly className: string,
        public readonly method: string
    ) {
    }
}