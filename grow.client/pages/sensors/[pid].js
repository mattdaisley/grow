import io from "socket.io-client";
import { useState, useEffect, useRef } from "react";
import Link from 'next/link'
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
import { useRouter } from 'next/router'
import { Line } from 'react-chartjs-2';
import styles from '../../styles/Home.module.css'

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

const cleanReadingsData = (readings) => {
  const sorted = readings.sort((a, b) => new Date(b.date) - new Date(a.date));
  const normalized = [cleanReadingData(sorted[0])];
  for (let i = 1; i < sorted.length; i++) {
    const prev = normalized[normalized.length - 1];
    const element = cleanReadingData(sorted[i]);
    if (element.created_at === prev.created_at) {
      normalized[normalized.length - 1] = { created_at: prev.created_at, value: (element.value + prev.value) / 2 };
    }
    else {
      normalized.push(element);
    }
  }
  console.log(normalized);
  return normalized;
}

const addZero = (i) => {
  if (i < 10) { i = "0" + i }
  return i;
}
const cleanReadingData = (reading) => {
  const d = new Date(reading.created_at)
  let h = addZero(d.getHours());
  let m = addZero(d.getMinutes());
  let s = addZero(Math.floor(d.getSeconds() / 15) * 15);
  let time = h + ":" + m + ":" + s;
  let day = d.getDay() + "/" + d.getMonth() + "/" + d.getYear();
  return {
    created_at: new Date(day + " " + time).toLocaleTimeString('en-us'),
    value: Math.round(reading.value)
  }
}

function Sensors({ sensor, readings }) {
  const router = useRouter()
  const { pid } = router.query

  const [lastValue, setLastValue] = useState(0);
  const [labels, setLabels] = useState([]);
  const [chartReadings, setChartReadings] = useState([]);
  const chartRef = useRef();

  useEffect(() => {
    socketInitializer();

    return () => socket && socket.close()
  }, []);

  useEffect(() => {
    const cleanedReadings = cleanReadingsData(readings ?? []).reverse();
    setChartReadings(cleanedReadings);
    setLabels(cleanedReadings.map(x => x.created_at));
  }, []);

  const socketInitializer = async () => {
    socket = io("http://pi-mower:3001/sensors");

    socket.on("reading", (msg) => {
      const msgJson = JSON.parse(msg);
      if (msgJson.sensor.id === sensor.id) {
        setLastValue(msgJson.value);

        if (chartRef?.current !== null) {
          let addedReading;
          chartRef.current.data.datasets.forEach((dataset) => {
            const prev = dataset.data[dataset.data.length - 1];
            const next = cleanReadingData(msgJson);
            if (prev.created_at === next.created_at) {
              dataset.data[dataset.data.length - 1] = { created_at: prev.created_at, value: (prev.value + next.value) / 2 }
            }
            else {
              dataset.data.push(next);
              addedReading = next
            }
          });

          if (!!addedReading) {
            chartRef.current.data.labels.push(addedReading.created_at);
          }

          setTimeout(() => chartRef.current.update(), 10);
        }
      }
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
      xAxisKey: 'created_at',
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

  return (
    <>
      <Link href={`/`}><a>&lt; Back</a></Link>

      <div className={styles.grid}>
        <div className={styles.card}>
          <h2>{sensor.id}: {sensor.name}</h2>
          <p>Index: {sensor.index}</p>
          <p>Offset: {sensor.offset}</p>
          <p>Value: {lastValue.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.chartContainer}>
        {chartReadings.length > 0 && <Line options={options} data={chartData} ref={chartRef} />}
      </div>
    </>
  )
}

// This gets called on every request
export async function getServerSideProps({ params }) {

  // Fetch data from external API
  const sensorRes = await fetch(`http://pi-mower:3001/sensors/${params.pid}`)
  const sensor = await sensorRes.json()

  // Fetch data from external API
  const readingsRes = await fetch(`http://pi-mower:3001/sensors/${params.pid}/readings?limit=${30 * 60}`)
  const readings = await readingsRes.json()

  // Pass data to the page via props
  return { props: { sensor, readings } }
}

export default Sensors;