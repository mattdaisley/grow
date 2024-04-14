import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity()
export class AppCollection extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Index()
    @Column()
    appKey: number;

    @Column('jsonb', { nullable: false, default: {} })
    contents: object;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdDate: Date
    
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedDate: Date
}

