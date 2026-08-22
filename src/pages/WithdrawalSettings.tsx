import { useState, useEffect } from 'react';
import { Wallet, Save, RefreshCw, AlertCircle, CheckCircle2, Plus, X } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getWithdrawalThreshold, setWithdrawalThreshold, WithdrawalThresholdRequest } from '../services/api';

const DEFAULT_DENOMINATIONS = [10, 20, 30, 50];

const WithdrawalSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [minimumAmount, setMinimumAmount] = useState(100);
  const [dailyLimit, setDailyLimit] = useState<number>(1);
  const [denominations, setDenominations] = useState<number[]>(DEFAULT_DENOMINATIONS);
  const [newDenomination, setNewDenomination] = useState('');

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await getWithdrawalThreshold();
      if (response.data) {
        setMinimumAmount(response.data.MinimumWithdrawalAmount ?? 100);
        const limit = response.data.DailyWithdrawalRequestLimit;
        setDailyLimit(typeof limit === 'number' && limit >= 1 ? limit : 1);
        setDenominations(
          Array.isArray(response.data.WithdrawalDenominations) && response.data.WithdrawalDenominations.length > 0
            ? response.data.WithdrawalDenominations
            : DEFAULT_DENOMINATIONS
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const addDenomination = () => {
    const val = Number(newDenomination.trim());
    if (!Number.isFinite(val) || val <= 0) {
      setError('Enter a positive number to add as a denomination.');
      return;
    }
    if (denominations.includes(val)) {
      setError(`₹${val} is already in the list.`);
      return;
    }
    setDenominations((prev) => [...prev, val].sort((a, b) => a - b));
    setNewDenomination('');
    setError('');
  };

  const removeDenomination = (val: number) => {
    setDenominations((prev) => prev.filter((d) => d !== val));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (minimumAmount < 1) {
      setError('Minimum Withdrawal Amount must be at least 1');
      setLoading(false);
      return;
    }

    if (denominations.length === 0) {
      setError('Add at least one withdrawal denomination.');
      setLoading(false);
      return;
    }

    const invalidDenom = denominations.find((d) => d <= 0 || !Number.isFinite(d));
    if (invalidDenom !== undefined) {
      setError(`Denomination must be a positive number; found ${invalidDenom}`);
      setLoading(false);
      return;
    }

    try {
      const body: WithdrawalThresholdRequest = {
        MinimumWithdrawalAmount: minimumAmount,
        DailyWithdrawalRequestLimit: dailyLimit,
        WithdrawalDenominations: denominations,
      };
      const response = await setWithdrawalThreshold(body);
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <Wallet className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Withdrawal Settings</h1>
                <p className="text-gray-500 text-sm">
                  Configure withdrawal thresholds, daily limits, and denominations
                </p>
              </div>
            </div>
          </div>

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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-green-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Minimum Withdrawal Amount */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Minimum Withdrawal Amount (required)
                  </label>
                  <div className="relative max-w-sm">
                    <input
                      type="number"
                      value={minimumAmount}
                      onChange={(e) => setMinimumAmount(Number(e.target.value))}
                      min="1"
                      step="1"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all text-gray-800"
                      placeholder="e.g. 500"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Users must have at least this amount in their wallet to submit a withdrawal request.
                  </p>
                </div>

                {/* Daily Withdrawal Request Limit */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Daily Withdrawal Request Limit (optional)
                  </label>
                  <select
                    value={dailyLimit}
                    onChange={(e) => setDailyLimit(Number(e.target.value))}
                    className="w-full max-w-sm px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200 transition-all text-gray-800"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                      <option key={n} value={n}>
                        {n} per day
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Limits total daily withdrawal actions per user (UPI + Bank + Gift Voucher).
                  </p>
                </div>

                {/* Withdrawal Denominations */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Withdrawal Denominations (optional)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">
                    Fixed amounts users can choose when making a withdrawal request. Default:{' '}
                    <code className="bg-gray-100 px-1 rounded">[10, 20, 30, 50]</code>
                  </p>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {denominations.map((d) => (
                      <span
                        key={d}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-green-50 border border-green-200 text-sm font-medium text-green-800"
                      >
                        ₹{d}
                        <button
                          type="button"
                          onClick={() => removeDenomination(d)}
                          className="text-green-600 hover:text-red-600 transition-colors"
                          aria-label={`Remove ₹${d}`}
                        >
                          <X size={14} />
                        </button>
                      </span>
                    ))}
                    {denominations.length === 0 && (
                      <span className="text-sm text-gray-400 italic">No denominations — add at least one</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={newDenomination}
                      onChange={(e) => setNewDenomination(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addDenomination();
                        }
                      }}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-300 focus:border-green-500 text-sm"
                      placeholder="e.g. 100"
                    />
                    <button
                      type="button"
                      onClick={addDenomination}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      aria-label="Add denomination"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Saving…
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
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <RefreshCw className={fetching ? 'animate-spin' : ''} size={20} />
                    Refresh
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Withdrawal Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Minimum amount is enforced when users submit withdrawal requests</li>
                  <li>• Daily limit (1–8) covers all withdrawal types: UPI, Bank Transfer, and Gift Voucher</li>
                  <li>• Users can only withdraw one of the allowed denominations</li>
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

export default WithdrawalSettings;
