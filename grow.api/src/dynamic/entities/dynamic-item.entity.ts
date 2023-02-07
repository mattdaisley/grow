import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

@Entity()
export class DynamicItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    ItemKey: string;

    @Column()
    ValueKey: string;

    @Column({nullable: true})
    Value!: string | null;

}

