import { useState, useEffect } from 'react';
import { Users, Save, RefreshCw, Coins, Wallet, AlertCircle, CheckCircle2, Gift, UserPlus } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getReferralSettings, setReferralSettings, ReferralSettingsRequest } from '../services/api';

const ReferralSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<ReferralSettingsRequest>({
    RewardForNewUser: 0,
    RewardForReferrer: 0,
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
      const response = await getReferralSettings();
      if (response.data) {
        setFormData({
          RewardForNewUser: response.data.RewardForNewUser,
          RewardForReferrer: response.data.RewardForReferrer,
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

    // Validation
    if (formData.RewardForNewUser < 0) {
      setError('Reward For New User must be 0 or greater');
      setLoading(false);
      return;
    }

    if (formData.RewardForReferrer < 0) {
      setError('Reward For Referrer must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      const response = await setReferralSettings(formData);
      setSuccess(response.message || 'Settings updated successfully');
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'RewardForNewUser' || name === 'RewardForReferrer' ? Number(value) : value,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Users className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Referral Settings</h1>
                <p className="text-gray-500 text-sm">Configure referral rewards for new users and referrers</p>
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
                <RefreshCw className="animate-spin text-green-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Reward For New User */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <UserPlus className="text-green-600" size={18} />
                    Reward For New User
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="RewardForNewUser"
                      value={formData.RewardForNewUser}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all text-gray-800"
                      placeholder="Enter reward amount"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      amount
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Reward amount given to the new user who joins using a referral code (must be 0 or greater)
                  </p>
                </div>

                {/* Reward For Referrer */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Gift className="text-green-600" size={18} />
                    Reward For Referrer
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="RewardForReferrer"
                      value={formData.RewardForReferrer}
                      onChange={handleChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all text-gray-800"
                      placeholder="Enter reward amount"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                      amount
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Reward amount given to the user whose referral code was used (must be 0 or greater)
                  </p>
                </div>

                {/* Reward Type */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Reward Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, RewardType: 'Coins' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.RewardType === 'Coins'
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'Coins'
                              ? 'bg-green-500'
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
                              formData.RewardType === 'Coins' ? 'text-green-700' : 'text-gray-700'
                            }`}
                          >
                            Coins
                          </div>
                          <div className="text-xs text-gray-500">Virtual currency</div>
                        </div>
                        {formData.RewardType === 'Coins' && (
                          <div className="ml-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, RewardType: 'WalletBalance' })}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.RewardType === 'WalletBalance'
                          ? 'border-green-500 bg-green-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'WalletBalance'
                              ? 'bg-green-500'
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
                              formData.RewardType === 'WalletBalance' ? 'text-green-700' : 'text-gray-700'
                            }`}
                          >
                            Wallet Balance
                          </div>
                          <div className="text-xs text-gray-500">Real money</div>
                        </div>
                        {formData.RewardType === 'WalletBalance' && (
                          <div className="ml-auto w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
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
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <h3 className="font-semibold text-blue-900 mb-1">About Referral Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• New users receive the "Reward For New User" amount when they sign up with a referral code</li>
                  <li>• Referrers receive the "Reward For Referrer" amount when someone uses their referral code</li>
                  <li>• Both reward amounts can be set to 0 to disable rewards</li>
                  <li>• Changes take effect immediately after saving</li>
                  <li>• Default values: 0 for both rewards, Coins type</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Visual Example Card */}
          <div className="mt-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6">
            <h3 className="font-semibold text-green-900 mb-4 flex items-center gap-2">
              <Users className="text-green-600" size={20} />
              How It Works
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <UserPlus className="text-green-600" size={18} />
                  <span className="font-semibold text-gray-800">New User</span>
                </div>
                <p className="text-sm text-gray-600">
                  Joins with referral code → Receives <span className="font-semibold text-green-700">{formData.RewardForNewUser}</span> {formData.RewardType}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <div className="flex items-center gap-2 mb-2">
                  <Gift className="text-green-600" size={18} />
                  <span className="font-semibold text-gray-800">Referrer</span>
                </div>
                <p className="text-sm text-gray-600">
                  Someone uses their code → Receives <span className="font-semibold text-green-700">{formData.RewardForReferrer}</span> {formData.RewardType}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReferralSettings;
