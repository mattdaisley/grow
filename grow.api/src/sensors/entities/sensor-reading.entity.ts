import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn } from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity()
export class SensorReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("decimal", { precision: 8, scale:  4})
    value: number;

    @CreateDateColumn()
    created_at: Date; // Creation date

    @ManyToOne(() => Sensor, (sensor) => sensor.sensorReadings)
    sensor: Sensor
}

