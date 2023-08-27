import {Table, Model, Column, PrimaryKey, AutoIncrement, CreatedAt, HasMany} from 'sequelize-typescript';
import {FileTo} from './fileTo.model';

@Table
export class File extends Model<File> {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @Column
    from: string

    @HasMany(() => FileTo)
    to: FileTo[]

    @Column
    fileName: string

    @CreatedAt
    createdAt: Date

    @Column
    isEncrypted: boolean

    @Column
    deletedAt: Date
}