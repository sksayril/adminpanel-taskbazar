import { useEffect, useMemo, useState } from 'react';
import { Megaphone, RefreshCw, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  AdsSettings as AdsSettingsData,
  AdsTaskRule,
  AdsTaskType,
  getAdsSettings,
  updateAdsSettings,
  updateTaskAdsSettings,
} from '../services/api';

const DEFAULT_TASKS: AdsTaskType[] = [
  'Quiz',
  'Captcha',
  'DailySpin',
  'ScratchCard',
  'ScratchCardDailyLimit',
  'AppInstall',
];

const defaultTaskRule = (taskType: AdsTaskType): AdsTaskRule => ({
  TaskType: taskType,
  IsActive: true,
  BannerEnabled: true,
  RewardedEnabled: true,
  InterstitialEnabled: true,
  InterstitialAfterCount: 1,
  RewardedAfterCount: 1,
});

const AdsSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);
  const [savingTaskType, setSavingTaskType] = useState<AdsTaskType | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState<AdsSettingsData>({
    GlobalAdsEnabled: true,
    BannerAdsEnabled: true,
    RewardedAdsEnabled: true,
    InterstitialAdsEnabled: true,
    TaskRules: DEFAULT_TASKS.map(defaultTaskRule),
  });

  const toggleSidebar = () => setIsSidebarExpanded((prev) => !prev);

  const normalizedTaskRules = useMemo(() => {
    return DEFAULT_TASKS.map((taskType) => {
      const fromApi = formData.TaskRules.find((item) => item.TaskType === taskType);
      return {
        ...defaultTaskRule(taskType),
        ...fromApi,
        TaskType: taskType,
      };
    });
  }, [formData.TaskRules]);

  const fetchSettings = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await getAdsSettings();
      const data = response.data;
      setFormData({
        GlobalAdsEnabled: data.GlobalAdsEnabled,
        BannerAdsEnabled: data.BannerAdsEnabled,
        RewardedAdsEnabled: data.RewardedAdsEnabled,
        InterstitialAdsEnabled: data.InterstitialAdsEnabled,
        TaskRules: data.TaskRules || [],
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load ads settings');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateGlobalField = (
    key: 'GlobalAdsEnabled' | 'BannerAdsEnabled' | 'RewardedAdsEnabled' | 'InterstitialAdsEnabled',
    value: boolean
  ) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const updateTaskRule = (taskType: AdsTaskType, patch: Partial<AdsTaskRule>) => {
    setFormData((prev) => ({
      ...prev,
      TaskRules: normalizedTaskRules.map((rule) =>
        rule.TaskType === taskType
          ? {
              ...rule,
              ...patch,
            }
          : rule
      ),
    }));
  };

  const handleSaveAll = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await updateAdsSettings({
        GlobalAdsEnabled: formData.GlobalAdsEnabled,
        BannerAdsEnabled: formData.BannerAdsEnabled,
        RewardedAdsEnabled: formData.RewardedAdsEnabled,
        InterstitialAdsEnabled: formData.InterstitialAdsEnabled,
        TaskRules: normalizedTaskRules,
      });
      setSuccess(response.message || 'Ads settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update ads settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTask = async (taskRule: AdsTaskRule) => {
    setSavingTaskType(taskRule.TaskType);
    setError('');
    setSuccess('');
    try {
      const response = await updateTaskAdsSettings(taskRule.TaskType, {
        IsActive: taskRule.IsActive,
        BannerEnabled: taskRule.BannerEnabled,
        RewardedEnabled: taskRule.RewardedEnabled,
        InterstitialEnabled: taskRule.InterstitialEnabled,
        InterstitialAfterCount: Number(taskRule.InterstitialAfterCount || 0),
        RewardedAfterCount: Number(taskRule.RewardedAfterCount || 0),
      });
      setSuccess(response.message || `${taskRule.TaskType} ads settings updated`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to update ${taskRule.TaskType} settings`);
    } finally {
      setSavingTaskType(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Ads Settings</h1>
                <p className="text-gray-500 text-sm">Manage global and task-wise ad configuration</p>
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

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 mb-6">
            {fetching ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-orange-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading ads settings...</p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-800 mb-5">Global Ads Controls</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { key: 'GlobalAdsEnabled', label: 'Global Ads Enabled' },
                    { key: 'BannerAdsEnabled', label: 'Banner Ads Enabled' },
                    { key: 'RewardedAdsEnabled', label: 'Rewarded Ads Enabled' },
                    { key: 'InterstitialAdsEnabled', label: 'Interstitial Ads Enabled' },
                  ].map((item) => (
                    <label
                      key={item.key}
                      className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
                    >
                      <span className="text-sm font-medium text-gray-700">{item.label}</span>
                      <input
                        type="checkbox"
                        checked={Boolean(formData[item.key as keyof AdsSettingsData])}
                        onChange={(e) =>
                          updateGlobalField(
                            item.key as 'GlobalAdsEnabled' | 'BannerAdsEnabled' | 'RewardedAdsEnabled' | 'InterstitialAdsEnabled',
                            e.target.checked
                          )
                        }
                      />
                    </label>
                  ))}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={handleSaveAll}
                    disabled={loading}
                    className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-semibold hover:from-orange-700 hover:to-amber-700 disabled:opacity-50 flex items-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={18} /> : <Save size={18} />}
                    Save Full Ads Settings
                  </button>
                  <button
                    onClick={fetchSettings}
                    disabled={fetching}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={fetching ? 'animate-spin' : ''} size={18} />
                    Refresh
                  </button>
                </div>
              </>
            )}
          </div>

          {!fetching && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {normalizedTaskRules.map((rule) => (
                <div key={rule.TaskType} className="bg-white rounded-2xl shadow-md border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-gray-800">{rule.TaskType}</h3>
                    <span className="text-xs font-semibold px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                      Task Rule
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                    <label className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">Active</span>
                      <input
                        type="checkbox"
                        checked={Boolean(rule.IsActive)}
                        onChange={(e) => updateTaskRule(rule.TaskType, { IsActive: e.target.checked })}
                      />
                    </label>
                    <label className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">Banner</span>
                      <input
                        type="checkbox"
                        checked={Boolean(rule.BannerEnabled)}
                        onChange={(e) => updateTaskRule(rule.TaskType, { BannerEnabled: e.target.checked })}
                      />
                    </label>
                    <label className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">Rewarded</span>
                      <input
                        type="checkbox"
                        checked={Boolean(rule.RewardedEnabled)}
                        onChange={(e) => updateTaskRule(rule.TaskType, { RewardedEnabled: e.target.checked })}
                      />
                    </label>
                    <label className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">Interstitial</span>
                      <input
                        type="checkbox"
                        checked={Boolean(rule.InterstitialEnabled)}
                        onChange={(e) => updateTaskRule(rule.TaskType, { InterstitialEnabled: e.target.checked })}
                      />
                    </label>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Interstitial After Count</label>
                      <input
                        type="number"
                        min="0"
                        value={Number(rule.InterstitialAfterCount || 0)}
                        onChange={(e) =>
                          updateTaskRule(rule.TaskType, { InterstitialAfterCount: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Rewarded After Count</label>
                      <input
                        type="number"
                        min="0"
                        value={Number(rule.RewardedAfterCount || 0)}
                        onChange={(e) => updateTaskRule(rule.TaskType, { RewardedAfterCount: Number(e.target.value) })}
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => handleSaveTask(rule)}
                    disabled={savingTaskType === rule.TaskType}
                    className="w-full px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-semibold hover:bg-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {savingTaskType === rule.TaskType ? (
                      <RefreshCw className="animate-spin" size={16} />
                    ) : (
                      <Save size={16} />
                    )}
                    Save {rule.TaskType} Settings
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdsSettings;
