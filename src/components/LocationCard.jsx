import { getAQIInfo } from '../utils/aqi';
import useCountUp from '../hooks/useCountUp';
import { IconMapPin, IconAlertCircle } from './Icons';

const LocationCard = ({ data, pm25, loading, hasError }) => {
  const safePm25 = pm25 !== null && pm25 !== undefined && !isNaN(pm25) ? pm25 : 0;
  const displayPm25 = useCountUp(safePm25);
  const aqiInfo = getAQIInfo(pm25);
  const isUnknown = pm25 === null || pm25 === undefined || hasError;

  return (
      <div
          className="relative overflow-hidden rounded-[2rem] shadow-xl bg-white group
                 hover:shadow-2xl transition-all duration-500 border border-gray-100
                 h-full flex flex-col"
      >
        {/* ── 1. Top Border Overlay ── (เพิ่มส่วนนี้มาใหม่และซ้อนอยู่ด้านบนสุด) */}
        <div
            className="absolute top-0 left-0 right-0 h-1 z-30" // ใช้ h-1 สำหรับความหนา 4px และ z-30 เพื่อให้อยู่ด้านบนสุด
            style={{ backgroundColor: aqiInfo ? aqiInfo.color : '#d1d5db' }}
        />

        {/* ── Image ── */}
        {/* container ของภาพยังคง overflow-hidden */}
        <div className="relative h-48 md:h-56 overflow-hidden">
          <img
              src={data.image}
              onError={(e) => { e.target.onerror = null; e.target.src = data.fallback; }}
              alt={data.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" // scale ภาพ 110%
          />
          {/* เพิ่ม z-10 เพื่อให้อยู่เหนือภาพ แต่ใต้ Label/Badge */}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/10 to-black/30 z-10" />

          {/* Location label */}
          {/* เพิ่ม z-20 เพื่อให้อยู่เหนือ gradient และภาพ */}
          <div className="absolute bottom-4 left-4 right-4 z-20">
            <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm
                          px-4 py-2 rounded-xl shadow-sm max-w-full">
              <IconMapPin className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="text-sm font-bold text-gray-800 truncate">{data.name}</span>
            </div>
          </div>

          {/* Sensor ID badge */}
          {/* เพิ่ม z-20 เพื่อให้อยู่เหนือ gradient และภาพ */}
          <div className="absolute top-4 right-4 z-20">
          <span className="text-[10px] font-mono bg-black/50 text-white px-2 py-1
                           rounded backdrop-blur-md">
            ID: {data.sensorId}
          </span>
          </div>
        </div>

        {/* ── Content ── */}
        <div className="relative flex-1 p-6 flex flex-col items-center justify-center bg-white rounded-t-[2rem] -mt-6">

          {/* Loading skeleton */}
          {loading && !aqiInfo && (
              <div className="flex flex-col items-center gap-3 py-6">
                <div className="w-44 h-44 rounded-full border-8 border-gray-100 animate-pulse bg-gray-50" />
                <div className="w-24 h-4 bg-gray-100 rounded-full animate-pulse" />
              </div>
          )}

          {/* Error state */}
          {!loading && isUnknown && (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <div className="w-44 h-44 rounded-full border-8 border-gray-200
                            flex flex-col items-center justify-center bg-gray-50">
                  <IconAlertCircle className="w-10 h-10 text-gray-300" />
                  <span className="text-gray-400 text-xs mt-1">ไม่มีข้อมูล</span>
                </div>
                <p className="text-xs text-red-400 flex items-center gap-1">
                  <IconAlertCircle className="w-3 h-3" />
                  ไม่สามารถรับข้อมูลจากเซนเซอร์ได้
                </p>
              </div>
          )}

          {/* Data display */}
          {aqiInfo && !isUnknown && (
              <>
                <div className="relative mb-5 mt-2">
                  {/* Glow */}
                  <div
                      className="absolute inset-0 rounded-full blur-2xl opacity-20 transition-all duration-1000"
                      style={{ backgroundColor: aqiInfo.color }}
                  />
                  {/* Ring */}
                  <div
                      className="relative flex flex-col items-center justify-center
                           w-44 h-44 rounded-full border-[8px] bg-white shadow-inner
                           transition-colors duration-700"
                      style={{ borderColor: aqiInfo.color }}
                  >
                <span
                    className="text-6xl font-black tracking-tighter leading-none transition-colors duration-500"
                    style={{ color: aqiInfo.textColor }}
                >
                  {loading ? '…' : displayPm25}
                </span>
                    <span className="text-gray-400 text-xs font-medium mt-0.5">µg/m³</span>
                    <span className="text-3xl mt-1.5 transition-transform group-hover:scale-110 drop-shadow-sm">
                  {aqiInfo.face}
                </span>
                  </div>
                </div>

                <div className="text-center space-y-1.5 w-full">
                  <div
                      className="inline-block px-4 py-1.5 rounded-full text-white text-sm font-bold shadow-md"
                      style={{ background: `linear-gradient(to right, ${aqiInfo.gradFrom}, ${aqiInfo.gradTo})` }}
                  >
                    {aqiInfo.label}
                  </div>
                  <p className="text-xs text-gray-400">{aqiInfo.enLabel}</p>
                  <p className="text-gray-500 text-xs px-4 min-h-[2rem] flex items-center
                            justify-center text-center leading-snug">
                    {aqiInfo.desc}
                  </p>
                </div>
              </>
          )}
        </div>
      </div>
  );
};

export default LocationCard;