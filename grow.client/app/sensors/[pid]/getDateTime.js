export default function getDateTime(hourOffset = 0, startOfDay = false, interval = 1, d = new Date()) {
  let hInterval = 1;
  let mInterval = 1;
  let sInterval = 1;
  if (interval < 60) {
    sInterval = interval;
  }
  else if (interval < 60 * 60) {
    mInterval = interval / 60;
  }
  else {
    hInterval = interval / 60 / 24;
  }

  d.setHours(d.getHours() - hourOffset);
  let h = Math.floor(d.getHours() / hInterval) * hInterval;
  if (h < 10)
    h = `0${h}`;
  let m = Math.floor(d.getMinutes() / mInterval) * mInterval;
  if (m < 10)
    m = `0${m}`;
  let s = Math.floor(d.getSeconds() / sInterval) * sInterval;
  if (s < 10)
    s = `0${s}`;
  let time = `${h}:${m}:${s}`;
  if (startOfDay) {
    time = "00:00:00";
  }
  let day = `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;

  return `${day} ${time}`;
};
