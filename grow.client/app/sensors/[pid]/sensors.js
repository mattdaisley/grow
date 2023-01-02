'use client';

import { useState, useEffect, useRef } from "react";

import Link from 'next/link'
import { useSearchParams } from 'next/navigation';

import io from "socket.io-client";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import styles from '../../../styles/Home.module.css'
import loadSensorReadings from "./loadSensorReadings";
import getDateTime from "./getDateTime";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

let socket;

export default function Sensors({ sensor, readings }) {
  const searchParams = useSearchParams();
  const pid = searchParams.get('pid');

  const [lastMessage, setLastMessage] = useState("");
  const [lastValue, setLastValue] = useState(0);
  const [labels, setLabels] = useState([]);
  const [chartReadings, setChartReadings] = useState([]);
  const [readingsBuffer, setReadingsBuffer] = useState([]);
  const [readingInterval, setReadingInterval] = useState(5 * 60);
  const chartRef = useRef();

  useEffect(() => {
    socketInitializer();

    return () => socket && socket.close()
  }, []);

  useEffect(() => {
    const cleanedReadings = cleanReadingsData(readings ?? [], readingInterval).reverse();
    setChartReadings(cleanedReadings);
    setLabels(cleanedReadings.map(x => x.time));
  }, []);

  useEffect(() => {
    if (lastMessage === "") {
      return;
    }

    if (lastMessage.sensor.id === sensor.id) {
      setLastValue(lastMessage.value);

      if (chartRef?.current !== null) {
        let addedReading;
        chartRef.current.data.datasets.forEach((dataset) => {
          const prev = readingsBuffer[0] ?? dataset.data[dataset.data.length - 1];
          const next = cleanReadingData(lastMessage, readingInterval);
          if (prev.time === next.time) {
            const newReadingsBuffer = [...readingsBuffer, next];
            const averageBufferValue = newReadingsBuffer.reduce((a, b) => a + b.value, 0) / newReadingsBuffer.length;
            dataset.data[dataset.data.length - 1] = { time: prev.time, value: averageBufferValue }
            setReadingsBuffer(newReadingsBuffer);
          }
          else {
            dataset.data.shift();
            addedReading = next;
            dataset.data.push(addedReading);
            setReadingsBuffer([addedReading]);
          }
        });

        if (!!addedReading) {
          chartRef.current.data.labels.shift();
          chartRef.current.data.labels.push(addedReading.time);
        }

        setTimeout(() => chartRef.current.update(), 10);
      }
    }
  }, [lastMessage]);

  const socketInitializer = async () => {
    socket = io("https://grow.mattdaisley.com:444/sensors");

    socket.on("reading", (msg) => {
      const msgJson = JSON.parse(msg);
      setLastMessage(msgJson);
    });
  };

  const options = {
    responsive: true,
    animations: false,
    spanGaps: true,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    parsing: {
      xAxisKey: 'time',
      yAxisKey: 'value'
    }
  };

  const chartData = {
    labels,
    datasets: [
      {
        label: false,
        data: chartReadings,
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.5)',
      },
    ],
  };

  const loadLastHourData = async () => {
    const interval = 15;
    const readings = await loadSensorReadings(pid, getDateTime(1), interval, 1000);
    setReadingInterval(interval)
    processReadings(readings, interval);
  }

  const loadLastDayData = async () => {
    const interval = 5 * 60;
    const readings = await loadSensorReadings(pid, getDateTime(24), interval, 5 * 60);
    setReadingInterval(interval)
    processReadings(readings, interval);
  }

  const loadLastWeekData = async () => {
    const interval = 60 * 60;
    const readings = await loadSensorReadings(pid, getDateTime(24 * 7), interval, 24 * 7 * 60);
    setReadingInterval(interval)
    processReadings(readings, interval);
  }

  const processReadings = (readings, interval) => {
    const cleanedReadings = cleanReadingsData(readings ?? [], interval).reverse();
    setChartReadings(cleanedReadings);
    setLabels(cleanedReadings.map(x => x.time));
  }

  const cleanReadingsData = (readings, interval) => {
    const sorted = readings.sort((a, b) => new Date(b.date) - new Date(a.date));
    const normalized = [cleanReadingData(sorted[0], interval)];
    for (let i = 1; i < sorted.length; i++) {
      const prev = normalized[normalized.length - 1];
      const element = cleanReadingData(sorted[i], interval);
      if (element.time === prev.time) {
        normalized[normalized.length - 1] = { time: prev.time, value: (element.value + prev.value) / 2 };
      }
      else {
        normalized.push(element);
      }
    }
    return normalized;
  }

  const cleanReadingData = (reading, interval) => {
    let hInterval = 1;
    let mInterval = 1;
    let sInterval = 1;
    if (interval < 60) {
      sInterval = interval;
    }
    else if (interval < 60 * 60) {
      mInterval = interval / 60;
      sInterval = 0;
    }
    else {
      hInterval = interval / 60 / 24;
      mInterval = 0;
      sInterval = 0;
    }
    const d = reading.time ? new Date(Date.parse(`${reading.time} GMT`)) : new Date(Date.parse(`${reading.created_at}`));
    let h = hInterval === 0 ? "00" : Math.floor(d.getHours() / hInterval) * hInterval;
    let m = mInterval === 0 ? "00" : Math.floor(d.getMinutes() / mInterval) * mInterval;
    let s = sInterval === 0 ? "00" : Math.floor(d.getSeconds() / sInterval) * sInterval;
    let time = h + ":" + m + ":" + s;
    let day = (d.getMonth() + 1) + "/" + d.getDate() + "/" + d.getFullYear();
    return {
      time: new Date(`${day} ${time}`).toLocaleTimeString('en-us', { timeZone: 'US/Mountain' }),
      value: Math.round(reading.value)
    }
  }

  return (
    <>
      <Link href={`/`}>&lt; Back</Link>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>{sensor.id}: {sensor.name}</h2>
          <p>Index: {sensor.index}</p>
          <p>Offset: {sensor.offset}</p>
          <p>Value: {lastValue.toFixed(2)}</p>
          <p>
            <button onClick={loadLastHourData}>Last Hour</button>
            <button onClick={loadLastDayData}>Last Day</button>
            <button onClick={loadLastWeekData}>Last Week</button>
          </p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {chartReadings.length > 0 && <Line options={options} data={chartData} ref={chartRef} />}
      </div>
    </>
  )
}


