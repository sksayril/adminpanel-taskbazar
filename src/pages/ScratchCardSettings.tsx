import { useState, useEffect } from 'react';
import { Ticket, Save, RefreshCw, Coins, Wallet, AlertCircle, CheckCircle2, TrendingUp, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getScratchCardSettings, setScratchCardSettings, ScratchCardSettingsRequest } from '../services/api';

const daysOfWeek = [
  { key: 'Sunday', label: 'Sunday', emoji: '🎁', color: 'from-red-50 to-pink-50', borderColor: 'border-red-200' },
  { key: 'Monday', label: 'Monday', emoji: '🎯', color: 'from-blue-50 to-cyan-50', borderColor: 'border-blue-200' },
  { key: 'Tuesday', label: 'Tuesday', emoji: '🎪', color: 'from-green-50 to-emerald-50', borderColor: 'border-green-200' },
  { key: 'Wednesday', label: 'Wednesday', emoji: '🎨', color: 'from-purple-50 to-indigo-50', borderColor: 'border-purple-200' },
  { key: 'Thursday', label: 'Thursday', emoji: '🎭', color: 'from-yellow-50 to-amber-50', borderColor: 'border-yellow-200' },
  { key: 'Friday', label: 'Friday', emoji: '🎉', color: 'from-orange-50 to-red-50', borderColor: 'border-orange-200' },
  { key: 'Saturday', label: 'Saturday', emoji: '🎊', color: 'from-pink-50 to-rose-50', borderColor: 'border-pink-200' },
];

const ScratchCardSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<ScratchCardSettingsRequest>({
    Sunday: 0,
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0,
    RewardType: 'Coins',
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Fetch current settings on component mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await getScratchCardSettings();
      if (response.data) {
        setFormData({
          Sunday: response.data.Sunday,
          Monday: response.data.Monday,
          Tuesday: response.data.Tuesday,
          Wednesday: response.data.Wednesday,
          Thursday: response.data.Thursday,
          Friday: response.data.Friday,
          Saturday: response.data.Saturday,
          RewardType: response.data.RewardType,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation - check all days are >= 0
    const invalidDays = daysOfWeek.filter(
      (day) => formData[day.key as keyof ScratchCardSettingsRequest] < 0
    );

    if (invalidDays.length > 0) {
      setError('All scratch card amounts must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      const response = await setScratchCardSettings(formData);
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleDayChange = (day: string, value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    setFormData({
      ...formData,
      [day]: numValue,
    });
  };

  const handleRewardTypeChange = (type: 'Coins' | 'WalletBalance') => {
    setFormData({
      ...formData,
      RewardType: type,
    });
  };

  // Calculate total weekly reward
  const totalWeeklyReward = daysOfWeek.reduce(
    (sum, day) => sum + (formData[day.key as keyof ScratchCardSettingsRequest] as number),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Scratch Card Settings</h1>
                <p className="text-gray-500 text-sm">Configure scratch card reward amounts for each day of the week</p>
              </div>
            </div>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Settings Card */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-pink-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Daily Scratch Card Grid */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Daily Scratch Card Rewards
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {daysOfWeek.map((day) => {
                      const value = formData[day.key as keyof ScratchCardSettingsRequest] as number;
                      const isWeekend = day.key === 'Saturday' || day.key === 'Sunday';
                      return (
                        <div
                          key={day.key}
                          className={`p-4 rounded-xl border-2 transition-all bg-gradient-to-br ${day.color} ${day.borderColor}`}
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <span className="text-2xl">{day.emoji}</span>
                              <span className="font-semibold text-gray-800">{day.label}</span>
                            </div>
                            {isWeekend && (
                              <span className="text-xs bg-pink-100 text-pink-700 px-2 py-1 rounded-full font-medium">
                                Weekend
                              </span>
                            )}
                          </div>
                          <div className="relative">
                            <input
                              type="number"
                              value={value}
                              onChange={(e) => handleDayChange(day.key, e.target.value)}
                              min="0"
                              step="0.01"
                              required
                              className={`w-full px-4 py-3 rounded-lg border-2 focus:outline-none focus:ring-2 transition-all text-gray-800 font-medium ${
                                isWeekend
                                  ? 'border-pink-300 focus:border-pink-500 focus:ring-pink-200 bg-white'
                                  : 'border-gray-300 focus:border-pink-500 focus:ring-pink-200 bg-white'
                              }`}
                              placeholder="0"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium">
                              {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Weekly Total Summary */}
                <div className="mb-8 bg-gradient-to-r from-pink-50 to-rose-50 border border-pink-200 rounded-xl p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <TrendingUp className="text-pink-600" size={24} />
                      <div>
                        <p className="text-sm text-gray-600">Total Weekly Reward</p>
                        <p className="text-2xl font-bold text-pink-700">
                          {totalWeeklyReward.toLocaleString()} {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Average per day</p>
                      <p className="text-lg font-semibold text-pink-600">
                        {(totalWeeklyReward / 7).toFixed(2)} {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Reward Type */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reward Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => handleRewardTypeChange('Coins')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.RewardType === 'Coins'
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'Coins'
                              ? 'bg-pink-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          <Coins
                            className={formData.RewardType === 'Coins' ? 'text-white' : 'text-gray-500'}
                            size={20}
                          />
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-semibold ${
                              formData.RewardType === 'Coins' ? 'text-pink-700' : 'text-gray-700'
                            }`}
                          >
                            Coins
                          </div>
                          <div className="text-xs text-gray-500">Virtual currency</div>
                        </div>
                        {formData.RewardType === 'Coins' && (
                          <div className="ml-auto w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRewardTypeChange('WalletBalance')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.RewardType === 'WalletBalance'
                          ? 'border-pink-500 bg-pink-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'WalletBalance'
                              ? 'bg-pink-500'
                              : 'bg-gray-200'
                          }`}
                        >
                          <Wallet
                            className={
                              formData.RewardType === 'WalletBalance' ? 'text-white' : 'text-gray-500'
                            }
                            size={20}
                          />
                        </div>
                        <div className="text-left">
                          <div
                            className={`font-semibold ${
                              formData.RewardType === 'WalletBalance' ? 'text-pink-700' : 'text-gray-700'
                            }`}
                          >
                            Wallet Balance
                          </div>
                          <div className="text-xs text-gray-500">Real money</div>
                        </div>
                        {formData.RewardType === 'WalletBalance' && (
                          <div className="ml-auto w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Choose whether rewards are given as Coins or added to Wallet Balance
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-pink-600 to-rose-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-pink-700 hover:to-rose-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        Save Settings
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={fetchSettings}
                    disabled={fetching}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={fetching ? 'animate-spin' : ''} size={20} />
                    Refresh
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Info Card */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Scratch Card Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Users can claim scratch card once per day</li>
                  <li>• Weekly reset happens automatically every Monday</li>
                  <li>• All reward amounts must be 0 or greater</li>
                  <li>• Weekend rewards (Saturday & Sunday) are highlighted</li>
                  <li>• Changes take effect immediately after saving</li>
                  <li>• Default values: 0 for all days, Coins type</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Weekly Reward Chart */}
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Sparkles className="text-pink-600" size={20} />
              Weekly Scratch Card Overview
            </h3>
            <div className="space-y-3">
              {daysOfWeek.map((day) => {
                const value = formData[day.key as keyof ScratchCardSettingsRequest] as number;
                const percentage = totalWeeklyReward > 0 ? (value / totalWeeklyReward) * 100 : 0;
                const isWeekend = day.key === 'Saturday' || day.key === 'Sunday';
                return (
                  <div key={day.key} className="flex items-center gap-4">
                    <div className="w-24 flex items-center gap-2">
                      <span className="text-lg">{day.emoji}</span>
                      <span className="text-sm font-medium text-gray-700">{day.label}</span>
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-8 relative overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 flex items-center justify-end pr-2 ${
                          isWeekend
                            ? 'bg-gradient-to-r from-pink-500 to-rose-500'
                            : 'bg-gradient-to-r from-pink-400 to-pink-500'
                        }`}
                        style={{ width: `${Math.max(percentage, value > 0 ? 5 : 0)}%` }}
                      >
                        {value > 0 && (
                          <span className="text-white text-xs font-semibold">
                            {value} {formData.RewardType === 'Coins' ? 'C' : '₹'}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-sm font-semibold text-gray-800">
                        {value} {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardSettings;
