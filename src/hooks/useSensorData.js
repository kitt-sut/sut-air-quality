import { useState, useEffect, useCallback } from 'react';
import { LOCATIONS, FETCH_INTERVAL_MS } from '../config';
import { fetchPM25 } from '../services/sheetService';

/**
 * Fetches PM2.5 readings for all configured locations.
 *
 * Returns:
 *   sensorData    – { [sensorId]: number }
 *   errorSensors  – { [sensorId]: boolean }  true when that sensor failed
 *   lastUpdate    – Thai locale date/time string
 *   loading       – true during the first fetch
 *   fetchError    – true when ALL sensors failed simultaneously
 *   refresh       – call manually to force a re-fetch
 */
const useSensorData = () => {
  const [sensorData, setSensorData]     = useState({});
  const [errorSensors, setErrorSensors] = useState({});
  const [lastUpdate, setLastUpdate]     = useState('');
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setFetchError(false);

    const newReadings = {};
    const newErrors   = {};
    let anySuccess    = false;

    for (const loc of LOCATIONS) {
      if (!loc.gid) continue;
      try {
        const pm25 = await fetchPM25(loc.gid, loc.sensorId);
        newReadings[loc.sensorId] = pm25;
        anySuccess = true;
      } catch (err) {
        console.error(`[${loc.sensorId}]`, err.message);
        newErrors[loc.sensorId] = true;
      }
    }

    setSensorData((prev) => ({ ...prev, ...newReadings }));
    setErrorSensors(newErrors);
    if (!anySuccess) setFetchError(true);
    setLastUpdate(new Date().toLocaleString('th-TH'));
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, FETCH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [refresh]);

  return { sensorData, errorSensors, lastUpdate, loading, fetchError, refresh };
};

export default useSensorData;
