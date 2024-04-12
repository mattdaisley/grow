import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class App extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb', { nullable: false, default: {} })
    contents: string;

    @CreateDateColumn()
    createdDate: Date
    
    @UpdateDateColumn()
    updatedDate: Date
}

