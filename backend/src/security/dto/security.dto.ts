import { nanoid } from "nanoid";
import { AllowNull, AutoIncrement, Column, Default, DeletedAt, Model, PrimaryKey, Table, Unique } from "sequelize-typescript";

@Table({ tableName: "security" })
export class Security extends Model<Security> {
    @AutoIncrement
    @PrimaryKey
    @Column
    id: number;

    @Default(() => nanoid(6))
    @Unique
    @Column
    token: string;

    @AllowNull(false)
    @Unique(true)
    @Column
    email: string

    @Default(() => new Date(new Date().getTime() + (60 * 60 * 1000)))
    @Column
    expiresAt: Date;
}
