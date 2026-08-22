import { useState, useEffect } from 'react';
import { Brain, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getTaskControls,
  updateTaskControl,
  normalizeTaskControlsData,
  TASK_CONTROL_TYPE_ORDER,
  type TaskControlType,
  type TaskControl,
  type UpdateTaskControlRequest,
} from '../services/api';

type TaskFormRow = {
  IsActive: boolean;
  AdsEnabled: boolean;
  DailyLimit: string;
  CoinsPerTask: string;
};

const pickDefined = (...vals: unknown[]): unknown =>
  vals.find((v) => v !== undefined);

const controlToForm = (c: TaskControl): TaskFormRow => {
  const r = c as Record<string, unknown>;
  const active = pickDefined(r.IsActive, r.isActive);
  const ads = pickDefined(r.AdsEnabled, r.adsEnabled);
  const daily = pickDefined(r.DailyLimit, r.dailyLimit, r.daily_limit);
  const coins = pickDefined(r.CoinsPerTask, r.coinsPerTask, r.coins_per_task);

  const formatNumLike = (v: unknown): string => {
    if (v === null || v === undefined || v === '') return '';
    if (typeof v === 'number' && Number.isFinite(v)) return String(v);
    const n = Number(v);
    return Number.isFinite(n) ? String(n) : String(v);
  };

  return {
    IsActive: active === undefined ? c.IsActive !== false : Boolean(active),
    AdsEnabled: ads !== undefined ? Boolean(ads) : !!c.AdsEnabled,
    DailyLimit: daily !== undefined && daily !== null && daily !== '' ? formatNumLike(daily) : formatNumLike(c.DailyLimit ?? ''),
    CoinsPerTask:
      coins !== undefined && coins !== null && coins !== '' ? formatNumLike(coins) : formatNumLike(c.CoinsPerTask ?? ''),
  };
};

const buildPayload = (row: TaskFormRow): { ok: true; payload: UpdateTaskControlRequest } | { ok: false; message: string } => {
  const payload: UpdateTaskControlRequest = {
    IsActive: row.IsActive,
    AdsEnabled: row.AdsEnabled,
  };

  if (row.DailyLimit.trim() === '') {
    return { ok: false, message: 'Enter how many quiz attempts each user can make per day (e.g. 20).' };
  }
  const dailyN = Number(row.DailyLimit);
  if (!Number.isFinite(dailyN) || dailyN < 1) {
    return { ok: false, message: 'Daily quiz attempts must be a positive whole number (1 or more).' };
  }
  payload.DailyLimit = Math.floor(dailyN);

  if (row.CoinsPerTask.trim() !== '') {
    const n = Number(row.CoinsPerTask);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, message: 'Coins per task must be a non-negative number.' };
    }
    payload.CoinsPerTask = n;
  }

  return { ok: true, payload };
};

/** Task types shown on this page (others remain in API but are not editable here). */
const UI_VISIBLE_TASKS = ['Quiz'] as const satisfies readonly TaskControlType[];
type VisibleTaskControl = (typeof UI_VISIBLE_TASKS)[number];

const taskIcons: Pick<Record<TaskControlType, typeof Brain>, (typeof UI_VISIBLE_TASKS)[number]> = {
  Quiz: Brain,
};

const taskLabels: Pick<Record<TaskControlType, string>, (typeof UI_VISIBLE_TASKS)[number]> = {
  Quiz: 'Quiz',
};

const cardAccent: Pick<Record<TaskControlType, string>, (typeof UI_VISIBLE_TASKS)[number]> = {
  Quiz: 'from-violet-500/15 to-fuchsia-500/10 border-violet-200',
};

const TaskControlsSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [savingTask, setSavingTask] = useState<TaskControlType | null>(null);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [forms, setForms] = useState<Record<TaskControlType, TaskFormRow>>(() => {
    const empty: TaskFormRow = {
      IsActive: true,
      AdsEnabled: false,
      DailyLimit: '',
      CoinsPerTask: '',
    };
    return TASK_CONTROL_TYPE_ORDER.reduce((acc, k) => {
      acc[k] = { ...empty };
      return acc;
    }, {} as Record<TaskControlType, TaskFormRow>);
  });

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  const load = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await getTaskControls();
      const normalized = normalizeTaskControlsData(res.data);
      setForms(
        TASK_CONTROL_TYPE_ORDER.reduce((acc, key) => {
          acc[key] = controlToForm(normalized[key]);
          return acc;
        }, {} as Record<TaskControlType, TaskFormRow>)
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load task controls');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patchForm = (task: TaskControlType, patch: Partial<TaskFormRow>) => {
    setForms((prev) => ({ ...prev, [task]: { ...prev[task], ...patch } }));
  };

  const handleSave = async (task: VisibleTaskControl) => {
    const row = forms[task];
    const built = buildPayload(row);
    if (!built.ok) {
      setError(built.message);
      return;
    }

    setSavingTask(task);
    setError('');
    setSuccess('');
    try {
      const res = await updateTaskControl(task, built.payload);
      setSuccess(res.message || `${taskLabels[task]} updated`);
      await load();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSavingTask(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-6 sm:p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <Brain className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Quiz controls</h1>
                <p className="text-gray-500 text-sm">
                  Enable/disable quiz, daily attempts, coins per task, and ads — from{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">GET/POST /admin/task-controls/Quiz</code>
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-800 text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-800 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={load}
              disabled={fetching}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={fetching ? 'animate-spin' : ''} size={16} />
              Refresh
            </button>
          </div>

          {fetching ? (
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-200">
              <RefreshCw className="animate-spin text-violet-600 mb-3" size={32} />
              <p className="text-gray-500 text-sm">Loading task controls…</p>
            </div>
          ) : (
            <div className="space-y-6">
              {UI_VISIBLE_TASKS.map((task) => {
                const Icon = taskIcons[task];
                const row = forms[task];

                return (
                  <div
                    key={task}
                    className={`rounded-2xl border bg-gradient-to-br shadow-sm overflow-hidden ${cardAccent[task]}`}
                  >
                    <div className="bg-white/80 backdrop-blur-sm px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-violet-100 text-violet-700">
                          <Icon size={20} />
                        </div>
                        <div>
                          <h2 className="text-lg font-bold text-gray-900">{taskLabels[task]}</h2>
                          <p className="text-xs text-gray-500">
                            Enable/disable quiz, daily attempts, coins per task, ads
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSave(task)}
                        disabled={savingTask !== null}
                        className="px-5 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 flex items-center gap-2 shadow-md"
                      >
                        {savingTask === task ? (
                          <>
                            <RefreshCw className="animate-spin" size={16} />
                            Saving…
                          </>
                        ) : (
                          <>
                            <Save size={16} />
                            Save {taskLabels[task]}
                          </>
                        )}
                      </button>
                    </div>

                    <div className="p-6 bg-white/60 space-y-5">
                      <label className="flex items-center justify-between gap-4 cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">Active</span>
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          checked={row.IsActive}
                          onChange={(e) => patchForm(task, { IsActive: e.target.checked })}
                        />
                      </label>

                      <label className="flex items-center justify-between gap-4 cursor-pointer">
                        <span className="text-sm font-medium text-gray-700">Ads enabled</span>
                        <input
                          type="checkbox"
                          className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                          checked={row.AdsEnabled}
                          onChange={(e) => patchForm(task, { AdsEnabled: e.target.checked })}
                        />
                      </label>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Quiz attempts per user per day</label>
                        <input
                          type="number"
                          min={1}
                          className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                          placeholder="e.g. 20"
                          value={row.DailyLimit}
                          onChange={(e) => patchForm(task, { DailyLimit: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Saved as <code className="bg-gray-100 px-1 rounded">DailyLimit</code> (required). If the API had no
                          limit before, enter the number you want here before saving.
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Coins per task</label>
                        <input
                          type="number"
                          min={0}
                          className="w-full max-w-xs px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                          placeholder="Optional"
                          value={row.CoinsPerTask}
                          onChange={(e) => patchForm(task, { CoinsPerTask: e.target.value })}
                        />
                        <p className="text-xs text-gray-500 mt-1">Leave empty to omit from this save (backend may keep previous value).</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          <div className="mt-8 bg-indigo-50 border border-indigo-100 rounded-xl p-5 text-sm text-indigo-900">
            <p className="font-semibold mb-2">API tips</p>
            <ul className="list-disc list-inside space-y-1 text-indigo-800/90">
              <li>
                Saving always sends your <code className="text-xs bg-white/80 px-1 rounded">DailyLimit</code> as the number above (e.g.{' '}
                <code className="text-xs bg-white/80 px-1 rounded">{'{ "IsActive": true, "DailyLimit": 20 }'}</code>).
              </li>
              <li>Disable quiz without changing attempts: turn off Active and save (limit field must still have a valid number).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskControlsSettings;
