import { useState, useEffect, useCallback } from 'react';
import { LOCATIONS, FETCH_INTERVAL_MS } from '../config';
import { fetchPM25 } from '../services/sheetService';

/**
 * Custom Hook สำหรับดึงข้อมูล PM2.5 ของทุกสถานที่
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

    // สร้างอาร์เรย์ของ Promise สำหรับดึงข้อมูลพร้อมกัน (Parallel Fetching)
    const fetchPromises = LOCATIONS.map(async (loc) => {
      if (!loc.gid) return null;
      try {
        const pm25 = await fetchPM25(loc.gid, loc.sensorId);
        return { sensorId: loc.sensorId, pm25, error: false };
      } catch (err) {
        console.error(`[${loc.sensorId}]`, err.message);
        return { sensorId: loc.sensorId, pm25: null, error: true };
      }
    });

    // รอให้ทุก Promise ทำงานเสร็จสิ้น ไม่ว่าจะสำเร็จหรือล้มเหลว
    const results = await Promise.all(fetchPromises);

    // จัดการข้อมูลที่ได้กลับมา
    results.forEach((result) => {
      if (result) {
        if (result.error) {
          newErrors[result.sensorId] = true;
        } else {
          newReadings[result.sensorId] = result.pm25;
          anySuccess = true;
        }
      }
    });

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