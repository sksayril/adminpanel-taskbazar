import { MoreHorizontal } from 'lucide-react';

interface WithdrawalStats {
  pending: { count: number; totalAmount: number };
  approved: { count: number; totalAmount: number };
  rejected: { count: number; totalAmount: number };
}

interface AnalyticsChartProps {
  withdrawalStats?: WithdrawalStats;
}

const AnalyticsChart = ({ withdrawalStats }: AnalyticsChartProps) => {
  // Calculate percentages for the chart
  const total = withdrawalStats
    ? withdrawalStats.pending.count + withdrawalStats.approved.count + withdrawalStats.rejected.count
    : 0;

  const pendingPercent = withdrawalStats && total > 0 ? (withdrawalStats.pending.count / total) * 100 : 33.33;
  const approvedPercent = withdrawalStats && total > 0 ? (withdrawalStats.approved.count / total) * 100 : 33.33;
  const rejectedPercent = withdrawalStats && total > 0 ? (withdrawalStats.rejected.count / total) * 100 : 33.33;

  const circumference = 2 * Math.PI * 90;
  const pendingDash = (pendingPercent / 100) * circumference;
  const approvedDash = (approvedPercent / 100) * circumference;
  const rejectedDash = (rejectedPercent / 100) * circumference;

  const approvedOffset = -pendingDash;
  const rejectedOffset = -(pendingDash + approvedDash);

  const formatCurrency = (num: number): string => {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Withdrawal Status</h2>
          <p className="text-xs text-gray-500">Distribution overview</p>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      <div className="flex flex-col items-center">
        <div className="relative w-52 h-52">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="104"
              cy="104"
              r="90"
              fill="none"
              stroke="#FBBF24"
              strokeWidth="24"
              strokeDasharray={`${pendingDash} ${circumference}`}
            />
            <circle
              cx="104"
              cy="104"
              r="90"
              fill="none"
              stroke="#10B981"
              strokeWidth="24"
              strokeDasharray={`${approvedDash} ${circumference}`}
              strokeDashoffset={approvedOffset}
            />
            <circle
              cx="104"
              cy="104"
              r="90"
              fill="none"
              stroke="#EF4444"
              strokeWidth="24"
              strokeDasharray={`${rejectedDash} ${circumference}`}
              strokeDashoffset={rejectedOffset}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold text-gray-900">{total}</div>
            <div className="text-sm text-gray-500">Total Requests</div>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-8 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
              <span className="text-sm text-gray-600">Pending</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {withdrawalStats ? withdrawalStats.pending.count : 0}
              </div>
              {withdrawalStats && (
                <div className="text-xs text-gray-500">{formatCurrency(withdrawalStats.pending.totalAmount)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Approved</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {withdrawalStats ? withdrawalStats.approved.count : 0}
              </div>
              {withdrawalStats && (
                <div className="text-xs text-gray-500">{formatCurrency(withdrawalStats.approved.totalAmount)}</div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm text-gray-600">Rejected</span>
            </div>
            <div className="text-right">
              <div className="text-sm font-semibold text-gray-900">
                {withdrawalStats ? withdrawalStats.rejected.count : 0}
              </div>
              {withdrawalStats && (
                <div className="text-xs text-gray-500">{formatCurrency(withdrawalStats.rejected.totalAmount)}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsChart;
