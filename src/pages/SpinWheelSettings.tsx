import { useState, useEffect } from 'react';
import { RotateCcw, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getDailySpinSettings, setDailySpinSettings, DailySpinSettingsRequest } from '../services/api';

const SpinWheelSettings = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [success, setSuccess] = useState<string>('');
    const [error, setError] = useState<string>('');

    const [formData, setFormData] = useState<DailySpinSettingsRequest>({
        DailySpinLimit: 10,
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
            const response = await getDailySpinSettings();
            if (response.data) {
                setFormData({
                    DailySpinLimit: response.data.DailySpinLimit,
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
        if (formData.DailySpinLimit <= 0) {
            setError('Daily Spin Limit must be greater than 0');
            setLoading(false);
            return;
        }

        try {
            const response = await setDailySpinSettings(formData);
            setSuccess(response.message || 'Settings updated successfully');
            // Clear success message after 3 seconds
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
                                <RotateCcw className="text-white" size={24} />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-800">Spin Wheel Settings</h1>
                                <p className="text-gray-500 text-sm">Configure daily spin limits for users</p>
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
                                {/* Daily Spin Limit */}
                                <div className="mb-8">
                                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                                        Daily Spin Limit
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            name="DailySpinLimit"
                                            value={formData.DailySpinLimit}
                                            onChange={handleChange}
                                            min="1"
                                            required
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all text-gray-800"
                                            placeholder="Enter daily limit"
                                        />
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                            per user
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Maximum number of spins a user can use per day (must be greater than 0)
                                    </p>
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
                                <h3 className="font-semibold text-blue-900 mb-1">About Spin Wheel Settings</h3>
                                <ul className="text-sm text-blue-800 space-y-1">
                                    <li>• Daily limit applies per user and resets at midnight</li>
                                    <li>• Changes take effect immediately after saving</li>
                                    <li>• Default value: 10 daily limit if not previously set</li>
                                    <li>• Users will receive a message when their daily limit is reached</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SpinWheelSettings;
