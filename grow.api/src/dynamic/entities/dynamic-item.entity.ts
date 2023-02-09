import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
export class DynamicItem {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    itemKey: string;

    @Column()
    valueKey: string;

    @Column({nullable: true})
    value!: string | null;

    @CreateDateColumn()
    createdDate: Date
    
    @UpdateDateColumn()
    updatedDate: Date
}

