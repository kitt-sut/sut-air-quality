import { useState, useEffect, useCallback, useRef } from 'react';
import { LOCATIONS, FETCH_INTERVAL_MS } from '../config';
import { fetchPM25 } from '../services/sheetService';

const useSensorData = () => {
  const [sensorData, setSensorData]     = useState({});
  const [errorSensors, setErrorSensors] = useState({});
  const [lastUpdate, setLastUpdate]     = useState('');
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState(false);

  const abortControllerRef = useRef(null);
  const timeoutRef         = useRef(null); // ใช้ setTimeout แทน setInterval

  const refresh = useCallback(async () => {
    // 1. ถ้าระบบกำลังดึงข้อมูลอยู่ แล้วมีคำสั่งใหม่เข้ามา (เช่น รีเฟรชรัวๆ) ให้ยกเลิกอันเก่าทันที
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // สร้าง Controller ประจำรอบนี้โดยเฉพาะ
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setFetchError(false);

    const newReadings = {};
    const newErrors   = {};
    let anySuccess    = false;

    const fetchPromises = LOCATIONS.map(async (loc) => {
      if (!loc.gid) return null;
      try {
        const pm25 = await fetchPM25(loc.gid, loc.sensorId, controller.signal);
        return { sensorId: loc.sensorId, pm25, error: false };
      } catch (err) {
        if (err.name === 'AbortError') return null; // ข้ามการแจ้ง Error ถ้าจงใจยกเลิก
        console.error(`[${loc.sensorId}]`, err.message);
        return { sensorId: loc.sensorId, pm25: null, error: true };
      }
    });

    const results = await Promise.all(fetchPromises);

    // 2. *** แก้ปัญหา ***
    // ถ้ารอบนี้ถูกยกเลิกไปแล้ว (เพราะเปลี่ยนหน้า หรือมีคำสั่งใหม่มาแทน) ให้หยุดเลย ไม่ต้องไปยุ่งกับ State
    if (controller.signal.aborted) return;

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

    // อัปเดตข้อมูลเซนเซอร์
    setSensorData((prev) => ({ ...prev, ...newReadings }));
    setErrorSensors(newErrors);

    // ถ้าไม่มีข้อมูลไหนสำเร็จเลย ให้แสดง Error
    setFetchError(!anySuccess);

    // อัปเดตเวลาเสมอ เพื่อให้รู้ว่าระบบยังพยายามดึงข้อมูลอยู่
    setLastUpdate(new Date().toLocaleString('th-TH'));
    setLoading(false);
  }, []);

  useEffect(() => {
    // นัดหมาย fetch รอบถัดไปหลังจาก fetch รอบปัจจุบันเสร็จสมบูรณ์แล้วเท่านั้น
    // ป้องกัน fetch ซ้อนกันในกรณีที่ network ช้ากว่า FETCH_INTERVAL_MS
    const schedule = () => {
      timeoutRef.current = setTimeout(async () => {
        await refresh();
        schedule(); // นัดหมายรอบต่อไปหลัง fetch เสร็จ ไม่ใช่ตามเวลานาฬิกา
      }, FETCH_INTERVAL_MS);
    };

    // fetch ครั้งแรกทันที แล้วค่อยเริ่ม schedule
    refresh().then(schedule);

    return () => {
      clearTimeout(timeoutRef.current);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [refresh]);

  return { sensorData, errorSensors, lastUpdate, loading, fetchError, refresh };
};

export default useSensorData;