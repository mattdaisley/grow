import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany } from 'typeorm';
import { Sensor } from './sensor.entity';

@Entity()
export class SensorReading {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("decimal", { precision: 8, scale:  4})
    value: number;

    @ManyToOne(() => Sensor, (sensor) => sensor.sensorReadings)
    sensor: Sensor
}

