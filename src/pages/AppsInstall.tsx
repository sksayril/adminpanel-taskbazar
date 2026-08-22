import { useState, useEffect } from 'react';
import { Smartphone, Plus, Edit, Trash2, Eye, CheckCircle2, XCircle, Clock, Filter, Search, X, Save, AlertCircle, Image as ImageIcon } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getApps,
  createApp,
  updateApp,
  deleteApp,
  getAppById,
  getAppSubmissions,
  updateSubmissionStatus,
  deleteAppSubmission,
  App,
  AppSubmission,
  CreateAppRequest,
  UpdateAppRequest,
} from '../services/api';

type TabType = 'apps' | 'submissions';

const AppsInstall = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('apps');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  // Apps state
  const [apps, setApps] = useState<App[]>([]);
  const [appFilters, setAppFilters] = useState({ status: '', difficulty: '', sortBy: '' });
  const [showAppModal, setShowAppModal] = useState(false);
  const [editingApp, setEditingApp] = useState<App | null>(null);
  const [appForm, setAppForm] = useState<CreateAppRequest>({
    AppName: '',
    AppImage: '',
    AppDownloadUrl: '',
    RewardCoins: 0,
    Difficulty: 'Medium',
    Status: 'Active',
    Description: '',
  });

  // Submissions state
  const [submissions, setSubmissions] = useState<AppSubmission[]>([]);
  const [submissionStats, setSubmissionStats] = useState({
    totalSubmissions: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });
  const [submissionFilters, setSubmissionFilters] = useState({ status: '', appId: '', userId: '', sortBy: '' });
  const [selectedSubmission, setSelectedSubmission] = useState<AppSubmission | null>(null);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [showActionModal, setShowActionModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);
  const [bulkProcessing, setBulkProcessing] = useState(false);
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    if (activeTab === 'apps') {
      fetchApps();
    } else {
      fetchSubmissions();
    }
  }, [activeTab, appFilters, submissionFilters]);

  const fetchApps = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {};
      if (appFilters.status) params.status = appFilters.status;
      if (appFilters.difficulty) params.difficulty = appFilters.difficulty;
      if (appFilters.sortBy) params.sortBy = appFilters.sortBy;

      const response = await getApps(params);
      setApps(response.data.apps);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load apps');
    } finally {
      setLoading(false);
    }
  };

  const fetchSubmissions = async (opts?: { silent?: boolean }) => {
    if (!opts?.silent) {
      setLoading(true);
      setError('');
    }
    try {
      const params: any = {};
      if (submissionFilters.status) params.status = submissionFilters.status;
      if (submissionFilters.appId) params.appId = submissionFilters.appId;
      if (submissionFilters.userId) params.userId = submissionFilters.userId;
      if (submissionFilters.sortBy) params.sortBy = submissionFilters.sortBy;

      const response = await getAppSubmissions(params);
      setSubmissions(response.data.submissions);
      if (!opts?.silent) setSelectedSubmissionIds([]);
      setSubmissionStats({
        totalSubmissions: response.data.totalSubmissions,
        pendingCount: response.data.pendingCount,
        approvedCount: response.data.approvedCount,
        rejectedCount: response.data.rejectedCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load submissions');
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  };

  const toggleSubmissionSelection = (submissionId: string) => {
    setSelectedSubmissionIds((prev) =>
      prev.includes(submissionId) ? prev.filter((id) => id !== submissionId) : [...prev, submissionId]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = submissions.map((submission) => submission.submissionId);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedSubmissionIds.includes(id));
    setSelectedSubmissionIds(allSelected ? [] : visibleIds);
  };

  const handleBulkSubmissionAction = async (status: 'Approved' | 'Rejected') => {
    if (selectedSubmissionIds.length === 0) {
      setError('Please select at least one submission');
      return;
    }
    if (status === 'Rejected' && !adminNotes.trim()) {
      setError('Please enter admin notes for bulk reject');
      return;
    }

    const pendingIds = submissions
      .filter((s) => selectedSubmissionIds.includes(s.submissionId) && s.status === 'Pending')
      .map((s) => s.submissionId);

    if (pendingIds.length === 0) {
      setError('Select at least one Pending submission');
      return;
    }

    setBulkProcessing(true);
    setError('');
    setSuccess('');
    setBulkProgress({ done: 0, total: pendingIds.length });

    const notes = adminNotes.trim() || undefined;
    let succeeded = 0;
    let failed = 0;
    const failMessages: string[] = [];

    for (let i = 0; i < pendingIds.length; i++) {
      const id = pendingIds[i];
      try {
        await updateSubmissionStatus(id, { status, adminNotes: notes });
        succeeded++;
      } catch (err) {
        failed++;
        failMessages.push(err instanceof Error ? err.message : 'Request failed');
      }
      setBulkProgress({ done: i + 1, total: pendingIds.length });
    }

    setBulkProcessing(false);
    setBulkProgress(null);
    setAdminNotes('');
    setSelectedSubmissionIds([]);
    await fetchSubmissions({ silent: true });

    if (failed === 0) {
      setSuccess(`${succeeded} submission(s) ${status === 'Approved' ? 'approved' : 'rejected'} successfully`);
    } else {
      setSuccess(`${succeeded} succeeded, ${failed} failed`);
      setError(failMessages.slice(0, 3).join(' · ') + (failMessages.length > 3 ? '…' : ''));
    }
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 6000);
  };

  const handleDeleteSubmission = async (submission: AppSubmission) => {
    const isApproved = submission.status === 'Approved';
    const proceed = confirm(
      isApproved
        ? 'This submission is approved. Delete it with reward revert?'
        : 'Are you sure you want to delete this submission?'
    );
    if (!proceed) return;

    setLoading(true);
    setError('');
    try {
      await deleteAppSubmission(submission.submissionId, {
        allowApprovedDelete: isApproved ? true : undefined,
        revertReward: isApproved ? true : undefined,
      });
      setSuccess('Submission deleted successfully');
      fetchSubmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete submission');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApp = async () => {
    setLoading(true);
    setError('');
    try {
      await createApp(appForm);
      setSuccess('App created successfully');
      setShowAppModal(false);
      resetAppForm();
      fetchApps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create app');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateApp = async () => {
    if (!editingApp) return;
    setLoading(true);
    setError('');
    try {
      const updateData: UpdateAppRequest = {
        AppName: appForm.AppName,
        AppImage: appForm.AppImage,
        AppDownloadUrl: appForm.AppDownloadUrl,
        RewardCoins: appForm.RewardCoins,
        Difficulty: appForm.Difficulty,
        Status: appForm.Status,
        Description: appForm.Description,
      };
      await updateApp(editingApp.appId || editingApp._id || '', updateData);
      setSuccess('App updated successfully');
      setShowAppModal(false);
      setEditingApp(null);
      resetAppForm();
      fetchApps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update app');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteApp = async (appId: string) => {
    if (!confirm('Are you sure you want to delete this app?')) return;
    setLoading(true);
    setError('');
    try {
      await deleteApp(appId);
      setSuccess('App deleted successfully');
      fetchApps();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete app');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApp = async (app: App) => {
    setEditingApp(app);
    setAppForm({
      AppName: app.appName || app.AppName || '',
      AppImage: app.appImage || app.AppImage || '',
      AppDownloadUrl: app.appDownloadUrl || app.AppDownloadUrl || '',
      RewardCoins: app.rewardCoins || app.RewardCoins || 0,
      Difficulty: (app.difficulty || app.Difficulty || 'Medium') as any,
      Status: (app.status || app.Status || 'Active') as any,
      Description: app.description || app.Description || '',
    });
    setShowAppModal(true);
  };

  const handleSubmissionAction = async () => {
    if (!selectedSubmission || !actionType) return;
    setLoading(true);
    setError('');
    try {
      await updateSubmissionStatus(selectedSubmission.submissionId, {
        status: actionType === 'approve' ? 'Approved' : 'Rejected',
        adminNotes: adminNotes || undefined,
      });
      setSuccess(`Submission ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowActionModal(false);
      setSelectedSubmission(null);
      setAdminNotes('');
      setActionType(null);
      fetchSubmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission');
    } finally {
      setLoading(false);
    }
  };

  const resetAppForm = () => {
    setAppForm({
      AppName: '',
      AppImage: '',
      AppDownloadUrl: '',
      RewardCoins: 0,
      Difficulty: 'Medium',
      Status: 'Active',
      Description: '',
    });
  };

  const openActionModal = (submission: AppSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setActionType(action);
    setAdminNotes('');
    setShowActionModal(true);
  };

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'Active':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Inactive':
        return `${baseClasses} bg-gray-100 text-gray-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getDifficultyBadge = (difficulty: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-semibold';
    switch (difficulty) {
      case 'Easiest':
        return `${baseClasses} bg-green-100 text-green-700`;
      case 'Easy':
        return `${baseClasses} bg-blue-100 text-blue-700`;
      case 'Medium':
        return `${baseClasses} bg-yellow-100 text-yellow-700`;
      case 'Hard':
        return `${baseClasses} bg-red-100 text-red-700`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-700`;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Smartphone className="text-white" size={24} />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">Apps Installation</h1>
                  <p className="text-gray-500 text-sm">Manage apps and review installation submissions</p>
                </div>
              </div>
              {activeTab === 'apps' && (
                <button
                  onClick={() => {
                    setEditingApp(null);
                    resetAppForm();
                    setShowAppModal(true);
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg flex items-center gap-2"
                >
                  <Plus size={20} />
                  Create App
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6 bg-white rounded-xl p-2 shadow-md border border-gray-200">
            <button
              onClick={() => setActiveTab('apps')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'apps'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Apps Management
            </button>
            <button
              onClick={() => setActiveTab('submissions')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'submissions'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              Submissions ({submissionStats.pendingCount} Pending)
            </button>
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

          {/* Apps Tab */}
          {activeTab === 'apps' && (
            <>
              {/* Filters */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={appFilters.status}
                    onChange={(e) => setAppFilters({ ...appFilters, status: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <select
                    value={appFilters.difficulty}
                    onChange={(e) => setAppFilters({ ...appFilters, difficulty: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Difficulty</option>
                    <option value="Easiest">Easiest</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                  <select
                    value={appFilters.sortBy}
                    onChange={(e) => setAppFilters({ ...appFilters, sortBy: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Sort By</option>
                    <option value="reward">Highest Reward</option>
                  </select>
                  <button
                    onClick={() => setAppFilters({ status: '', difficulty: '', sortBy: '' })}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Apps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                  <div className="col-span-full text-center p-12">
                    <Clock className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Loading apps...</p>
                  </div>
                ) : apps.length === 0 ? (
                  <div className="col-span-full text-center p-12">
                    <Smartphone className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-500">No apps found</p>
                  </div>
                ) : (
                  apps.map((app) => (
                    <div key={app.appId || app._id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                      <div className="relative h-48 bg-gradient-to-br from-purple-100 to-pink-100">
                        {app.appImage || app.AppImage ? (
                          <img
                            src={app.appImage || app.AppImage}
                            alt={app.appName || app.AppName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ImageIcon className="text-purple-300" size={64} />
                          </div>
                        )}
                        <div className="absolute top-4 right-4 flex gap-2">
                          <span className={getStatusBadge(app.status || app.Status || 'Active')}>
                            {app.status || app.Status}
                          </span>
                          <span className={getDifficultyBadge(app.difficulty || app.Difficulty || 'Medium')}>
                            {app.difficulty || app.Difficulty}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-2">{app.appName || app.AppName}</h3>
                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                          {app.description || app.Description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <p className="text-xs text-gray-500">Reward</p>
                            <p className="text-xl font-bold text-purple-600">
                              {app.rewardCoins || app.RewardCoins || 0} Coins
                            </p>
                          </div>
                          {app.statistics && (
                            <div className="text-right">
                              <p className="text-xs text-gray-500">Submissions</p>
                              <p className="text-sm font-semibold text-gray-800">
                                {app.statistics.totalSubmissions}
                              </p>
                            </div>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditApp(app)}
                            className="flex-1 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg font-semibold hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                          >
                            <Edit size={16} />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteApp(app.appId || app._id || '')}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-semibold hover:bg-red-100 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* Submissions Tab */}
          {activeTab === 'submissions' && (
            <>
              {/* Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Total</p>
                      <p className="text-2xl font-bold text-gray-800">{submissionStats.totalSubmissions}</p>
                    </div>
                    <Smartphone className="text-purple-500" size={32} />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Pending</p>
                      <p className="text-2xl font-bold text-yellow-600">{submissionStats.pendingCount}</p>
                    </div>
                    <Clock className="text-yellow-500" size={32} />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Approved</p>
                      <p className="text-2xl font-bold text-green-600">{submissionStats.approvedCount}</p>
                    </div>
                    <CheckCircle2 className="text-green-500" size={32} />
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Rejected</p>
                      <p className="text-2xl font-bold text-red-600">{submissionStats.rejectedCount}</p>
                    </div>
                    <XCircle className="text-red-500" size={32} />
                  </div>
                </div>
              </div>

              {/* Filters */}
              <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <select
                    value={submissionFilters.status}
                    onChange={(e) => setSubmissionFilters({ ...submissionFilters, status: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Approved">Approved</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Filter by App ID"
                    value={submissionFilters.appId}
                    onChange={(e) => setSubmissionFilters({ ...submissionFilters, appId: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <input
                    type="text"
                    placeholder="Filter by User ID"
                    value={submissionFilters.userId}
                    onChange={(e) => setSubmissionFilters({ ...submissionFilters, userId: e.target.value })}
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <button
                    onClick={() => setSubmissionFilters({ status: '', appId: '', userId: '', sortBy: '' })}
                    className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>

              {/* Bulk actions — sequential one API call per submission */}
              <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 flex flex-col gap-3">
                <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-3">
                  <p className="text-sm text-gray-600 shrink-0">
                    Selected: <span className="font-semibold">{selectedSubmissionIds.length}</span>
                    <span className="text-gray-400"> (pending only)</span>
                  </p>
                  <input
                    type="text"
                    placeholder="Notes — optional for approve, required for reject"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    disabled={bulkProcessing}
                    className="flex-1 min-w-[200px] px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleBulkSubmissionAction('Approved')}
                    disabled={bulkProcessing || loading || selectedSubmissionIds.length === 0}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
                  >
                    {bulkProcessing ? 'Processing…' : 'Bulk Approve'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleBulkSubmissionAction('Rejected')}
                    disabled={bulkProcessing || loading || selectedSubmissionIds.length === 0}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
                  >
                    {bulkProcessing ? 'Processing…' : 'Bulk Reject'}
                  </button>
                </div>
                {bulkProgress && (
                  <p className="text-xs text-purple-700 font-medium">
                    Sending… {bulkProgress.done} / {bulkProgress.total}
                  </p>
                )}
                <p className="text-xs text-gray-500">
                  Bulk actions call the server once per selected row in order (one by one), only for Pending submissions.
                </p>
              </div>

              {/* Submissions Table */}
              <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                {loading ? (
                  <div className="p-12 text-center">
                    <Clock className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                    <p className="text-gray-500">Loading submissions...</p>
                  </div>
                ) : submissions.length === 0 ? (
                  <div className="p-12 text-center">
                    <Smartphone className="text-gray-300 mx-auto mb-4" size={48} />
                    <p className="text-gray-500">No submissions found</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                            <input
                              type="checkbox"
                              disabled={bulkProcessing}
                              checked={
                                submissions.length > 0 &&
                                submissions.every((submission) => selectedSubmissionIds.includes(submission.submissionId))
                              }
                              onChange={toggleSelectAllVisible}
                            />
                          </th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">App</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Reward</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Date</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map((submission) => (
                          <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <input
                                type="checkbox"
                                disabled={bulkProcessing}
                                checked={selectedSubmissionIds.includes(submission.submissionId)}
                                onChange={() => toggleSubmissionSelection(submission.submissionId)}
                              />
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={submission.appImage}
                                  alt={submission.appName}
                                  className="w-12 h-12 rounded-lg object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E';
                                  }}
                                />
                                <div>
                                  <div className="font-medium text-gray-900">{submission.appName}</div>
                                  <div className="text-xs text-gray-500">{submission.appDifficulty}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm">
                                <div className="font-medium text-gray-900">{submission.userMobileNumber}</div>
                                <div className="text-xs text-gray-500">{submission.userReferCode}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-semibold text-purple-600">
                                {submission.appRewardCoins} Coins
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className={getStatusBadge(submission.status)}>{submission.status}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-500">{formatDate(submission.createdAt)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setSelectedSubmission(submission);
                                    setShowSubmissionModal(true);
                                  }}
                                  className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                  title="View Details"
                                >
                                  <Eye size={16} />
                                </button>
                                {submission.status === 'Pending' && (
                                  <>
                                    <button
                                      onClick={() => openActionModal(submission, 'approve')}
                                      className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => openActionModal(submission, 'reject')}
                                      className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-semibold"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                <button
                                  onClick={() => handleDeleteSubmission(submission)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                  title="Delete Submission"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Create/Edit App Modal */}
      {showAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800">
                {editingApp ? 'Edit App' : 'Create New App'}
              </h3>
              <button
                onClick={() => {
                  setShowAppModal(false);
                  setEditingApp(null);
                  resetAppForm();
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editingApp ? handleUpdateApp() : handleCreateApp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">App Name *</label>
                <input
                  type="text"
                  value={appForm.AppName}
                  onChange={(e) => setAppForm({ ...appForm, AppName: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">App Image URL *</label>
                <input
                  type="url"
                  value={appForm.AppImage}
                  onChange={(e) => setAppForm({ ...appForm, AppImage: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Download URL *</label>
                <input
                  type="url"
                  value={appForm.AppDownloadUrl}
                  onChange={(e) => setAppForm({ ...appForm, AppDownloadUrl: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Coins *</label>
                  <input
                    type="number"
                    value={appForm.RewardCoins}
                    onChange={(e) => setAppForm({ ...appForm, RewardCoins: Number(e.target.value) })}
                    min="0"
                    required
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                  <select
                    value={appForm.Difficulty}
                    onChange={(e) => setAppForm({ ...appForm, Difficulty: e.target.value as any })}
                    className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                  >
                    <option value="Easiest">Easiest</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={appForm.Status}
                  onChange={(e) => setAppForm({ ...appForm, Status: e.target.value as any })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  value={appForm.Description}
                  onChange={(e) => setAppForm({ ...appForm, Description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAppModal(false);
                    setEditingApp(null);
                    resetAppForm();
                  }}
                  className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Clock className="animate-spin" size={20} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={20} />
                      {editingApp ? 'Update App' : 'Create App'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Submission Details Modal */}
      {showSubmissionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="text-purple-600" size={24} />
                Submission Details
              </h3>
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  setSelectedSubmission(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* App Information */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">App Information</h4>
                <div className="flex items-center gap-4">
                  <img
                    src={selectedSubmission.appImage}
                    alt={selectedSubmission.appName}
                    className="w-20 h-20 rounded-xl object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E';
                    }}
                  />
                  <div>
                    <h5 className="text-xl font-bold text-gray-800">{selectedSubmission.appName}</h5>
                    <p className="text-sm text-gray-600">Reward: {selectedSubmission.appRewardCoins} Coins</p>
                    <span className={getDifficultyBadge(selectedSubmission.appDifficulty)}>
                      {selectedSubmission.appDifficulty}
                    </span>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">User Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mobile Number</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedSubmission.userMobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Refer Code</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedSubmission.userReferCode}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedSubmission.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Device ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedSubmission.userDeviceId}</p>
                  </div>
                </div>
              </div>

              {/* Screenshot */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Screenshot</h4>
                <img
                  src={selectedSubmission.screenshotUrl}
                  alt="Submission screenshot"
                  className="w-full rounded-xl border border-gray-200"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 24 24"%3E%3Cpath fill="%23999" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/%3E%3C/svg%3E';
                  }}
                />
              </div>

              {/* Status and Notes */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={getStatusBadge(selectedSubmission.status)}>
                      {selectedSubmission.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submitted At</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedSubmission.createdAt)}</p>
                  </div>
                  {selectedSubmission.adminNotes && (
                    <div className="col-span-2">
                      <p className="text-sm text-gray-600 mb-1">Admin Notes</p>
                      <p className="text-sm text-gray-900">{selectedSubmission.adminNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      openActionModal(selectedSubmission, 'approve');
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-colors"
                  >
                    Approve Submission
                  </button>
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      openActionModal(selectedSubmission, 'reject');
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-colors"
                  >
                    Reject Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approve/Reject Modal */}
      {showActionModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Submission
            </h3>

            <div className="bg-gray-50 rounded-xl p-4 mb-4">
              <div className="text-sm space-y-2">
                <div>
                  <span className="text-gray-600">App:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedSubmission.appName}</span>
                </div>
                <div>
                  <span className="text-gray-600">User:</span>
                  <span className="ml-2 font-semibold text-gray-900">{selectedSubmission.userMobileNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Reward:</span>
                  <span className="ml-2 font-semibold text-purple-600">
                    {selectedSubmission.appRewardCoins} Coins
                  </span>
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes {actionType === 'reject' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'Optional notes...' : 'Please provide reason for rejection...'}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200"
                required={actionType === 'reject'}
              />
            </div>

            {actionType === 'approve' && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-green-800">
                    <p className="font-semibold mb-1">Note:</p>
                    <p>
                      Approving this submission will automatically add {selectedSubmission.appRewardCoins} coins to the user's wallet.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowActionModal(false);
                  setSelectedSubmission(null);
                  setAdminNotes('');
                  setActionType(null);
                }}
                className="flex-1 px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmissionAction}
                disabled={loading || (actionType === 'reject' && !adminNotes.trim())}
                className={`flex-1 px-6 py-2 rounded-lg font-medium transition-colors ${
                  actionType === 'approve'
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading ? 'Processing...' : actionType === 'approve' ? 'Approve' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppsInstall;
