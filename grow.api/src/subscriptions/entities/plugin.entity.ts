import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Plugin extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: false })
    key: string;

    @Column('jsonb', { nullable: false, default: {} })
    contents: PluginContents;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdDate: Date
    
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedDate: Date
}

interface PluginContents {
    name: string;
    parent: string;
    properties: {
        [key: string]: {
            name: string;
            type: string;
        };
    };
}