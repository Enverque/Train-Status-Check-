import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import './TrainSchedule.css';

const TrainSchedule = () => {
  const [trainNo, setTrainNo] = useState('');
  const [trainData, setTrainData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [lastSearched, setLastSearched] = useState('');
  const [now, setNow] = useState(new Date());
  // Train position anchor: { idx, name, absAtSeen, seenAt, left }
  const [anchor, setAnchor] = useState(null);

  // Refresh current time every 30 seconds so the badges update live
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Extract minutes from strings like "8min", "1hr 5min", "On Time", "2min"
  const parseMinutes = (value) => {
    if (!value) return 0;
    const str = value.toString().toLowerCase();
    const hrMatch = str.match(/(\d+)\s*h/);
    const minMatch = str.match(/(\d+)\s*m/);
    if (hrMatch || minMatch) {
      return (hrMatch ? parseInt(hrMatch[1], 10) * 60 : 0) +
             (minMatch ? parseInt(minMatch[1], 10) : 0);
    }
    return parseInt(str.replace(/\D/g, ''), 10) || 0;
  };

  // Add minutes to an "HH:MM" time string
  const addMinutes = (time, minutesToAdd) => {
    if (!time || time === '-') return '-';

    try {
      const [hours, minutes] = time.split(':').map(Number);
      if (isNaN(hours) || isNaN(minutes)) return '-';

      const totalMinutes = hours * 60 + minutes + minutesToAdd;
      const h = Math.floor(totalMinutes / 60) % 24;
      const m = totalMinutes % 60;

      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    } catch (e) {
      console.error("Error calculating time:", e);
      return '-';
    }
  };

  // Departure = scheduled arrival + delay + halt
  const calculateDepartureTime = (arrivalTime, delay, haltDuration) => {
    if (!arrivalTime || arrivalTime === '-') return '-';
    return addMinutes(arrivalTime, parseMinutes(delay) + parseMinutes(haltDuration));
  };

  // Show scheduled time cut in red + actual time (only when delayed)
  const renderDualTime = (scheduled, actual, delayMinutes) => {
    if (delayMinutes > 0 && scheduled !== '-') {
      return (
        <>
          <span className="arrival-original-cut">{scheduled}</span>
          <span className="arrival-actual">{actual}</span>
        </>
      );
    }
    return scheduled;
  };

  // API flag: accepts true, 1, "true", "True", "yes", "1", "y"
  const isCurrentFlag = (station) => {
    const v = station?.is_current_station;
    if (typeof v === 'string') {
      return ['true', '1', 'yes', 'y'].includes(v.trim().toLowerCase());
    }
    return v === true || v === 1;
  };

  // Timing string like "17:0416:56" -> arrival is the LAST 5 chars (16:56)
  const parseTiming = (timingStr) => {
    if (!timingStr || timingStr.length < 10) return { arrival: '-', departure: '-' };
    return {
      arrival: timingStr.substring(5, 10) || '-',
      departure: timingStr.substring(0, 5) || '-'
    };
  };

  // "HH:MM" -> minutes since midnight (null if invalid)
  const parseClock = (time) => {
    if (!time || time === '-') return null;
    const [h, m] = time.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h * 60 + m;
  };

  // Journey-absolute actual arrival / departure minutes for every station.
  // Each time the clock goes backwards a new day starts, so the same clock time
  // on different days gets different absolute values (works for multi-day journeys).
  const buildActualTimes = (stations) => {
    const arr = [];
    const dep = [];
    let dayOffset = 0;
    let prevScheduled = null;

    stations.forEach((s) => {
      const base = parseClock(parseTiming(s.timing).arrival);
      if (base === null) {
        arr.push(null);
        dep.push(null);
        return;
      }
      let abs = base + dayOffset;
      if (prevScheduled !== null && abs < prevScheduled) {
        dayOffset += 1440;
        abs += 1440;
      }
      prevScheduled = abs;

      const actualArrival = abs + parseMinutes(s.delay);
      arr.push(actualArrival);
      dep.push(actualArrival + parseMinutes(s.halt));
    });

    return { arr, dep };
  };

  // Journey-absolute minute for a clock time, on the day closest to a reference time
  const absNowNear = (refAbs, clockMin) => {
    let delta = (((clockMin - (refAbs % 1440)) % 1440) + 1440) % 1440;
    if (delta > 720) delta -= 1440;
    return refAbs + delta;
  };

  // Normalise station names so "Hapur" matches "Hapur Jn" etc.
  const normName = (s) =>
    (s || '')
      .toLowerCase()
      .replace(/\(.*?\)/g, '')
      .replace(/\b(jn|junction|cantt|city|halt|terminus)\b/g, '')
      .replace(/[^a-z0-9]/g, '');

  const findStationIdx = (stations, name) => {
    const n = normName(name);
    if (!n) return -1;
    let idx = stations.findIndex((s) => normName(s.station_name) === n);
    if (idx !== -1) return idx;
    if (n.length >= 3) {
      idx = stations.findIndex((s) => {
        const sn = normName(s.station_name);
        return sn.length >= 3 && (sn.includes(n) || n.includes(sn));
      });
    }
    return idx;
  };

  // Read the position from the API message, e.g. "Crossed Hapur at 17:24"
  // Returns { idx, left, clock } or null
  const parseStatusMessage = (message, stations) => {
    if (!message || typeof message !== 'string') return null;

    const timeMatch = message.match(/(\d{1,2}):(\d{2})/);
    const clock = timeMatch ? parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10) : null;

    const m = message.match(
      /^\s*(crossed|departed from|departed|left|arrived at|arrived|reached|currently at|standing at|at)\s+(.+?)\s+(?:at|on)\s+\d{1,2}:\d{2}/i
    );

    if (m) {
      const verb = m[1].toLowerCase();
      const idx = findStationIdx(stations, m[2]);
      if (idx !== -1) {
        const left = ['crossed', 'departed from', 'departed', 'left'].includes(verb);
        return { idx, left, clock };
      }
    }

    // Fallback: look for any station name inside the message
    const nm = normName(message);
    let found = -1;
    stations.forEach((s, i) => {
      const sn = normName(s.station_name);
      if (sn.length >= 3 && nm.includes(sn)) found = i;
    });
    if (found !== -1) {
      return { idx: found, left: /crossed|departed|left/i.test(message), clock };
    }
    return null;
  };

  // Storage helpers (remember the last known position per train number)
  const storageKey = (number) => `trainPosition2_${number}`;
  const readStored = (number) => {
    try {
      const raw = localStorage.getItem(storageKey(number));
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };
  const writeStored = (number, value) => {
    try {
      localStorage.setItem(storageKey(number), JSON.stringify(value));
    } catch (e) {
      /* ignore storage errors */
    }
  };

  // Fetch from backend. silent = true -> background refresh (no loading / error UI)
  const loadTrain = async (number, silent = false) => {
    if (!silent) {
      setLoading(true);
      setError('');
      setLastSearched(number);
    }

    try {
      console.log(`Fetching data for train: ${number}`);
      const response = await axios.get(
        `http://localhost:8000/api/train/${number}`,
        {
          timeout: 10000,
          headers: {
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        }
      );

      console.log('API Response:', response.data);

      if (!response.data || response.data.error) {
        throw new Error(response.data?.error || "No data received from server");
      }

      const stationsList = response.data.data || [];
      const { arr } = buildActualTimes(stationsList);
      const t = new Date();
      const nowMin = t.getHours() * 60 + t.getMinutes();

      let record = null;

      // 1) Station flagged is_current_station (last flagged wins)
      let flaggedIdx = -1;
      stationsList.forEach((s, i) => {
        if (isCurrentFlag(s)) flaggedIdx = i;
      });

      if (flaggedIdx !== -1 && arr[flaggedIdx] !== null) {
        record = {
          idx: flaggedIdx,
          name: stationsList[flaggedIdx].station_name,
          absAtSeen: absNowNear(arr[flaggedIdx], nowMin),
          seenAt: t.getTime(),
          left: false
        };
      } else {
        // 2) Position from the API message ("Crossed Hapur at 17:24")
        const info = parseStatusMessage(response.data.message, stationsList);
        if (info && arr[info.idx] !== null) {
          const absMsg = info.clock === null ? arr[info.idx] : absNowNear(arr[info.idx], info.clock);
          record = {
            idx: info.idx,
            name: stationsList[info.idx].station_name,
            absAtSeen: absNowNear(absMsg, nowMin),
            seenAt: t.getTime(),
            left: info.left
          };
        }
      }

      if (record) {
        writeStored(number, record);
        setAnchor(record);
        console.log('Position anchor:', record.name, record.left ? '(departed)' : '(at station)');
      } else {
        // 3) Fall back to the saved position if it still matches this station list
        const saved = readStored(number);
        const valid =
          saved &&
          stationsList[saved.idx] &&
          stationsList[saved.idx].station_name === saved.name;
        setAnchor(valid ? saved : null);
        console.log('No flag / message match, using saved position:', valid ? saved.name : '(none)');
      }

      setTrainData(response.data);
    } catch (err) {
      console.error('Fetch Error:', {
        message: err.message,
        response: err.response?.data
      });

      if (silent) return; // keep old data on background refresh failure

      let errorMessage = 'Failed to fetch train data';
      if (err.response) {
        errorMessage = err.response.data?.error || 
                      `Server responded with ${err.response.status}`;
      } else if (err.request) {
        errorMessage = 'No response from server - is the backend running?';
      }

      setError(errorMessage);
      setTrainData(null);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  const fetchTrainData = async () => {
    if (!trainNo || !/^\d{5}$/.test(trainNo)) {
      setError('Please enter a valid 5-digit train number');
      return;
    }
    await loadTrain(trainNo, false);
  };

  // Background refresh every 60 seconds so the position keeps being tracked
  useEffect(() => {
    if (!lastSearched) return;
    const refresh = setInterval(() => loadTrain(lastSearched, true), 60000);
    return () => clearInterval(refresh);
  }, [lastSearched]);

  // Badge logic (all times are journey-absolute, so multi-day trains work):
  // Start from the anchor station (flag / API message / saved) and move the journey clock
  // forward by the real time elapsed since it was seen.
  //  - Current  : train has reached a station and not yet left it
  //  - Departed : last station the train has left
  //  - Next     : station right after the Current / Departed station
  const computeTrainPosition = (stations, nowDate, anchorRec) => {
    const none = { currentIdx: -1, departedIdx: -1, nextIdx: -1 };
    if (!stations || stations.length === 0) return none;

    const { arr, dep } = buildActualTimes(stations);
    const lastIdx = stations.length - 1;
    const nowMin = nowDate.getHours() * 60 + nowDate.getMinutes();

    // ---- Anchor known ----
    if (anchorRec && stations[anchorRec.idx] && arr[anchorRec.idx] !== null) {
      const nowAbs = anchorRec.absAtSeen + (nowDate.getTime() - anchorRec.seenAt) / 60000;

      // Journey ended long ago -> ignore
      if (dep[lastIdx] !== null && nowAbs > dep[lastIdx] + 180) return none;

      let currentIdx = -1;
      let departedIdx = -1;

      for (let i = anchorRec.idx; i <= lastIdx; i++) {
        if (arr[i] === null) continue;

        if (i === anchorRec.idx) {
          if (anchorRec.left && i !== lastIdx) {
            departedIdx = i; // message says it already crossed this station
            continue;
          }
          if (i === lastIdx || nowAbs < dep[i]) {
            currentIdx = i;
            break;
          }
          departedIdx = i;
          continue;
        }

        if (nowAbs >= arr[i] && (i === lastIdx || nowAbs < dep[i])) {
          currentIdx = i;
          break;
        }
        if (i !== lastIdx && dep[i] !== null && nowAbs >= dep[i]) {
          departedIdx = i;
        }
      }

      if (currentIdx !== -1) {
        return {
          currentIdx,
          departedIdx: -1,
          nextIdx: currentIdx === lastIdx ? -1 : currentIdx + 1
        };
      }
      if (departedIdx !== -1) {
        return {
          currentIdx: -1,
          departedIdx,
          nextIdx: departedIdx === lastIdx ? -1 : departedIdx + 1
        };
      }
      return none;
    }

    // ---- No anchor: bootstrap from the clock ----
    const validDep = dep.filter((v) => v !== null);
    if (validDep.length === 0) return none;
    const start = validDep[0];
    const end = validDep[validDep.length - 1];
    const maxDays = Math.ceil(end / 1440) + 1;
    let nowAbs;
    for (let d = 0; d <= maxDays; d++) {
      const c = nowMin + d * 1440;
      if (c >= start && c <= end) {
        nowAbs = c;
        break;
      }
    }
    if (nowAbs === undefined) return none;

    let departedIdx = -1;
    for (let i = 0; i < lastIdx; i++) {
      if (dep[i] !== null && nowAbs >= dep[i]) departedIdx = i;
    }
    if (departedIdx === -1) return none;

    return { currentIdx: -1, departedIdx, nextIdx: departedIdx + 1 };
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      fetchTrainData();
    }
  };

  const position =
    trainData && trainData.data
      ? computeTrainPosition(trainData.data, now, anchor)
      : { currentIdx: -1, departedIdx: -1, nextIdx: -1 };

  return (
    <>
      <Navbar />
      <div className="train-schedule">
        <h1>Train Schedule</h1>

        <div className="train-search">
          <input
            type="number"
            placeholder="Enter 5-digit train number"
            value={trainNo}
            className="train-input"
            onChange={(e) => setTrainNo(e.target.value)}
            onKeyPress={handleKeyPress}
            min="00999"
            max="99999"
          />
          <button 
            onClick={fetchTrainData} 
            disabled={loading || !trainNo || trainNo.length !== 5}
          >
            {loading ? (
              <>
                <span className="spinner"></span> Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </div>

        {error && (
          <div className="error-message">
            <strong>Error:</strong> {error}
            {error.includes('backend') && (
              <p>Make sure your backend server is running on port 8000</p>
            )}
          </div>
        )}

        {loading && !error && (
          <div className="loading-message">
            Fetching data for train {trainNo}...
          </div>
        )}

        {trainData && trainData.data ? (
          <div className="train-details">
            <div className="train-header">
              <h2>
                {trainData?.train_name || 
                trainData?.data?.train_name || 
                trainData?.data?.[0]?.train_name || 
                `Train ${trainNo}`}
              </h2>
              <div className="train-meta">
                <span>
                  <strong>From:</strong> {trainData.data[0]?.station_name || 'N/A'}
                </span>
                <span>
                  <strong>To:</strong> {trainData.data[trainData.data.length - 1]?.station_name || 'N/A'}
                </span>
                <span>
                  <strong>Status:</strong> {trainData.data[0]?.delay || 'N/A'}
                </span>
              </div>
            </div>

            <div className="station-list-container">
              <table className="station-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Station</th>
                    <th>Arrival</th>
                    <th>Departure</th>
                    <th>Halt</th>
                    <th>Platform</th>
                    <th>Distance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {trainData.data.map((station, index) => {
                    const isFirst = index === 0;
                    const isLast = index === trainData.data.length - 1;
                    const isCurrent = index === position.currentIdx;
                    const isDeparted = index === position.departedIdx;
                    const isNext = index === position.nextIdx;
                    const timing = parseTiming(station.timing);
                    const delayMinutes = parseMinutes(station.delay);
                    // Actual arrival = scheduled arrival + delay
                    const actualArrival = addMinutes(timing.arrival, delayMinutes);
                    // Scheduled departure = scheduled arrival + halt
                    const scheduledDeparture = addMinutes(timing.arrival, parseMinutes(station.halt));
                    // Actual departure = scheduled arrival + delay + halt
                    const calculatedDeparture = calculateDepartureTime(
                      timing.arrival,
                      station.delay,
                      station.halt
                    );

                    // Arrival cell: blank only for the source station (when it is not the current station)
                    const showArrival = isCurrent || !isFirst;
                    // Departure cell: blank only for the last station (when it is not the current station)
                    const showDeparture = isCurrent || !isLast;

                    return (
                      <tr 
                        key={index} 
                        className={isCurrent ? 'current-station' : ''}
                      >
                        <td>{index + 1}</td>
                        <td>
                          {station.station_name}
                          {isCurrent && (
                            <span className="current-badge">Current</span>
                          )}
                          {isDeparted && (
                            <span className="departed-badge">Departed</span>
                          )}
                          {isNext && (
                            <span className="next-badge">Next</span>
                          )}
                        </td>
                        <td>
                          {showArrival
                            ? renderDualTime(timing.arrival, actualArrival, delayMinutes)
                            : ''}
                        </td>
                        <td>
                          {showDeparture
                            ? renderDualTime(scheduledDeparture, calculatedDeparture, delayMinutes)
                            : ''}
                        </td>
                        <td>{station.halt}</td>
                        <td>{station.platform}</td>
                        <td>{station.distance}</td>
                        <td>
                          <span className={`status-badge ${delayMinutes > 0 ? 'delayed' : 'on-time'}`}>
                            {station.delay || 'On Time'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          !loading && !error && (
            <div className="no-data">

            </div>
          )
        )}
      </div>
    </>
  );
};

export default TrainSchedule;