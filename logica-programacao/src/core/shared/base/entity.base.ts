export abstract class EntityBase<T extends { id?: unknown }> {
    protected readonly props: T;

    protected constructor(props: T) {
        this.props = Object.freeze({...props});
    }

    protected cloneWith(overrides: Partial<T>): this {
        return new (this.constructor as new (props: T) => this)({...this.props, ...overrides});
    }

    getProps(): Readonly<T> {
        return this.props;
    }

    public static rehydrate<TCore extends { id?: unknown }, TEntity>(
        this: new (props: TCore) => TEntity,
        core: TCore,
    ): TEntity {
        return new this({...core});
    }
}
