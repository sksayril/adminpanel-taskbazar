import { useState, useEffect } from 'react';
import { Coins, Save, RefreshCw, AlertCircle, CheckCircle2, TrendingUp, Calculator } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getCoinConversionSettings, setCoinConversionSettings, CoinConversionSettingsRequest } from '../services/api';

const CoinConversionSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<CoinConversionSettingsRequest>({
    CoinsPerRupee: 1,
    MinimumCoinsToConvert: 100,
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
      const response = await getCoinConversionSettings();
      if (response.data) {
        setFormData({
          CoinsPerRupee: response.data.CoinsPerRupee,
          MinimumCoinsToConvert: response.data.MinimumCoinsToConvert,
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
    if (formData.CoinsPerRupee <= 0) {
      setError('Coins Per Rupee must be greater than 0');
      setLoading(false);
      return;
    }

    if (formData.MinimumCoinsToConvert < 0) {
      setError('Minimum Coins To Convert must be 0 or greater');
      setLoading(false);
      return;
    }

    try {
      const response = await setCoinConversionSettings(formData);
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: Number(value),
    });
  };

  // Calculate examples
  const exampleCoins = [100, 500, 1000, 5000];
  const calculateRupees = (coins: number) => {
    return (coins / formData.CoinsPerRupee).toFixed(2);
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
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Coins className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Coin Conversion Settings</h1>
                <p className="text-gray-500 text-sm">Configure coin-to-rupee conversion rate and minimum requirements</p>
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
                <RefreshCw className="animate-spin text-yellow-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Coins Per Rupee */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp className="text-yellow-600" size={18} />
                    Coins Per Rupee
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="CoinsPerRupee"
                      value={formData.CoinsPerRupee}
                      onChange={handleChange}
                      min="0.01"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all text-gray-800 font-medium"
                      placeholder="Enter coins per rupee"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      coins = ₹1
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    How many coins equal 1 rupee (must be greater than 0)
                  </p>
                </div>

                {/* Minimum Coins To Convert */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Calculator className="text-yellow-600" size={18} />
                    Minimum Coins To Convert
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      name="MinimumCoinsToConvert"
                      value={formData.MinimumCoinsToConvert}
                      onChange={handleChange}
                      min="0"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 transition-all text-gray-800 font-medium"
                      placeholder="Enter minimum coins"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
                      coins
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Minimum coins required to convert to rupees (must be 0 or greater)
                  </p>
                </div>

                {/* Conversion Examples */}
                <div className="mb-8 bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calculator className="text-yellow-600" size={20} />
                    Conversion Examples
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {exampleCoins.map((coins) => {
                      const rupees = calculateRupees(coins);
                      const canConvert = coins >= formData.MinimumCoinsToConvert;
                      return (
                        <div
                          key={coins}
                          className={`bg-white rounded-lg p-4 border-2 ${
                            canConvert ? 'border-yellow-300' : 'border-gray-200 opacity-60'
                          }`}
                        >
                          <div className="text-center">
                            <p className="text-xs text-gray-600 mb-1">Coins</p>
                            <p className="text-lg font-bold text-gray-800">{coins.toLocaleString()}</p>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                              <p className="text-xs text-gray-600 mb-1">Equals</p>
                              <p className={`text-xl font-bold ${canConvert ? 'text-yellow-600' : 'text-gray-400'}`}>
                                ₹{rupees}
                              </p>
                            </div>
                            {!canConvert && (
                              <p className="text-xs text-red-500 mt-1">Below minimum</p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 text-center">
                    Current rate: <span className="font-semibold">{formData.CoinsPerRupee} coins = ₹1</span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-yellow-600 to-amber-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-yellow-700 hover:to-amber-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
                <h3 className="font-semibold text-blue-900 mb-1">About Coin Conversion Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Coins Per Rupee determines the exchange rate (e.g., 10 coins = ₹1)</li>
                  <li>• Minimum Coins To Convert sets the threshold for conversion requests</li>
                  <li>• Users can only convert if they have at least the minimum coins</li>
                  <li>• Changes take effect immediately after saving</li>
                  <li>• Default values: 1 coin per rupee, 100 minimum coins</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Conversion Calculator Card */}
          <div className="mt-6 bg-white rounded-xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calculator className="text-yellow-600" size={20} />
              Conversion Calculator
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Coins</label>
                <input
                  type="number"
                  id="coinsInput"
                  min="0"
                  step="1"
                  placeholder="Enter coins"
                  className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 font-medium mb-3"
                  onChange={(e) => {
                    const coins = Number(e.target.value);
                    const rupees = coins / formData.CoinsPerRupee;
                    const resultElement = document.getElementById('coinsToRupees');
                    if (resultElement) {
                      resultElement.textContent = `₹${rupees.toFixed(2)}`;
                    }
                  }}
                />
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Equals</p>
                  <p id="coinsToRupees" className="text-2xl font-bold text-yellow-600">₹0.00</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Enter Rupees</label>
                <input
                  type="number"
                  id="rupeesInput"
                  min="0"
                  step="0.01"
                  placeholder="Enter rupees"
                  className="w-full px-4 py-3 bg-white border-2 border-yellow-300 rounded-lg focus:border-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-200 font-medium mb-3"
                  onChange={(e) => {
                    const rupees = Number(e.target.value);
                    const coins = rupees * formData.CoinsPerRupee;
                    const resultElement = document.getElementById('rupeesToCoins');
                    if (resultElement) {
                      resultElement.textContent = `${Math.ceil(coins).toLocaleString()} coins`;
                    }
                  }}
                />
                <div className="text-center">
                  <p className="text-xs text-gray-600 mb-1">Equals</p>
                  <p id="rupeesToCoins" className="text-2xl font-bold text-yellow-600">0 coins</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinConversionSettings;
