import {Table, Model, Column, PrimaryKey, AutoIncrement, ForeignKey, Default, DataType, BelongsTo} from 'sequelize-typescript';
import {File} from './file.model';
import { nanoid } from 'nanoid';

@Table
export class FileTo extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id: number;

    @ForeignKey(() => File)
    fileId: number

    @Column
    email: string

    @Default(false)
    @Column(DataType.BOOLEAN)
    isDownloaded: boolean

    @Default(() => nanoid(10))
    @Column
    token: string

    @BelongsTo(() => File)
    file: File
}