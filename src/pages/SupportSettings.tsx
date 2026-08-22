import { useState, useEffect } from 'react';
import {
  Headphones,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Mail,
  Phone,
  MessageCircle,
  Globe,
  Info,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getSupportLink,
  setSupportLink,
  updateSupportLink,
  CreateSupportLinkRequest,
  UpdateSupportLinkRequest,
} from '../services/api';

const SupportSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  const [formData, setFormData] = useState<CreateSupportLinkRequest>({
    SupportLink: '',
    SupportEmail: null,
    SupportPhone: null,
    SupportWhatsApp: null,
    IsActive: true,
    Description: null,
  });

  const [hasExistingSettings, setHasExistingSettings] = useState(false);

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
      const response = await getSupportLink();
      if (response.data) {
        setFormData({
          SupportLink: response.data.SupportLink || '',
          SupportEmail: response.data.SupportEmail || null,
          SupportPhone: response.data.SupportPhone || null,
          SupportWhatsApp: response.data.SupportWhatsApp || null,
          IsActive: response.data.IsActive !== undefined ? response.data.IsActive : true,
          Description: response.data.Description || null,
        });
        setHasExistingSettings(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load settings');
    } finally {
      setFetching(false);
    }
  };

  const validateURL = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!formData.SupportLink.trim()) {
      setError('Support Link is required');
      setLoading(false);
      return;
    }

    if (!validateURL(formData.SupportLink)) {
      setError('Support Link must be a valid URL');
      setLoading(false);
      return;
    }

    if (formData.SupportEmail && formData.SupportEmail.trim() && !validateEmail(formData.SupportEmail)) {
      setError('Support Email must be a valid email address');
      setLoading(false);
      return;
    }

    try {
      let response;
      if (hasExistingSettings) {
        // Update existing settings
        const updateData: UpdateSupportLinkRequest = {
          SupportLink: formData.SupportLink,
          SupportEmail: formData.SupportEmail || null,
          SupportPhone: formData.SupportPhone || null,
          SupportWhatsApp: formData.SupportWhatsApp || null,
          IsActive: formData.IsActive,
          Description: formData.Description || null,
        };
        response = await updateSupportLink(updateData);
      } else {
        // Create new settings
        response = await setSupportLink(formData);
        setHasExistingSettings(true);
      }
      setSuccess(response.message || 'Settings updated successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : value === ''
          ? null
          : value,
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
                <Headphones className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Support Settings</h1>
                <p className="text-gray-500 text-sm">Configure support contact information and links</p>
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
                <RefreshCw className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading settings...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8">
                {/* Support Link */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <ExternalLink className="text-blue-600" size={18} />
                    Support Link *
                  </label>
                  <div className="relative">
                    <input
                      type="url"
                      name="SupportLink"
                      value={formData.SupportLink}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                      placeholder="https://support.example.com"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Globe className="text-gray-400" size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Support website URL (required, must be a valid URL)</p>
                </div>

                {/* Support Email */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Mail className="text-blue-600" size={18} />
                    Support Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="SupportEmail"
                      value={formData.SupportEmail || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                      placeholder="support@example.com"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Mail className="text-gray-400" size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Support email address (optional, must be valid email if provided)</p>
                </div>

                {/* Support Phone */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Phone className="text-blue-600" size={18} />
                    Support Phone
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="SupportPhone"
                      value={formData.SupportPhone || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                      placeholder="+1234567890"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <Phone className="text-gray-400" size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Support phone number (optional)</p>
                </div>

                {/* Support WhatsApp */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <MessageCircle className="text-blue-600" size={18} />
                    Support WhatsApp
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      name="SupportWhatsApp"
                      value={formData.SupportWhatsApp || ''}
                      onChange={handleChange}
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800"
                      placeholder="+1234567890"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      <MessageCircle className="text-gray-400" size={18} />
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-500">Support WhatsApp number (optional)</p>
                </div>

                {/* Description */}
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <Info className="text-blue-600" size={18} />
                    Description
                  </label>
                  <textarea
                    name="Description"
                    value={formData.Description || ''}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all text-gray-800 resize-none"
                    placeholder="Contact us for any assistance..."
                  />
                  <p className="mt-2 text-xs text-gray-500">Description or instructions for users (optional)</p>
                </div>

                {/* Is Active */}
                <div className="mb-8">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="IsActive"
                      checked={formData.IsActive}
                      onChange={handleChange}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <span className="text-sm font-semibold text-gray-700">Is Active</span>
                      <p className="text-xs text-gray-500">Enable or disable support availability</p>
                    </div>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-6 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-blue-700 hover:to-cyan-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <RefreshCw className="animate-spin" size={20} />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save size={20} />
                        {hasExistingSettings ? 'Update Settings' : 'Save Settings'}
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
              <Info className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">About Support Settings</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Support Link is required and must be a valid URL</li>
                  <li>• Support Email, Phone, and WhatsApp are optional</li>
                  <li>• If IsActive is false, users will see that support is unavailable</li>
                  <li>• Only one support link settings document exists in the system</li>
                  <li>• Changes take effect immediately after saving</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Preview Card */}
          {formData.SupportLink && (
            <div className="mt-6 bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-6">
              <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <Headphones className="text-blue-600" size={20} />
                Support Information Preview
              </h3>
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-gray-500 mb-1">Support Link</div>
                  <a
                    href={formData.SupportLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                  >
                    <ExternalLink size={16} />
                    {formData.SupportLink}
                  </a>
                </div>
                {formData.SupportEmail && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Support Email</div>
                    <a
                      href={`mailto:${formData.SupportEmail}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Mail size={16} />
                      {formData.SupportEmail}
                    </a>
                  </div>
                )}
                {formData.SupportPhone && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Support Phone</div>
                    <a
                      href={`tel:${formData.SupportPhone}`}
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <Phone size={16} />
                      {formData.SupportPhone}
                    </a>
                  </div>
                )}
                {formData.SupportWhatsApp && (
                  <div className="bg-white rounded-lg p-4 border border-blue-200">
                    <div className="text-xs text-gray-500 mb-1">Support WhatsApp</div>
                    <a
                      href={`https://wa.me/${formData.SupportWhatsApp.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-2"
                    >
                      <MessageCircle size={16} />
                      {formData.SupportWhatsApp}
                    </a>
                  </div>
                )}
                <div className="bg-white rounded-lg p-4 border border-blue-200">
                  <div className="text-xs text-gray-500 mb-1">Status</div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      formData.IsActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {formData.IsActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportSettings;
