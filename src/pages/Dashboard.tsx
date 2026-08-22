import { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import StatsCard from '../components/StatsCard';
import AnalyticsChart from '../components/AnalyticsChart';
import { Users, Wallet, Coins, TrendingUp, RefreshCw, AlertCircle, Clock, CheckCircle2, X, Activity, Ticket, RotateCcw, Shield, ArrowUpRight, ArrowDownRight, UsersRound, CalendarDays } from 'lucide-react';
import {
  getDashboardStatistics,
  DashboardStatistics,
  getCronJobsStatus,
  getDailyResetStatus,
  CronJobsStatusResponse,
  DailyResetStatusResponse,
} from '../services/api';

const Dashboard = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [dashboardData, setDashboardData] = useState<DashboardStatistics | null>(null);
  const [days, setDays] = useState(30);
  const [cronJobsStatus, setCronJobsStatus] = useState<CronJobsStatusResponse | null>(null);
  const [dailyResetStatus, setDailyResetStatus] = useState<DailyResetStatusResponse | null>(null);
  const [loadingCronStatus, setLoadingCronStatus] = useState(false);
  const [loadingDailyReset, setLoadingDailyReset] = useState(false);
  const [showCronModal, setShowCronModal] = useState(false);
  const [showDailyResetModal, setShowDailyResetModal] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getDashboardStatistics(days);
      setDashboardData(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [days]);

  const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  const formatCurrency = (num: number): string => {
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const fetchCronJobsStatus = async () => {
    setLoadingCronStatus(true);
    setError('');
    try {
      const response = await getCronJobsStatus();
      setCronJobsStatus(response);
      setShowCronModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load cron jobs status');
    } finally {
      setLoadingCronStatus(false);
    }
  };

  const fetchDailyResetStatus = async () => {
    setLoadingDailyReset(true);
    setError('');
    try {
      const response = await getDailyResetStatus();
      setDailyResetStatus(response);
      setShowDailyResetModal(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load daily reset status');
    } finally {
      setLoadingDailyReset(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        {/* Days Filter */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-sm text-gray-500">Overview of your platform statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <select
              value={days}
              onChange={(e) => setDays(Number(e.target.value))}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              onClick={fetchDashboardData}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <RefreshCw className={loading ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
            <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
            <p className="text-red-700 text-sm font-medium">{error}</p>
          </div>
        )}

        {loading && !dashboardData ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="animate-spin text-blue-600" size={32} />
          </div>
        ) : dashboardData ? (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatsCard
                icon={<Users className="text-blue-500" size={24} />}
                value={formatNumber(dashboardData.users.totalUsers)}
                label="Total Users"
                bgColor="bg-blue-50"
              />
              <StatsCard
                icon={<TrendingUp className="text-green-500" size={24} />}
                value={formatNumber(dashboardData.users.todayRegistrations)}
                label="Today's Registrations"
                bgColor="bg-green-50"
              />
              <StatsCard
                icon={<Wallet className="text-purple-500" size={24} />}
                value={formatCurrency(dashboardData.wallet.totalWalletBalance)}
                label="Total Wallet Balance"
                bgColor="bg-purple-50"
              />
              <StatsCard
                icon={<Coins className="text-yellow-500" size={24} />}
                value={formatNumber(dashboardData.wallet.totalCoins)}
                label="Total Coins"
                bgColor="bg-yellow-50"
              />
            </div>

            {/* Analytics Section */}
            <div className="mb-8">
              <AnalyticsChart withdrawalStats={dashboardData.withdrawals.statistics} />
            </div>

            {/* Withdrawal Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="rounded-2xl p-6 border border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-amber-800">Pending Withdrawals</h3>
                  <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                    <Clock className="text-amber-700" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-amber-950 mb-1">
                  {dashboardData.withdrawals.statistics.pending.count}
                </div>
                <div className="text-sm text-amber-800/80">
                  {formatCurrency(dashboardData.withdrawals.statistics.pending.totalAmount)}
                </div>
              </div>

              <div className="rounded-2xl p-6 border border-emerald-200 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-emerald-800">Approved Withdrawals</h3>
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <ArrowUpRight className="text-emerald-700" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-emerald-950 mb-1">
                  {dashboardData.withdrawals.statistics.approved.count}
                </div>
                <div className="text-sm text-emerald-800/80">
                  {formatCurrency(dashboardData.withdrawals.statistics.approved.totalAmount)}
                </div>
              </div>

              <div className="rounded-2xl p-6 border border-rose-200 bg-gradient-to-br from-rose-50 via-red-50 to-pink-50 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-rose-800">Rejected Withdrawals</h3>
                  <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center">
                    <ArrowDownRight className="text-rose-700" size={20} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-rose-950 mb-1">
                  {dashboardData.withdrawals.statistics.rejected.count}
                </div>
                <div className="text-sm text-rose-800/80">
                  {formatCurrency(dashboardData.withdrawals.statistics.rejected.totalAmount)}
                </div>
              </div>
            </div>

            {/* Total Withdrawals Summary */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white mb-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm mb-1">Total Withdrawals</p>
                  <p className="text-3xl font-bold">{formatCurrency(dashboardData.withdrawals.totalWithdrawals)}</p>
                </div>
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center">
                  <Wallet className="text-white" size={32} />
                </div>
              </div>
            </div>

            {/* Requested Summary (New API Fields) */}
            {dashboardData.requestedSummary && (
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-800">Requested Summary</h3>
                  <span className="text-xs px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 font-medium">Live Insights</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="rounded-xl p-4 border border-blue-200 bg-gradient-to-br from-blue-50 to-cyan-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-blue-700 font-medium">Users Today</p>
                      <UsersRound size={16} className="text-blue-700" />
                    </div>
                    <p className="text-2xl font-bold text-blue-950">{formatNumber(dashboardData.requestedSummary.users.today)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-sky-200 bg-gradient-to-br from-sky-50 to-blue-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-sky-700 font-medium">Users Yesterday</p>
                      <CalendarDays size={16} className="text-sky-700" />
                    </div>
                    <p className="text-2xl font-bold text-sky-950">{formatNumber(dashboardData.requestedSummary.users.yesterday)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-violet-200 bg-gradient-to-br from-violet-50 to-purple-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-violet-700 font-medium">Users 7 Days</p>
                      <UsersRound size={16} className="text-violet-700" />
                    </div>
                    <p className="text-2xl font-bold text-violet-950">{formatNumber(dashboardData.requestedSummary.users.sevenDays)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-indigo-700 font-medium">Users This Month</p>
                      <CalendarDays size={16} className="text-indigo-700" />
                    </div>
                    <p className="text-2xl font-bold text-indigo-950">{formatNumber(dashboardData.requestedSummary.users.thisMonth)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-slate-200 bg-gradient-to-br from-slate-50 to-gray-100 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-slate-700 font-medium">Users Last Month</p>
                      <CalendarDays size={16} className="text-slate-700" />
                    </div>
                    <p className="text-2xl font-bold text-slate-950">{formatNumber(dashboardData.requestedSummary.users.lastMonth)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-cyan-200 bg-gradient-to-br from-cyan-50 to-teal-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-cyan-700 font-medium">Users Total</p>
                      <Users className="text-cyan-700" size={16} />
                    </div>
                    <p className="text-2xl font-bold text-cyan-950">{formatNumber(dashboardData.requestedSummary.users.total)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-emerald-700 font-medium">Withdrawals Today</p>
                      <ArrowUpRight size={16} className="text-emerald-700" />
                    </div>
                    <p className="text-2xl font-bold text-emerald-950">{formatNumber(dashboardData.requestedSummary.withdrawals.today)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-amber-200 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-amber-700 font-medium">Withdrawals Yesterday</p>
                      <Clock size={16} className="text-amber-700" />
                    </div>
                    <p className="text-2xl font-bold text-amber-950">{formatNumber(dashboardData.requestedSummary.withdrawals.yesterday)}</p>
                  </div>
                  <div className="rounded-xl p-4 border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-pink-50 shadow-sm md:col-span-3 lg:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-fuchsia-700 font-medium">Withdrawals This Month</p>
                      <Wallet size={16} className="text-fuchsia-700" />
                    </div>
                    <p className="text-2xl font-bold text-fuchsia-950">{formatNumber(dashboardData.requestedSummary.withdrawals.thisMonth)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Cron Jobs Management Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                    <Clock className="text-indigo-600" size={24} />
                    Cron Jobs Management
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">Monitor and check automated system jobs</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={fetchCronJobsStatus}
                  disabled={loadingCronStatus}
                  className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl hover:border-indigo-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <Activity className="text-indigo-600" size={24} />
                    </div>
                    {loadingCronStatus && <RefreshCw className="animate-spin text-indigo-600" size={20} />}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">Get Cron Jobs Status</h3>
                  <p className="text-sm text-gray-600">View status and schedule of all automated cron jobs</p>
                </button>

                <button
                  onClick={fetchDailyResetStatus}
                  disabled={loadingDailyReset}
                  className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:border-green-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-left group"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <RefreshCw className="text-green-600" size={24} />
                    </div>
                    {loadingDailyReset && <RefreshCw className="animate-spin text-green-600" size={20} />}
                  </div>
                  <h3 className="font-bold text-gray-800 mb-1">Check Daily Reset Status</h3>
                  <p className="text-sm text-gray-600">View daily limit reset statistics and status</p>
                </button>
              </div>
            </div>
          </>
        ) : null}

        {/* Cron Jobs Status Modal */}
        {showCronModal && cronJobsStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Activity className="text-indigo-600" size={24} />
                  Cron Jobs Status
                </h3>
                <button
                  onClick={() => {
                    setShowCronModal(false);
                    setCronJobsStatus(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Daily Reset Job */}
                <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Daily Reset Job</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cronJobsStatus.data.dailyResetJob.scheduled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {cronJobsStatus.data.dailyResetJob.scheduled ? 'Scheduled' : 'Not Scheduled'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Schedule</div>
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <Clock size={16} className="text-indigo-600" />
                        {cronJobsStatus.data.dailyResetJob.schedule}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Description</div>
                      <div className="text-sm text-gray-700">{cronJobsStatus.data.dailyResetJob.description}</div>
                    </div>
                  </div>
                </div>

                {/* Cleanup Old Records Job */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-bold text-gray-800">Cleanup Old Records Job</h4>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        cronJobsStatus.data.cleanupOldRecordsJob.scheduled
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {cronJobsStatus.data.cleanupOldRecordsJob.scheduled ? 'Scheduled' : 'Not Scheduled'}
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Schedule</div>
                      <div className="text-sm font-medium text-gray-800 flex items-center gap-2">
                        <Clock size={16} className="text-blue-600" />
                        {cronJobsStatus.data.cleanupOldRecordsJob.schedule}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Description</div>
                      <div className="text-sm text-gray-700">{cronJobsStatus.data.cleanupOldRecordsJob.description}</div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-blue-800">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>{cronJobsStatus.data.note}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowCronModal(false);
                    setCronJobsStatus(null);
                  }}
                  className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Daily Reset Status Modal */}
        {showDailyResetModal && dailyResetStatus && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <RefreshCw className="text-green-600" size={24} />
                  Daily Reset Status
                </h3>
                <button
                  onClick={() => {
                    setShowDailyResetModal(false);
                    setDailyResetStatus(null);
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Timestamps */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Reset Time</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(dailyResetStatus.data.resetTime)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Today</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(dailyResetStatus.data.today)}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                    <div className="text-sm font-medium text-gray-800">{formatDate(dailyResetStatus.data.yesterday)}</div>
                  </div>
                </div>

                {/* Statistics */}
                <div>
                  <h4 className="text-lg font-bold text-gray-800 mb-4">Daily Limit Statistics</h4>
                  <div className="space-y-4">
                    {/* Scratch Card */}
                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-800">Scratch Card</h5>
                        <Ticket className="text-yellow-600" size={20} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Today</div>
                          <div className="text-2xl font-bold text-gray-800">{dailyResetStatus.data.statistics.scratchCard.today}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                          <div className="text-2xl font-bold text-gray-600">{dailyResetStatus.data.statistics.scratchCard.yesterday}</div>
                        </div>
                      </div>
                    </div>

                    {/* Daily Spin */}
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-800">Daily Spin</h5>
                        <RotateCcw className="text-purple-600" size={20} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Today</div>
                          <div className="text-2xl font-bold text-gray-800">{dailyResetStatus.data.statistics.dailySpin.today}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                          <div className="text-2xl font-bold text-gray-600">{dailyResetStatus.data.statistics.dailySpin.yesterday}</div>
                        </div>
                      </div>
                    </div>

                    {/* Captcha */}
                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="font-semibold text-gray-800">Captcha</h5>
                        <Shield className="text-blue-600" size={20} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Today</div>
                          <div className="text-2xl font-bold text-gray-800">{dailyResetStatus.data.statistics.captcha.today}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Yesterday</div>
                          <div className="text-2xl font-bold text-gray-600">{dailyResetStatus.data.statistics.captcha.yesterday}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-green-800">
                      <p className="font-semibold mb-1">Note:</p>
                      <p>{dailyResetStatus.data.note}</p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowDailyResetModal(false);
                    setDailyResetStatus(null);
                  }}
                  className="w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
