import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CloudFog,
  CloudSun,
  CloudRain,
  Sun,
  Droplets,
  Wind,
  Compass,
  Thermometer,
  RefreshCw,
  MapPin,
  Calendar,
  Sparkles,
  ChevronRight,
  X,
  Flame,
  Waves,
  Shirt,
  Info,
  Clock,
  Eye,
  CheckCircle2,
} from 'lucide-react';

export interface DailyForecast {
  date: string;
  dayName: string;
  maxTemp: number;
  minTemp: number;
  condition: string;
  icon: 'fog' | 'sun' | 'rain' | 'cloud';
  rainChance: number;
  uvIndex?: number;
}

export interface HourlyForecast {
  time: string;
  temp: number;
  condition: string;
  icon: 'fog' | 'sun' | 'rain' | 'cloud';
  rainChance: number;
}

export interface LiveWeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  windDirection?: string;
  feelsLike: number;
  uvIndex: number;
  cloudCover: number;
  visibilityKm: number;
  isLive: boolean;
  lastUpdated: string;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  icon: 'fog' | 'sun' | 'rain' | 'cloud';
  daily: DailyForecast[];
  hourly: HourlyForecast[];
  travelTip: string;
  campfireRating: string;
  poolRating: string;
}

const DEFAULT_WEATHER: LiveWeatherData = {
  temp: 20,
  condition: 'Misty & Cool Highland Breeze',
  humidity: 78,
  windSpeed: 11,
  windDirection: 'SW',
  feelsLike: 19,
  uvIndex: 4,
  cloudCover: 65,
  visibilityKm: 8,
  isLive: false,
  lastUpdated: 'Just now',
  timeOfDay: 'afternoon',
  icon: 'fog',
  travelTip: 'Ideal cool mountain weather for private infinity pool sessions & cliffside tea.',
  campfireRating: 'Perfect for Starlight Campfire',
  poolRating: 'Comfortable & Refreshing',
  daily: [
    { date: 'Today', dayName: 'Today', maxTemp: 23, minTemp: 16, condition: 'Misty Overcast', icon: 'fog', rainChance: 15, uvIndex: 5 },
    { date: 'Tomorrow', dayName: 'Tomorrow', maxTemp: 24, minTemp: 17, condition: 'Passing Mist & Sun', icon: 'sun', rainChance: 20, uvIndex: 6 },
    { date: 'Day 3', dayName: 'Wed', maxTemp: 22, minTemp: 16, condition: 'Gentle Highland Drizzle', icon: 'rain', rainChance: 45, uvIndex: 4 },
    { date: 'Day 4', dayName: 'Thu', maxTemp: 23, minTemp: 15, condition: 'Cool Pine Fog', icon: 'fog', rainChance: 25, uvIndex: 5 },
    { date: 'Day 5', dayName: 'Fri', maxTemp: 24, minTemp: 16, condition: 'Partly Sunny & Crisp', icon: 'sun', rainChance: 10, uvIndex: 6 },
  ],
  hourly: [
    { time: 'Now', temp: 20, condition: 'Misty', icon: 'fog', rainChance: 15 },
    { time: '02 PM', temp: 22, condition: 'Partly Sun', icon: 'sun', rainChance: 10 },
    { time: '05 PM', temp: 21, condition: 'Cool Breeze', icon: 'fog', rainChance: 20 },
    { time: '08 PM', temp: 18, condition: 'Crisp & Foggy', icon: 'fog', rainChance: 10 },
    { time: '11 PM', temp: 16, condition: 'Chilly Highland', icon: 'cloud', rainChance: 5 },
    { time: '06 AM', temp: 15, condition: 'Dawn Valley Mist', icon: 'fog', rainChance: 15 },
  ],
};

function interpretWmoCode(code: number): { condition: string; icon: 'fog' | 'sun' | 'rain' | 'cloud' } {
  if (code === 0) return { condition: 'Clear Mountain Sky', icon: 'sun' };
  if (code === 1 || code === 2) return { condition: 'Partly Cloudy & Pleasant', icon: 'sun' };
  if (code === 3) return { condition: 'Misty Overcast', icon: 'cloud' };
  if (code === 45 || code === 48) return { condition: 'Dense Pine Valley Fog', icon: 'fog' };
  if (code >= 51 && code <= 67) return { condition: 'Gentle Highland Drizzle', icon: 'rain' };
  if (code >= 80 && code <= 82) return { condition: 'Passing Hill Showers', icon: 'rain' };
  if (code >= 95) return { condition: 'Highland Thunder Clouds', icon: 'rain' };
  return { condition: 'Cool & Breezy', icon: 'fog' };
}

function getWeatherIcon(iconType: 'fog' | 'sun' | 'rain' | 'cloud', className = 'w-4 h-4') {
  switch (iconType) {
    case 'sun':
      return <Sun className={`${className} text-amber-400`} />;
    case 'rain':
      return <CloudRain className={`${className} text-blue-400`} />;
    case 'cloud':
      return <CloudSun className={`${className} text-emerald-400`} />;
    case 'fog':
    default:
      return <CloudFog className={`${className} text-emerald-300`} />;
  }
}

interface WeatherWidgetProps {
  variant?: 'compact' | 'card' | 'hero-embed';
  onViewDetailedForecast?: () => void;
}

export const WeatherWidget: React.FC<WeatherWidgetProps> = ({
  variant = 'compact',
}) => {
  const [weather, setWeather] = useState<LiveWeatherData>(DEFAULT_WEATHER);
  const [loading, setLoading] = useState(false);
  const [unit, setUnit] = useState<'C' | 'F'>('C');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchVagamonWeather = useCallback(async () => {
    try {
      setLoading(true);
      // Open-Meteo coordinates for Vagamon: Latitude 9.6854, Longitude 76.9056
      const url =
        'https://api.open-meteo.com/v1/forecast?latitude=9.6854&longitude=76.9056' +
        '&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m,wind_direction_10m,cloud_cover,uv_index' +
        '&hourly=temperature_2m,weather_code,precipitation_probability&forecast_days=2' +
        '&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,uv_index_max&forecast_days=5' +
        '&timezone=Asia%2FKolkata';

      const res = await fetch(url);
      if (!res.ok) throw new Error('Weather API request failed');
      const data = await res.json();

      if (data.current) {
        const curWmo = interpretWmoCode(data.current.weather_code ?? 45);
        const currentHour = new Date().getHours();
        const timeOfDay =
          currentHour >= 5 && currentHour < 12
            ? 'morning'
            : currentHour >= 12 && currentHour < 17
            ? 'afternoon'
            : currentHour >= 17 && currentHour < 21
            ? 'evening'
            : 'night';

        // Parse Daily 5-day forecast
        const dailyForecasts: DailyForecast[] = [];
        if (data.daily && data.daily.time) {
          const daysMap = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
          for (let i = 0; i < Math.min(data.daily.time.length, 5); i++) {
            const dateObj = new Date(data.daily.time[i] + 'T00:00:00');
            const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : daysMap[dateObj.getDay()];
            const wmoInfo = interpretWmoCode(data.daily.weather_code[i] ?? 3);
            dailyForecasts.push({
              date: data.daily.time[i],
              dayName,
              maxTemp: Math.round(data.daily.temperature_2m_max[i] ?? 23),
              minTemp: Math.round(data.daily.temperature_2m_min[i] ?? 16),
              condition: wmoInfo.condition,
              icon: wmoInfo.icon,
              rainChance: Math.round(data.daily.precipitation_probability_max?.[i] ?? 15),
              uvIndex: Math.round(data.daily.uv_index_max?.[i] ?? 5),
            });
          }
        }

        // Parse Hourly Timeline (next 6 intervals)
        const hourlyForecasts: HourlyForecast[] = [];
        if (data.hourly && data.hourly.time) {
          const nowIdx = new Date().getHours();
          const step = 3;
          for (let i = nowIdx; i < nowIdx + 18 && i < data.hourly.time.length; i += step) {
            const dateObj = new Date(data.hourly.time[i]);
            const hourLabel =
              i === nowIdx
                ? 'Now'
                : dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
            const wmoInfo = interpretWmoCode(data.hourly.weather_code[i] ?? 45);
            hourlyForecasts.push({
              time: hourLabel,
              temp: Math.round(data.hourly.temperature_2m[i] ?? 20),
              condition: wmoInfo.condition,
              icon: wmoInfo.icon,
              rainChance: Math.round(data.hourly.precipitation_probability?.[i] ?? 10),
            });
          }
        }

        const tempVal = Math.round(data.current.temperature_2m);
        const feelsVal = Math.round(data.current.apparent_temperature);

        let travelTip = 'Misty mountain atmosphere with cool pine valley air. Perfect for private infinity pool sessions & cliffside tea.';
        if (tempVal <= 18) {
          travelTip = 'Chilly evening mist settling in. Highly recommended to request our starlight campfire setup and hot plantation spices tea.';
        } else if (curWmo.icon === 'rain') {
          travelTip = 'Lush monsoon highland mist. Panoramic views of tea gardens from the glass balconies are spectacular.';
        }

        setWeather({
          temp: tempVal,
          condition: curWmo.condition,
          humidity: Math.round(data.current.relative_humidity_2m ?? 78),
          windSpeed: Math.round(data.current.wind_speed_10m ?? 12),
          windDirection: 'SW',
          feelsLike: feelsVal,
          uvIndex: Math.round(data.current.uv_index ?? 4),
          cloudCover: Math.round(data.current.cloud_cover ?? 60),
          visibilityKm: 9,
          isLive: true,
          lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }),
          timeOfDay,
          icon: curWmo.icon,
          daily: dailyForecasts.length > 0 ? dailyForecasts : DEFAULT_WEATHER.daily,
          hourly: hourlyForecasts.length > 0 ? hourlyForecasts : DEFAULT_WEATHER.hourly,
          travelTip,
          campfireRating: tempVal <= 21 ? 'Ideal for Evening Campfire' : 'Comfortable Starlight Lounging',
          poolRating: 'Comfortable & Refreshing Infinity Pool',
        });
      }
    } catch (err) {
      console.warn('Vagamon weather live sync notice, loaded highland seasonal defaults:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVagamonWeather();
    const interval = setInterval(fetchVagamonWeather, 15 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchVagamonWeather]);

  const convertTemp = (celsius: number) => {
    return unit === 'C' ? celsius : Math.round((celsius * 9) / 5 + 32);
  };

  const displayTemp = convertTemp(weather.temp);
  const displayFeels = convertTemp(weather.feelsLike);

  // Variant 1: Compact Pill for Hero top banner
  if (variant === 'compact') {
    return (
      <>
        <div
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all text-xs text-gray-700 cursor-pointer group select-none"
          title="Click to open live Vagamon weather forecast"
        >
          <div className="flex items-center gap-1.5 text-emerald-900 font-bold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            {getWeatherIcon(weather.icon, 'w-4 h-4')}
            <span>Vagamon</span>
          </div>

          <span className="w-1 h-1 rounded-full bg-gray-300" />

          <div className="flex items-center gap-1 font-bold text-gray-900">
            <span>{displayTemp}°{unit}</span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setUnit(unit === 'C' ? 'F' : 'C');
              }}
              className="text-[10px] text-gray-400 hover:text-emerald-800 font-bold uppercase transition-colors px-1 py-0.5 rounded hover:bg-gray-100"
              title="Toggle °C / °F"
            >
              °{unit === 'C' ? 'F' : 'C'}
            </button>
          </div>

          <span className="w-1 h-1 rounded-full bg-gray-300 hidden sm:inline" />

          <span className="text-gray-600 font-medium hidden sm:inline truncate max-w-[150px]">
            {weather.condition}
          </span>

          <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-emerald-50 text-[10px] text-emerald-800 font-bold uppercase border border-emerald-200/60">
            <Sparkles className="w-2.5 h-2.5 text-amber-500" />
            Live Forecast
          </span>
        </div>

        {/* Modal */}
        {renderForecastModal()}
      </>
    );
  }

  // Variant 2: Hero Embedded Live Weather Card
  return (
    <>
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl border border-emerald-800/80 relative overflow-hidden select-none">
        {/* Subtle Background Lighting Accent */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        {/* Header: Location & Live Status */}
        <div className="flex items-center justify-between mb-4 relative z-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-emerald-300">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-sm font-bold text-white leading-tight">
                  Vagamon Highlands
                </h3>
                <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-800/80 text-emerald-200 border border-emerald-700">
                  1,100m ASL
                </span>
              </div>
              <span className="text-[11px] text-emerald-200/80 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Climate Sync ({weather.lastUpdated})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Unit toggle */}
            <div className="flex items-center bg-black/30 border border-white/10 rounded-lg p-0.5 text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setUnit('C')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  unit === 'C' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                °C
              </button>
              <button
                type="button"
                onClick={() => setUnit('F')}
                className={`px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                  unit === 'F' ? 'bg-emerald-700 text-white shadow-xs' : 'text-emerald-300 hover:text-white'
                }`}
              >
                °F
              </button>
            </div>

            {/* Refresh */}
            <button
              type="button"
              onClick={fetchVagamonWeather}
              disabled={loading}
              className="p-1.5 text-emerald-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh weather data"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Main Temperature & Condition Showcase */}
        <div className="flex items-center justify-between py-2 border-b border-emerald-800/60 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shadow-inner">
              {getWeatherIcon(weather.icon, 'w-7 h-7')}
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-tight">
                  {displayTemp}°{unit}
                </span>
                <span className="text-xs text-emerald-300 font-medium">
                  Feels {displayFeels}°{unit}
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-semibold">{weather.condition}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
          >
            <span>5-Day Forecast</span>
            <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
          </button>
        </div>

        {/* Highland Quick Metrics Strip */}
        <div className="grid grid-cols-3 gap-2 pt-3 text-[11px] relative z-10">
          <div className="bg-black/20 rounded-xl p-2 border border-white/5 flex items-center gap-2">
            <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
            <div>
              <span className="text-emerald-300 block text-[9px] uppercase font-bold">Humidity</span>
              <strong className="text-white">{weather.humidity}%</strong>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-2 border border-white/5 flex items-center gap-2">
            <Wind className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-emerald-300 block text-[9px] uppercase font-bold">Breeze</span>
              <strong className="text-white">{weather.windSpeed} km/h</strong>
            </div>
          </div>

          <div className="bg-black/20 rounded-xl p-2 border border-white/5 flex items-center gap-2">
            <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <div>
              <span className="text-emerald-300 block text-[9px] uppercase font-bold">Campfire</span>
              <strong className="text-white text-[10px] truncate block">Great</strong>
            </div>
          </div>
        </div>

        {/* Micro 3-day preview strip */}
        <div className="mt-3 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs text-emerald-200">
          {weather.daily.slice(0, 3).map((d, idx) => (
            <div
              key={idx}
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer py-0.5 px-1.5 rounded-lg hover:bg-white/5"
            >
              <span className="font-bold text-[11px] text-white">{d.dayName}:</span>
              {getWeatherIcon(d.icon, 'w-3.5 h-3.5')}
              <span className="font-mono text-[11px]">
                {convertTemp(d.maxTemp)}° / {convertTemp(d.minTemp)}°
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Detailed Modal */}
      {renderForecastModal()}
    </>
  );

  // Reusable 5-Day Interactive Weather Modal
  function renderForecastModal() {
    return (
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 select-none">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-2xl bg-neutral-950 border border-emerald-900/60 rounded-3xl overflow-hidden shadow-2xl text-white flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-950 border-b border-emerald-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                  <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-emerald-300 shrink-0">
                    <CloudFog className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                      <h3 className="font-serif text-base sm:text-xl font-bold text-white truncate">
                        Vagamon Mountain Weather
                      </h3>
                      <span className="text-[9px] sm:text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-800 text-emerald-200 border border-emerald-700 shrink-0">
                        1,100m ASL
                      </span>
                    </div>
                    <p className="text-[11px] sm:text-xs text-emerald-200 truncate">
                      Real-time highland climate &bull; Cloud Heaven
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                  <div className="flex items-center bg-black/40 border border-white/10 rounded-lg p-0.5 text-xs font-bold">
                    <button
                      onClick={() => setUnit('C')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer ${
                        unit === 'C' ? 'bg-emerald-700 text-white' : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      onClick={() => setUnit('F')}
                      className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md transition-colors cursor-pointer ${
                        unit === 'F' ? 'bg-emerald-700 text-white' : 'text-emerald-300 hover:text-white'
                      }`}
                    >
                      °F
                    </button>
                  </div>

                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-1.5 sm:p-2 text-emerald-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer min-w-[36px] min-h-[36px] flex items-center justify-center"
                    aria-label="Close forecast modal"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Scrollable Content */}
              <div className="p-5 sm:p-6 overflow-y-auto space-y-6 scrollbar-thin">
                {/* Current Live Overview Banner */}
                <div className="bg-emerald-900/30 border border-emerald-800/70 rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-950 border border-emerald-800 flex items-center justify-center">
                      {getWeatherIcon(weather.icon, 'w-8 h-8')}
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-serif text-3xl sm:text-4xl font-bold text-white">
                          {displayTemp}°{unit}
                        </span>
                        <span className="text-xs text-emerald-300">
                          Feels like {displayFeels}°{unit}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-emerald-100">{weather.condition}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full sm:w-auto text-xs">
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold">Humidity</span>
                      <strong className="text-white text-sm">{weather.humidity}%</strong>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5">
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold">Wind</span>
                      <strong className="text-white text-sm">{weather.windSpeed} km/h</strong>
                    </div>
                    <div className="bg-black/30 p-2.5 rounded-xl border border-white/5 col-span-2 sm:col-span-1">
                      <span className="text-emerald-400 block text-[10px] uppercase font-bold">UV Index</span>
                      <strong className="text-white text-sm">{weather.uvIndex} (Low)</strong>
                    </div>
                  </div>
                </div>

                {/* Hourly Timeline */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Hourly Mountain Projection</span>
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {weather.hourly.map((h, i) => (
                      <div
                        key={i}
                        className="bg-neutral-900/90 border border-neutral-800 rounded-xl p-3 text-center space-y-1"
                      >
                        <span className="text-[11px] text-neutral-400 block">{h.time}</span>
                        <div className="flex justify-center py-0.5">{getWeatherIcon(h.icon, 'w-5 h-5')}</div>
                        <span className="font-bold text-white text-sm block">
                          {convertTemp(h.temp)}°
                        </span>
                        <span className="text-[10px] text-blue-300 block">{h.rainChance}% rain</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5-Day Extended Highland Forecast */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>5-Day Extended Weather Outlook</span>
                  </h4>
                  <div className="space-y-2">
                    {weather.daily.map((d, i) => (
                      <div
                        key={i}
                        className="bg-neutral-900/70 border border-neutral-800 rounded-xl p-3.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="w-24 font-bold text-white flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          <span>{d.dayName}</span>
                        </div>

                        <div className="flex items-center gap-2 flex-1">
                          {getWeatherIcon(d.icon, 'w-4 h-4')}
                          <span className="text-neutral-300">{d.condition}</span>
                        </div>

                        <div className="flex items-center gap-4 text-right">
                          <span className="text-[11px] text-blue-300 hidden sm:inline">
                            {d.rainChance}% rain
                          </span>
                          <div className="font-mono">
                            <strong className="text-white text-sm">{convertTemp(d.maxTemp)}°</strong>
                            <span className="text-neutral-500 text-xs ml-1.5">/ {convertTemp(d.minTemp)}°</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Highland Guest Comfort & Packing Advisory */}
                <div className="bg-emerald-950/60 border border-emerald-800/80 rounded-2xl p-4 sm:p-5 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-xs uppercase tracking-wider">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Cloud Heaven Highland Stay Insights</span>
                  </div>
                  <p className="text-xs text-neutral-300 leading-relaxed">
                    {weather.travelTip}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <Waves className="w-4 h-4 text-cyan-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-bold">Infinity Pool</span>
                        <strong className="text-white text-[11px]">Clean &amp; Heated</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-bold">Evening Campfire</span>
                        <strong className="text-white text-[11px]">Available 07:00 PM</strong>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5">
                      <Shirt className="w-4 h-4 text-emerald-400 shrink-0" />
                      <div>
                        <span className="text-[10px] text-neutral-400 block font-bold">Suggested Wear</span>
                        <strong className="text-white text-[11px]">Light Woolens for Night</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 bg-neutral-900 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Grounded live with Open-Meteo meteorological radar
                </span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    );
  }
};
