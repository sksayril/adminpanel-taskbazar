import { useState, useEffect } from 'react';
import { Gift, Save, RefreshCw, Coins, Wallet, AlertCircle, CheckCircle2, UserPlus, Sparkles } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSignupBonusSettings, setSignupBonusSettings, SignupBonusSettingsRequest } from '../services/api';

const SignupBonusSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<SignupBonusSettingsRequest>({
    SignupBonusAmount: 0,
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
      const response = await getSignupBonusSettings();
      if (response.data) {
        setFormData({
          SignupBonusAmount: response.data.SignupBonusAmount,
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
    if (formData.SignupBonusAmount < 0) {
      setError('Signup Bonus Amount must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      const response = await setSignupBonusSettings(formData);
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === '' ? 0 : Number(e.target.value);
    setFormData({
      ...formData,
      SignupBonusAmount: value,
    });
  };

  const handleRewardTypeChange = (type: 'Coins' | 'WalletBalance') => {
    setFormData({
      ...formData,
      RewardType: type,
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
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Signup Bonus Settings</h1>
                <p className="text-gray-500 text-sm">Configure the bonus amount and reward type for new user registrations</p>
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
                <RefreshCw className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Signup Bonus Amount */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Signup Bonus Amount
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.SignupBonusAmount}
                      onChange={handleAmountChange}
                      min="0"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-300 focus:outline-none focus:ring-2 focus:border-purple-500 focus:ring-purple-200 transition-all text-gray-800 font-medium text-lg"
                      placeholder="0"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Set to 0 to disable signup bonus. All new users will receive this bonus automatically upon registration.
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
                      onClick={() => handleRewardTypeChange('Coins')}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        formData.RewardType === 'Coins'
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'Coins'
                              ? 'bg-purple-500'
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
                              formData.RewardType === 'Coins' ? 'text-purple-700' : 'text-gray-700'
                            }`}
                          >
                            Coins
                          </div>
                          <div className="text-xs text-gray-500">Virtual currency</div>
                        </div>
                        {formData.RewardType === 'Coins' && (
                          <div className="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
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
                          ? 'border-purple-500 bg-purple-50 shadow-md'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            formData.RewardType === 'WalletBalance'
                              ? 'bg-purple-500'
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
                              formData.RewardType === 'WalletBalance' ? 'text-purple-700' : 'text-gray-700'
                            }`}
                          >
                            Wallet Balance
                          </div>
                          <div className="text-xs text-gray-500">Real money</div>
                        </div>
                        {formData.RewardType === 'WalletBalance' && (
                          <div className="ml-auto w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Choose whether the signup bonus is given as Coins or added to Wallet Balance
                  </p>
                </div>

                {/* Current Settings Summary */}
                <div className="mb-8 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="text-purple-600" size={24} />
                    <h3 className="font-semibold text-purple-900">Current Configuration</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Bonus Amount</p>
                      <p className="text-2xl font-bold text-purple-700">
                        {formData.SignupBonusAmount.toLocaleString()} {formData.RewardType === 'Coins' ? 'Coins' : '₹'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      <p className="text-lg font-semibold text-purple-600">
                        {formData.SignupBonusAmount > 0 ? (
                          <span className="flex items-center gap-2">
                            <CheckCircle2 size={18} className="text-green-600" />
                            Active
                          </span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <AlertCircle size={18} className="text-gray-400" />
                            Disabled
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
                    className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <h3 className="font-semibold text-blue-900 mb-1">About Signup Bonus</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Signup bonus is automatically given to ALL new users upon registration</li>
                  <li>• Setting the amount to 0 disables the signup bonus feature</li>
                  <li>• Signup bonus is separate from referral rewards - users can receive both</li>
                  <li>• Bonus applies to all new users regardless of referral code usage</li>
                  <li>• Changes take effect immediately after saving</li>
                  <li>• Default: 0 (disabled), Reward Type: Coins</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupBonusSettings;
