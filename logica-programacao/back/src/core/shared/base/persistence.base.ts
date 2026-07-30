export abstract class PersistenceBase<TEntity, TModel> {
    abstract save(entity: TEntity): Promise<TEntity>;

    abstract findByPk(pk: number): Promise<TEntity | null>;

    abstract findAll(): Promise<TEntity[]>;

    abstract update(entity: TEntity): Promise<TEntity>;

    abstract deleteByPk(pk: number): Promise<void>;

    abstract toRecord(patient: TEntity): TModel;
}