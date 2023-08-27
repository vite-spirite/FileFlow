import {Table, Model, Column, PrimaryKey, AutoIncrement, ForeignKey} from 'sequelize-typescript';
import {File} from './file.model';

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
}