import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pump {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    index: number;

    @Column("decimal", { precision: 6, scale:  4})
    doseRate: number;

    @Column()
    name: string;
}
