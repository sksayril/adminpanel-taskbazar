import { useState, useEffect } from 'react';
import { Share2, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getSocialLinks, updateSocialLinks, type SocialLinksUpdateRequest } from '../services/api';

const isValidHttpUrl = (s: string): boolean => {
  const t = s.trim();
  if (!t) return true;
  try {
    const u = new URL(t);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch {
    return false;
  }
};

const SocialLinksSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const [telegram, setTelegram] = useState('');
  const [youtube, setYoutube] = useState('');
  const [instagram, setInstagram] = useState('');
  const [isActive, setIsActive] = useState(true);

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  const fetchSettings = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setFetching(true);
      setError('');
    }
    try {
      const res = await getSocialLinks();
      const d = res.data;
      setTelegram(d.TelegramLink ?? '');
      setYoutube(d.YouTubeLink ?? '');
      setInstagram(d.InstagramLink ?? '');
      setIsActive(d.IsActive !== false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load social links');
    } finally {
      if (!opts?.silent) setFetching(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    const t = telegram.trim();
    const y = youtube.trim();
    const i = instagram.trim();

    if (!isValidHttpUrl(t) || !isValidHttpUrl(y) || !isValidHttpUrl(i)) {
      setError('Each link must be empty (to clear) or a valid http/https URL.');
      setLoading(false);
      return;
    }

    const payload: SocialLinksUpdateRequest = {
      TelegramLink: t === '' ? null : t,
      YouTubeLink: y === '' ? null : y,
      InstagramLink: i === '' ? null : i,
      IsActive: isActive,
    };

    try {
      const res = await updateSocialLinks(payload);
      setSuccess(res.message || 'Social links updated');
      await fetchSettings({ silent: true });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update social links');
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
              <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Share2 className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Social media links</h1>
                <p className="text-gray-500 text-sm">
                  GET/PUT <code className="text-xs bg-gray-100 px-1 rounded">/admin/social-links</code> — leave a field
                  blank to clear it; when inactive, the app API hides links.
                </p>
              </div>
            </div>
          </div>

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
              <CheckCircle2 className="text-green-600 flex-shrink-0" size={20} />
              <p className="text-green-700 text-sm font-medium">{success}</p>
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-indigo-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading…</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <label className="flex items-center justify-between gap-4 cursor-pointer border-b border-gray-100 pb-6">
                  <span className="text-sm font-semibold text-gray-700">Show links in app (IsActive)</span>
                  <input
                    type="checkbox"
                    className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                  />
                </label>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Telegram</label>
                  <input
                    type="url"
                    value={telegram}
                    onChange={(e) => setTelegram(e.target.value)}
                    placeholder="https://t.me/example"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={youtube}
                    onChange={(e) => setYoutube(e.target.value)}
                    placeholder="https://www.youtube.com/@example"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    placeholder="https://www.instagram.com/example"
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                  />
                </div>

                <p className="text-xs text-gray-500">
                  Empty field sends <code className="bg-gray-50 px-1 rounded">null</code> to clear that link. URLs must use{' '}
                  <code className="bg-gray-50 px-1 rounded">http:</code> or <code className="bg-gray-50 px-1 rounded">https:</code>.
                </p>

                <div className="flex gap-4 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-sky-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-indigo-700 hover:to-sky-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <RefreshCw className="animate-spin" size={20} /> : <Save size={20} />}
                    {loading ? 'Saving…' : 'Save'}
                  </button>
                  <button
                    type="button"
                    onClick={fetchSettings}
                    disabled={fetching}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={fetching ? 'animate-spin' : ''} size={20} />
                    Refresh
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialLinksSettings;
