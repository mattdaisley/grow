import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class App extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column('jsonb', { nullable: false, default: {} })
    contents: object;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdDate: Date
    
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedDate: Date
}

