import { BaseEntity, Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class App extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'text', nullable: true, default: '' })
    display_name: string;

    @Column('jsonb', { nullable: false, default: {} })
    contents: AppContents;

    @CreateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    createdDate: Date
    
    @UpdateDateColumn({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP'})
    updatedDate: Date
}

interface AppContents {
    plugins: { [key: string]: {
        name: string;
        parent: string;
    } };
}