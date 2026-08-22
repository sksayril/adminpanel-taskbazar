import { useState, useEffect } from 'react';
import { Ticket, Save, RefreshCw, Coins, Wallet, AlertCircle, CheckCircle2, Clock, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getScratchCardDailyLimitSettings, setScratchCardDailyLimitSettings, ScratchCardDailyLimitSettingsRequest } from '../services/api';

const ScratchCardDailyLimitSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<ScratchCardDailyLimitSettingsRequest>({
    DailyLimit: 1,
    RewardAmount: 0,
    RewardCoins: 0,
    IsActive: true,
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
      const response = await getScratchCardDailyLimitSettings();
      if (response.data) {
        setFormData({
          DailyLimit: response.data.DailyLimit,
          RewardAmount: response.data.RewardAmount,
          RewardCoins: response.data.RewardCoins,
          IsActive: response.data.IsActive,
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

    // Validation
    if (formData.DailyLimit !== undefined && formData.DailyLimit < 1) {
      setError('Daily Limit must be a number greater than or equal to 1');
      setLoading(false);
      return;
    }

    if (formData.RewardAmount !== undefined && formData.RewardAmount < 0) {
      setError('Reward Amount must be a number greater than or equal to 0');
      setLoading(false);
      return;
    }

    if (formData.RewardCoins !== undefined && formData.RewardCoins < 0) {
      setError('Reward Coins must be a number greater than or equal to 0');
      setLoading(false);
      return;
    }

    // Check if at least one reward is greater than 0
    const rewardAmount = formData.RewardAmount ?? 0;
    const rewardCoins = formData.RewardCoins ?? 0;
    if (rewardAmount <= 0 && rewardCoins <= 0) {
      setError('At least one reward (Reward Amount or Reward Coins) must be greater than 0');
      setLoading(false);
      return;
    }

    try {
      const response = await setScratchCardDailyLimitSettings(formData);
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof ScratchCardDailyLimitSettingsRequest, value: string | number | boolean) => {
    setFormData({
      ...formData,
      [field]: value,
    });
  };

  const handleNumberChange = (field: 'DailyLimit' | 'RewardAmount' | 'RewardCoins', value: string) => {
    const numValue = value === '' ? 0 : Number(value);
    handleChange(field, numValue);
  };

  const rewardAmount = formData.RewardAmount ?? 0;
  const rewardCoins = formData.RewardCoins ?? 0;
  const dailyLimit = formData.DailyLimit ?? 1;
  const isActive = formData.IsActive ?? true;

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Ticket className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Scratch Card Daily Limit Settings</h1>
                <p className="text-gray-500 text-sm">Configure daily claim limit and rewards for scratch cards</p>
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
                <RefreshCw className="animate-spin text-orange-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Active Toggle */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Feature Status
                  </label>
                  <button
                    type="button"
                    onClick={() => handleChange('IsActive', !isActive)}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all ${
                      isActive
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-300 bg-gray-50'
                    }`}
                  >
                    {isActive ? (
                      <ToggleRight className="text-green-600" size={32} />
                    ) : (
                      <ToggleLeft className="text-gray-400" size={32} />
                    )}
                    <div className="text-left">
                      <div className={`font-semibold ${isActive ? 'text-green-700' : 'text-gray-700'}`}>
                        {isActive ? 'Active' : 'Inactive'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {isActive ? 'Feature is enabled' : 'Feature is disabled'}
                      </div>
                    </div>
                  </button>
                </div>

                {/* Daily Limit */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Daily Claim Limit
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={dailyLimit}
                      onChange={(e) => handleNumberChange('DailyLimit', e.target.value)}
                      min="1"
                      step="1"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:border-orange-500 focus:ring-orange-200 transition-all text-gray-800 font-medium text-lg"
                      placeholder="1"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium flex items-center gap-1">
                      <Clock size={16} />
                      times per day
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Number of times a user can claim scratch card per day (minimum: 1)
                  </p>
                </div>

                {/* Rewards Section */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-4">
                    Reward Settings
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    At least one reward must be greater than 0. Both rewards can be set simultaneously.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Reward Amount (Wallet Balance) */}
                    <div className="p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-blue-50 to-cyan-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet className="text-blue-600" size={20} />
                        <span className="font-semibold text-gray-800">Wallet Balance Reward</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={rewardAmount}
                          onChange={(e) => handleNumberChange('RewardAmount', e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-3 rounded-lg border-2 border-blue-200 focus:outline-none focus:ring-2 focus:border-blue-500 focus:ring-blue-200 transition-all text-gray-800 font-medium bg-white"
                          placeholder="0.00"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          ₹
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Real money added to wallet</p>
                    </div>

                    {/* Reward Coins */}
                    <div className="p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-yellow-50 to-amber-50">
                      <div className="flex items-center gap-2 mb-3">
                        <Coins className="text-yellow-600" size={20} />
                        <span className="font-semibold text-gray-800">Coins Reward</span>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          value={rewardCoins}
                          onChange={(e) => handleNumberChange('RewardCoins', e.target.value)}
                          min="0"
                          step="1"
                          className="w-full px-4 py-3 rounded-lg border-2 border-yellow-200 focus:outline-none focus:ring-2 focus:border-yellow-500 focus:ring-yellow-200 transition-all text-gray-800 font-medium bg-white"
                          placeholder="0"
                        />
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                          Coins
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Virtual currency added to account</p>
                    </div>
                  </div>
                </div>

                {/* Current Settings Summary */}
                <div className="mb-8 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-orange-600" size={24} />
                    <h3 className="font-semibold text-orange-900">Current Configuration</h3>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Daily Limit</p>
                      <p className="text-xl font-bold text-orange-700">{dailyLimit}x</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Wallet Reward</p>
                      <p className="text-xl font-bold text-orange-700">₹{rewardAmount.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Coins Reward</p>
                      <p className="text-xl font-bold text-orange-700">{rewardCoins.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-semibold text-orange-600">
                        {isActive ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-600" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <AlertCircle size={18} className="text-gray-400" />
                            Inactive
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <h3 className="font-semibold text-blue-900 mb-1">About Scratch Card Daily Limit</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• This is a separate feature from regular scratch card settings</li>
                  <li>• Users can claim scratch card up to the daily limit per day</li>
                  <li>• Daily limit resets at midnight (00:00:00) each day</li>
                  <li>• Both wallet balance and coins rewards can be set simultaneously</li>
                  <li>• At least one reward (Wallet or Coins) must be greater than 0</li>
                  <li>• Feature can be enabled/disabled without deleting settings</li>
                  <li>• Changes take effect immediately after saving</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScratchCardDailyLimitSettings;
