import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { SensorReading } from './sensor-reading.entity';

@Entity()
export class Sensor {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    index: string;

    @Column("decimal", { precision: 6, scale:  4})
    offset: number;

    @Column()
    name: string;

    @OneToMany(() => SensorReading, (sensorReading) => sensorReading.sensor)
    sensorReadings: SensorReading[]
}

