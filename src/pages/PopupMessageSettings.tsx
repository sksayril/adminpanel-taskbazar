import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Save, RefreshCw, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getPopupTemplate, putPopupTemplate, type PopupTemplate, type PopupTemplateJsonBody } from '../services/api';

const emptyForm = {
  Title: '',
  Description: '',
  IsActive: true,
};

/** Prefer saved Description; if empty/absent, show legacy Body until an admin saves Description. */
const mergedPopupDescription = (data: PopupTemplate): string => {
  const d = data.Description;
  const legacy =
    typeof data.Body === 'string' ? data.Body : '';
  if (d !== undefined && d !== null && String(d).trim() !== '') {
    return String(d);
  }
  return legacy;
};

const PopupMessageSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [fetching, setFetching] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [loadNote, setLoadNote] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  const applyData = useCallback((data: PopupTemplate | null, note?: string) => {
    setLoadNote(note?.trim() || null);

    if (!data) {
      setForm(emptyForm);
      return;
    }

    setForm({
      Title: data.Title ?? '',
      Description: mergedPopupDescription(data),
      IsActive: data.IsActive !== false,
    });
  }, []);

  const load = async () => {
    setFetching(true);
    setError('');
    try {
      const res = await getPopupTemplate();
      applyData(res.data ?? null, res.note);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load popup template');
      applyData(null);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const patchForm = (patch: Partial<typeof form>) => setForm((prev) => ({ ...prev, ...patch }));

  const buildSaveBody = (): PopupTemplateJsonBody => ({
    Title: form.Title,
    Description: form.Description,
    IsActive: form.IsActive,
  });

  const handleSave = async () => {
    setError('');
    setSuccess('');

    setSaving(true);
    try {
      const body = buildSaveBody();
      const res = await putPopupTemplate(body);
      setSuccess(res.message || 'Saved');
      applyData(res.data ?? null, res.note);
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-6 sm:p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg">
                <MessageSquare className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Popup message</h1>
                <p className="text-gray-500 text-sm">
                  Edit title, description, and active state —{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">GET /admin/popup-template</code>,{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">POST</code> /{' '}
                  <code className="text-xs bg-gray-100 px-1 rounded">PUT</code> (JSON; save uses PUT)
                </p>
              </div>
            </div>
          </div>

          {loadNote && !fetching && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-blue-900 text-sm font-medium">{loadNote}</p>
            </div>
          )}

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
              <p className="text-gray-500 text-sm">Loading popup template…</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-8 space-y-6">
                <label className="flex items-center justify-between gap-4 cursor-pointer">
                  <span className="text-sm font-medium text-gray-700">Popup active</span>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                    checked={form.IsActive}
                    onChange={(e) => patchForm({ IsActive: e.target.checked })}
                  />
                </label>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                  <input
                    type="text"
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="e.g. New offer"
                    value={form.Title}
                    onChange={(e) => patchForm({ Title: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500"
                    placeholder="Short message shown in the popup"
                    value={form.Description}
                    onChange={(e) => patchForm({ Description: e.target.value })}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Saved as <code className="bg-gray-100 px-1 rounded">Description</code>. If the API only had legacy{' '}
                    <code className="bg-gray-100 px-1 rounded">Body</code>, it is shown here until you save.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-fuchsia-700 disabled:opacity-50 flex items-center gap-2 shadow-md"
                  >
                    {saving ? (
                      <>
                        <RefreshCw className="animate-spin" size={16} />
                        Saving…
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save (PUT)
                      </>
                    )}
                  </button>
                  <span className="text-xs text-gray-500">
                    PUT creates the template if missing, otherwise merges the fields shown here (Title, Description, IsActive).
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 bg-violet-50 border border-violet-100 rounded-xl p-5 text-sm text-violet-950">
            <p className="font-semibold mb-2">API behaviour</p>
            <ul className="list-disc list-inside space-y-1 text-violet-900/90">
              <li>
                GET returns <code className="text-xs bg-white/80 px-1 rounded">Description</code> (merged with legacy{' '}
                <code className="text-xs bg-white/80 px-1 rounded">Body</code> for display until you save{' '}
                <code className="text-xs bg-white/80 px-1 rounded">Description</code>).
              </li>
              <li>
                POST/PUT use JSON: <code className="text-xs bg-white/80 px-1 rounded">Title</code>,{' '}
                <code className="text-xs bg-white/80 px-1 rounded">Description</code>,{' '}
                <code className="text-xs bg-white/80 px-1 rounded">IsActive</code>. Legacy image/action keys are ignored.
              </li>
              <li>PUT creates the document if missing, otherwise merges the fields you send.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopupMessageSettings;
