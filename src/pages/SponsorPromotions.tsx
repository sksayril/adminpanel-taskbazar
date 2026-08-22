import { useState, useEffect } from 'react';
import {
  Megaphone,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  AlertCircle,
  Eye,
  X,
  RefreshCw,
  User,
  Mail,
  Phone,
  Smartphone,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getSponsorPromotions,
  updateSponsorPromotionStatus,
  SponsorPromotionSubmission,
  UpdateSponsorPromotionStatusRequest,
} from '../services/api';

const SponsorPromotions = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);
  const [selectedSubmission, setSelectedSubmission] = useState<SponsorPromotionSubmission | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  const [submissions, setSubmissions] = useState<SponsorPromotionSubmission[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalSubmissions: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    fetchSubmissions();
  }, [statusFilter, currentPage, searchTerm]);

  const fetchSubmissions = async () => {
    setFetching(true);
    setError('');
    try {
      const params: any = {
        page: currentPage,
        limit: limit,
      };
      if (statusFilter !== 'All') {
        params.status = statusFilter;
      }
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await getSponsorPromotions(params);
      setSubmissions(response.data.submissions);
      setPagination(response.data.pagination);
      setStats(response.data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sponsor promotions');
    } finally {
      setFetching(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedSubmission || !actionType) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: UpdateSponsorPromotionStatusRequest = {
        status: actionType === 'approve' ? 'Approved' : 'Rejected',
        adminNotes: adminNotes || undefined,
      };

      await updateSponsorPromotionStatus(selectedSubmission.submissionId, updateData);
      setSuccess(`Submission ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedSubmission(null);
      setAdminNotes('');
      setActionType(null);
      fetchSubmissions();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update submission status');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (submission: SponsorPromotionSubmission, action: 'approve' | 'reject') => {
    setSelectedSubmission(submission);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchSubmissions();
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
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

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'Pending':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case 'Approved':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'Rejected':
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar isExpanded={isSidebarExpanded} />
      <Header isSidebarExpanded={isSidebarExpanded} onToggleSidebar={toggleSidebar} />

      <div className={`mt-20 p-8 transition-all duration-300 ${isSidebarExpanded ? 'ml-64' : 'ml-20'}`}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Sponsor Promotions</h1>
                <p className="text-gray-500 text-sm">Manage sponsor promotion submissions from users</p>
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

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-800 mt-2">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Megaphone className="text-blue-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600 mt-2">{stats.pending}</p>
                </div>
                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                  <Clock className="text-yellow-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Approved</p>
                  <p className="text-2xl font-bold text-green-600 mt-2">{stats.approved}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="text-green-600" size={24} />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">Rejected</p>
                  <p className="text-2xl font-bold text-red-600 mt-2">{stats.rejected}</p>
                </div>
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                  <XCircle className="text-red-600" size={24} />
                </div>
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Status Filter */}
              <div className="flex items-center gap-3">
                <Filter className="text-gray-400" size={20} />
                <div className="flex gap-2">
                  {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => {
                        setStatusFilter(status);
                        setCurrentPage(1);
                      }}
                      className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                        statusFilter === status
                          ? 'bg-orange-600 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Search by sponsor name, mobile, email, or app name..."
                  className="w-full pl-12 pr-4 py-2 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-all flex items-center gap-2"
              >
                <Search size={18} />
                Search
              </button>

              <button
                onClick={fetchSubmissions}
                disabled={fetching}
                className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <RefreshCw className={fetching ? 'animate-spin' : ''} size={18} />
                Refresh
              </button>
            </div>
          </div>

          {/* Submissions Table */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <RefreshCw className="animate-spin text-orange-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading sponsor promotions...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="p-12 text-center">
                <Megaphone className="text-gray-400 mx-auto mb-4" size={48} />
                <p className="text-gray-500 text-lg font-medium">No sponsor promotions found</p>
                <p className="text-gray-400 text-sm mt-2">
                  {statusFilter !== 'All' ? `No ${statusFilter.toLowerCase()} submissions` : 'No submissions available'}
                </p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Sponsor Details</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">App Promotion</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Submitted By</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Submitted</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {submissions.map((submission) => (
                        <tr key={submission.submissionId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div>
                              <div className="font-semibold text-gray-800 flex items-center gap-2">
                                <User size={16} className="text-gray-400" />
                                {submission.sponsorName}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <Phone size={12} />
                                {submission.mobileNumber}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                <Mail size={12} />
                                {submission.email}
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <Smartphone className="text-orange-500" size={16} />
                              <span className="font-medium text-gray-800">{submission.appPromotion}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div>
                              <div className="text-sm font-medium text-gray-800">{submission.userName}</div>
                              <div className="text-xs text-gray-500">{submission.userMobileNumber}</div>
                              <div className="text-xs text-gray-400">Code: {submission.userReferCode}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={getStatusBadge(submission.status)}>{submission.status}</span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-600">{formatDate(submission.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedSubmission(submission);
                                  setShowDetailsModal(true);
                                }}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="View Details"
                              >
                                <Eye size={18} />
                              </button>
                              {submission.status === 'Pending' && (
                                <>
                                  <button
                                    onClick={() => openModal(submission, 'approve')}
                                    className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                    title="Approve"
                                  >
                                    <CheckCircle2 size={18} />
                                  </button>
                                  <button
                                    onClick={() => openModal(submission, 'reject')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Reject"
                                  >
                                    <XCircle size={18} />
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
                      {Math.min(pagination.currentPage * pagination.limit, pagination.totalSubmissions)} of{' '}
                      {pagination.totalSubmissions} submissions
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft size={18} />
                      </button>
                      <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                        Page {pagination.currentPage} of {pagination.totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(currentPage + 1)}
                        disabled={!pagination.hasNextPage}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-800">Submission Details</h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedSubmission(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Sponsor Information */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="text-orange-600" size={18} />
                  Sponsor Information
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Name</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.sponsorName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mobile Number</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.mobileNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Email</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.email}</div>
                  </div>
                </div>
              </div>

              {/* App Promotion */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Smartphone className="text-orange-600" size={18} />
                  App Promotion
                </h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-sm font-medium text-gray-800">{selectedSubmission.appPromotion}</div>
                </div>
              </div>

              {/* Submitted By */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <User className="text-blue-600" size={18} />
                  Submitted By
                </h4>
                <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Username</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.userName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Mobile Number</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.userMobileNumber}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Refer Code</div>
                    <div className="text-sm font-medium text-gray-800">{selectedSubmission.userReferCode}</div>
                  </div>
                </div>
              </div>

              {/* Status */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Status</h4>
                <div className="bg-gray-50 rounded-xl p-4">
                  <span className={getStatusBadge(selectedSubmission.status)}>{selectedSubmission.status}</span>
                </div>
              </div>

              {/* Admin Notes */}
              {selectedSubmission.adminNotes && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-3">Admin Notes</h4>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-800">{selectedSubmission.adminNotes}</div>
                  </div>
                </div>
              )}

              {/* Timestamps */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">Created At</div>
                  <div className="text-sm text-gray-800">{formatDate(selectedSubmission.createdAt)}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">Updated At</div>
                  <div className="text-sm text-gray-800">{formatDate(selectedSubmission.updatedAt)}</div>
                </div>
              </div>

              {/* Action Buttons */}
              {selectedSubmission.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openModal(selectedSubmission, 'approve');
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={18} />
                    Approve Submission
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openModal(selectedSubmission, 'reject');
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle size={18} />
                    Reject Submission
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval/Rejection Modal */}
      {showModal && selectedSubmission && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800">
                {actionType === 'approve' ? 'Approve Submission' : 'Reject Submission'}
              </h3>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSubmission(null);
                  setAdminNotes('');
                  setActionType(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              {/* Submission Info */}
              <div className="mb-4 bg-gray-50 rounded-xl p-4">
                <div className="text-sm font-semibold text-gray-800 mb-2">Sponsor: {selectedSubmission.sponsorName}</div>
                <div className="text-sm text-gray-600">App: {selectedSubmission.appPromotion}</div>
              </div>

              {/* Admin Notes */}
              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Admin Notes {actionType === 'reject' && <span className="text-red-600">*</span>}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                  placeholder={actionType === 'approve' ? 'Add notes (optional)...' : 'Reason for rejection (required)...'}
                />
              </div>

              {/* Warning for Rejection */}
              {actionType === 'reject' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="text-sm text-yellow-800">
                      <p className="font-semibold mb-1">Important:</p>
                      <p>Please provide a reason for rejection. This will be visible to the user.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedSubmission(null);
                    setAdminNotes('');
                    setActionType(null);
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleStatusUpdate}
                  disabled={loading || (actionType === 'reject' && !adminNotes.trim())}
                  className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                    actionType === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? 'Processing...' : actionType === 'approve' ? 'Approve Submission' : 'Reject Submission'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SponsorPromotions;
