import { MoreHorizontal } from 'lucide-react';

interface RegistrationDataPoint {
  date: string;
  registrations: number;
}

interface ReportsChartProps {
  registrationData?: RegistrationDataPoint[];
  days?: number;
}

const ReportsChart = ({ registrationData = [], days = 30 }: ReportsChartProps) => {
  // Transform registration data for chart display
  const dataPoints = registrationData.length > 0
    ? registrationData.map((item) => {
        const date = new Date(item.date);
        return {
          time: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          value: item.registrations,
        };
      })
    : [
        { time: '10am', value: 65 },
        { time: '11am', value: 45 },
        { time: '12pm', value: 70 },
        { time: '01pm', value: 55 },
        { time: '02pm', value: 90 },
        { time: '03pm', value: 65 },
        { time: '04pm', value: 50 },
        { time: '05pm', value: 75 },
        { time: '06pm', value: 65 },
        { time: '07pm', value: 85 },
      ];

  const maxValue = Math.max(...dataPoints.map((p) => p.value), 100);
  const height = 300;

  const createSmoothPath = (points: { time: string; value: number }[]) => {
    const width = 700;
    const step = width / (points.length - 1);

    let path = `M 0 ${height - (points[0].value / maxValue) * height}`;

    for (let i = 0; i < points.length - 1; i++) {
      const x1 = i * step;
      const y1 = height - (points[i].value / maxValue) * height;
      const x2 = (i + 1) * step;
      const y2 = height - (points[i + 1].value / maxValue) * height;

      const cx = x1 + step / 2;
      path += ` C ${cx} ${y1}, ${cx} ${y2}, ${x2} ${y2}`;
    }

    return path;
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-gray-900">User Registrations</h2>
          <p className="text-xs text-gray-500">Last {days} days</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="relative">
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>100k</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>80k</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>60k</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>40k</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-2">
          <span>20k</span>
        </div>
        <div className="flex justify-between text-xs text-gray-400 mb-4">
          <span>0</span>
        </div>

        <svg width="100%" height={height} className="overflow-visible">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#60A5FA" />
              <stop offset="50%" stopColor="#A78BFA" />
              <stop offset="100%" stopColor="#EC4899" />
            </linearGradient>
          </defs>
          <path
            d={createSmoothPath(dataPoints)}
            fill="none"
            stroke="url(#gradient1)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        <div className="flex justify-between mt-4 text-xs text-gray-500">
          {dataPoints.map((point, index) => (
            <span key={index}>{point.time}</span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportsChart;
