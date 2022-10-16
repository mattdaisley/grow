import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Pump {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    index: number;

    @Column()
    doseRate: number;

    @Column()
    name: string;
}
