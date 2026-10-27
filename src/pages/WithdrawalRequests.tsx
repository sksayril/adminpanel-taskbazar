import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, XCircle, Clock, Filter, Search, AlertCircle, Eye, X, Copy, User, Award, ShieldCheck, QrCode, ChevronLeft, ChevronRight } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getWithdrawalRequests,
  updateWithdrawalStatus,
  bulkUpdateWithdrawalStatus,
  WithdrawalRequest,
  UpdateWithdrawalStatusRequest,
} from '../services/api';

const WithdrawalRequests = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'Pending' | 'Approved' | 'Rejected' | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<WithdrawalRequest | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalRequests: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter, currentPage, limit]);

  const fetchRequests = async (targetPage?: number) => {
    setFetching(true);
    setError('');
    try {
      const pageToFetch = targetPage ?? currentPage;
      const filter = statusFilter === 'All' ? undefined : statusFilter;
      const response = await getWithdrawalRequests({
        status: filter,
        page: pageToFetch,
        limit,
        search: searchTerm.trim() || undefined,
      });
      setRequests(response.data.requests);
      setSelectedRequestIds([]);
      setStats({
        totalRequests: response.data.totalRequests,
        pendingCount: response.data.pendingCount,
        approvedCount: response.data.approvedCount,
        rejectedCount: response.data.rejectedCount,
      });
      if (response.data.pagination) {
        setPagination(response.data.pagination);
      } else {
        setPagination({
          currentPage: pageToFetch,
          totalPages: 1,
          totalRequests: response.data.requests.length,
          limit,
          hasNextPage: false,
          hasPrevPage: false,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load withdrawal requests');
    } finally {
      setFetching(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchRequests(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(requestId) ? prev.filter((id) => id !== requestId) : [...prev, requestId]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = requests.map((request) => request.requestId);
    const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedRequestIds.includes(id));
    setSelectedRequestIds(allSelected ? [] : visibleIds);
  };

  const handleBulkStatusUpdate = async (status: 'Approved' | 'Rejected') => {
    if (selectedRequestIds.length === 0) {
      setError('Please select at least one withdrawal request');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await bulkUpdateWithdrawalStatus({
        requestIds: selectedRequestIds,
        status,
        adminNotes: adminNotes || undefined,
      });
      setSuccess(`Selected requests ${status.toLowerCase()} successfully`);
      setSelectedRequestIds([]);
      setAdminNotes('');
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk update requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    if (!selectedRequest || !actionType) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const updateData: UpdateWithdrawalStatusRequest = {
        status: actionType === 'approve' ? 'Approved' : 'Rejected',
        adminNotes: adminNotes || undefined,
      };

      await updateWithdrawalStatus(selectedRequest.requestId, updateData);
      setSuccess(`Request ${actionType === 'approve' ? 'approved' : 'rejected'} successfully`);
      setShowModal(false);
      setSelectedRequest(null);
      setAdminNotes('');
      setActionType(null);
      fetchRequests();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update request status');
    } finally {
      setLoading(false);
    }
  };

  const openModal = (request: WithdrawalRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setActionType(action);
    setAdminNotes('');
    setShowModal(true);
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
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
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Withdrawal Requests</h1>
                <p className="text-gray-500 text-sm">Manage and process user withdrawal requests</p>
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Requests</p>
                  <p className="text-2xl font-bold text-gray-800">{stats.totalRequests}</p>
                </div>
                <DollarSign className="text-blue-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.pendingCount}</p>
                </div>
                <Clock className="text-yellow-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Approved</p>
                  <p className="text-2xl font-bold text-green-600">{stats.approvedCount}</p>
                </div>
                <CheckCircle2 className="text-green-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Rejected</p>
                  <p className="text-2xl font-bold text-red-600">{stats.rejectedCount}</p>
                </div>
                <XCircle className="text-red-500" size={32} />
              </div>
            </div>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1 relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by mobile, user ID, UPI ID, or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <button
                onClick={handleSearch}
                className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors text-sm"
              >
                Search
              </button>
              <div className="flex items-center gap-2 w-full md:w-auto">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full md:w-auto px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200 mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <p className="text-sm text-gray-600">
              Selected: <span className="font-semibold">{selectedRequestIds.length}</span>
            </p>
            <input
              type="text"
              placeholder="Bulk action notes (optional)"
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={() => handleBulkStatusUpdate('Approved')}
              disabled={loading || selectedRequestIds.length === 0}
              className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 disabled:opacity-50"
            >
              Bulk Approve
            </button>
            <button
              onClick={() => handleBulkStatusUpdate('Rejected')}
              disabled={loading || selectedRequestIds.length === 0}
              className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50"
            >
              Bulk Reject
            </button>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <Clock className="animate-spin text-blue-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading withdrawal requests...</p>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500">No withdrawal requests found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            requests.length > 0 &&
                            requests.every((request) => selectedRequestIds.includes(request.requestId))
                          }
                          onChange={toggleSelectAllVisible}
                        />
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Request ID
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        User Details
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Payment Method
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {requests.map((request) => (
                      <tr key={request.requestId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="checkbox"
                            checked={selectedRequestIds.includes(request.requestId)}
                            onChange={() => toggleRequestSelection(request.requestId)}
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">
                            {request.requestId.substring(0, 12)}...
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="flex items-center gap-1.5 flex-wrap">
       <span className="font-bold text-gray-900">{request.userName ? `${request.userName} (${request.userMobileNumber})` : request.userMobileNumber}</span>
       {request.isVerified ? (
         <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">Verified</span>
       ) : (
         <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-500">Unverified</span>
       )}
       {(request.qrCodeImage || request.paymentProof) && (
         <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-700">QR Proof</span>
       )}
     </div>
                            <div className="text-gray-500 text-xs">ID: {request.userId.substring(0, 12)}...</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">{formatCurrency(request.amount)}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-gray-900">{request.paymentMethod}</div>
                            {request.paymentMethod === 'UPI' && request.upiId && (
                              <div className="text-xs text-gray-500">{request.upiId}</div>
                            )}
                            {request.paymentMethod === 'BankTransfer' && (
                              <div className="text-xs text-gray-500">
                                {request.bankName} - {request.bankAccountNumber}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(request.status)}>{request.status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{formatDate(request.createdAt)}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            {request.status === 'Pending' && (
                              <>
                                <button
                                  onClick={() => openModal(request, 'approve')}
                                  className="px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-xs font-semibold"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => openModal(request, 'reject')}
                                  className="px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs font-semibold"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status !== 'Pending' && (
                              <span className="text-gray-400 text-xs">Processed</span>
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
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-sm text-gray-600">
                    Showing <span className="font-semibold">{((currentPage - 1) * limit) + 1}</span> to{' '}
                    <span className="font-semibold">
                      {Math.min(currentPage * limit, pagination.totalRequests)}
                    </span>{' '}
                    of <span className="font-semibold">{pagination.totalRequests.toLocaleString('en-IN')}</span> requests
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={!pagination.hasPrevPage}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Previous Page"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        let pageNum;
                        if (pagination.totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= pagination.totalPages - 2) {
                          pageNum = pagination.totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                              currentPage === pageNum
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={!pagination.hasNextPage}
                      className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Next Page"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </div>
                </div>
              )}
            </>
            )}
          </div>
        </div>
      </div>

      {/* View Details Modal */}
      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="text-blue-600" size={24} />
                Withdrawal Request Details
              </h3>
              <button
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* Request Information */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Request Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Request ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900 break-all">{selectedRequest.requestId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <span className={getStatusBadge(selectedRequest.status)}>{selectedRequest.status}</span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Amount</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Payment Method</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Created At</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Last Updated</p>
                    <p className="text-sm text-gray-900">{formatDate(selectedRequest.updatedAt)}</p>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">User Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">User ID</p>
                    <p className="text-sm font-mono font-semibold text-gray-900 break-all">{selectedRequest.userId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Mobile Number</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedRequest.userMobileNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Device ID</p>
                    <p className="text-sm font-mono text-gray-900 break-all">{selectedRequest.userDeviceId}</p>
                  </div>
                </div>
              </div>

              
              {/* Payment Proof / QR Code Uploaded by User */}
              {(selectedRequest.qrCodeImage || selectedRequest.paymentProof) && (
                <div className="bg-purple-50 rounded-xl p-5 border border-purple-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-base font-bold text-purple-900 flex items-center gap-2">
                      <span>📸 Payment QR Code / Payment Proof</span>
                    </h4>
                    <span className="text-xs text-purple-700 font-medium">Uploaded by user</span>
                  </div>
                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-purple-100">
                    <img
                      src={selectedRequest.qrCodeImage || selectedRequest.paymentProof || ''}
                      alt="Payment QR Proof"
                      className="w-36 h-36 object-contain rounded-lg border border-gray-200 cursor-pointer shadow-sm hover:scale-105 transition-transform"
                      onClick={() => setPreviewImage(selectedRequest.qrCodeImage || selectedRequest.paymentProof || '')}
                    />
                    <div className="text-sm space-y-1.5 text-gray-700 text-center sm:text-left">
                      <p className="font-semibold text-gray-900">User Payment QR / Screenshot</p>
                      <p className="text-xs text-gray-500">Scan this QR code using PhonePe / GPay / Paytm or verify payment receipt.</p>
                      <button
                        type="button"
                        onClick={() => setPreviewImage(selectedRequest.qrCodeImage || selectedRequest.paymentProof || '')}
                        className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors"
                      >
                        <Eye size={13} /> View Full Size
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Complete Earning History & Coin Sources */}
              {selectedRequest.earningBreakdown && (
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h4 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <span>📊 User Complete Earning Breakdown</span>
                    </h4>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                      Real-time Ledger
                    </span>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-amber-50 p-3.5 rounded-xl border border-amber-200">
                      <p className="text-xs font-semibold text-amber-700 uppercase">Total Earned Coins</p>
                      <p className="text-xl font-extrabold text-amber-900 mt-1">
                        🪙 {selectedRequest.earningBreakdown.totalEarnedCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-indigo-50 p-3.5 rounded-xl border border-indigo-200">
                      <p className="text-xs font-semibold text-indigo-700 uppercase">Redeemed Coins</p>
                      <p className="text-xl font-extrabold text-indigo-900 mt-1">
                        🔄 {selectedRequest.earningBreakdown.redeemedCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-emerald-50 p-3.5 rounded-xl border border-emerald-200">
                      <p className="text-xs font-semibold text-emerald-700 uppercase">Current Coins Balance</p>
                      <p className="text-xl font-extrabold text-emerald-900 mt-1">
                        💰 {selectedRequest.earningBreakdown.currentCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="bg-green-50 p-3.5 rounded-xl border border-green-200">
                      <p className="text-xs font-semibold text-green-700 uppercase">Current Wallet Balance</p>
                      <p className="text-xl font-extrabold text-green-900 mt-1">
                        ₹{selectedRequest.earningBreakdown.currentWalletBalance.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Source Breakdown Cards */}
                  <div>
                    <h5 className="text-sm font-semibold text-gray-700 mb-2.5">Earning Sources Breakdown:</h5>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">📱 App Tasks</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.taskCompletion.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.taskCompletion.count} completed</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">👥 Referrals</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.referral.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.referral.count} referred</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">🌐 Offerwall</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.offerwall.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.offerwall.count} offers</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">🎟️ Scratch Card</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.scratchCard.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.scratchCard.count} claims</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">🎡 Spin & Earn</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.spinWheel.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.spinWheel.count} spins</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">🎁 Daily Bonus</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.dailyBonus.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.dailyBonus.count} days</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">🔢 Captcha Solver</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          {selectedRequest.earningBreakdown.sources.captcha.coins.toLocaleString('en-IN')} coins
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.sources.captcha.count} solved</p>
                      </div>

                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                        <span className="text-gray-500 font-medium">💸 Total Withdrawn</span>
                        <p className="font-bold text-gray-900 text-sm mt-0.5">
                          ₹{selectedRequest.earningBreakdown.totalWithdrawn.toLocaleString('en-IN')}
                        </p>
                        <p className="text-[11px] text-gray-500">{selectedRequest.earningBreakdown.withdrawalsSummary.approved} approved</p>
                      </div>
                    </div>
                  </div>

                  {/* Recent Coin Transactions */}
                  {selectedRequest.earningBreakdown.recentTransactions.length > 0 && (
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-2">Recent Coin Transactions:</h5>
                      <div className="max-h-44 overflow-y-auto border border-gray-200 rounded-lg">
                        <table className="min-w-full divide-y divide-gray-200 text-xs">
                          <thead className="bg-gray-50 sticky top-0">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Source</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Coins</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Description</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-500">Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-100">
                            {selectedRequest.earningBreakdown.recentTransactions.map((tx) => (
                              <tr key={tx.id} className="hover:bg-gray-50">
                                <td className="px-3 py-1.5 font-medium text-gray-800">{tx.source}</td>
                                <td className="px-3 py-1.5 font-bold text-emerald-600">+{tx.coins}</td>
                                <td className="px-3 py-1.5 text-gray-500 truncate max-w-xs">{tx.description}</td>
                                <td className="px-3 py-1.5 text-gray-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Payment Details */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Payment Details</h4>
                {selectedRequest.paymentMethod === 'UPI' ? (
                  <div className="space-y-3">
                    {selectedRequest.upiId && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">UPI ID</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.upiId}</p>
                      </div>
                    )}
                    {selectedRequest.virtualId && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Virtual ID</p>
                        <p className="text-sm font-mono text-gray-900">{selectedRequest.virtualId}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {selectedRequest.bankAccountNumber && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account Number</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{selectedRequest.bankAccountNumber}</p>
                      </div>
                    )}
                    {selectedRequest.bankIFSC && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">IFSC Code</p>
                        <p className="text-sm font-mono font-semibold text-gray-900">{selectedRequest.bankIFSC}</p>
                      </div>
                    )}
                    {selectedRequest.bankName && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Bank Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.bankName}</p>
                      </div>
                    )}
                    {selectedRequest.accountHolderName && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Account Holder Name</p>
                        <p className="text-sm font-semibold text-gray-900">{selectedRequest.accountHolderName}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Admin Notes */}
              {selectedRequest.adminNotes && (
                <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-2">Admin Notes</h4>
                  <p className="text-sm text-gray-700">{selectedRequest.adminNotes}</p>
                </div>
              )}

              {/* Action Buttons */}
              {selectedRequest.status === 'Pending' && (
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openModal(selectedRequest, 'approve');
                    }}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
                  >
                    Approve Request
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openModal(selectedRequest, 'reject');
                    }}
                    className="flex-1 px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                  >
                    Reject Request
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Approval/Payment Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-3xl w-full max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-200 mb-5">
              <div>
                <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  {actionType === 'approve' ? (
                    <>
                      <CheckCircle2 className="text-emerald-600" size={24} />
                      Process User Payment & Approve Withdrawal
                    </>
                  ) : (
                    <>
                      <XCircle className="text-red-600" size={24} />
                      Reject Withdrawal Request
                    </>
                  )}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Request ID: <span className="font-mono font-medium text-gray-700">{selectedRequest.requestId}</span> • Created {formatDate(selectedRequest.createdAt)}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                  setActionType(null);
                }}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="space-y-5">
              {/* 1. Complete User Profile Card */}
              <div className="bg-gradient-to-r from-blue-50/90 to-indigo-50/90 rounded-xl p-4 border border-blue-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="text-blue-600" size={18} />
                    <h4 className="text-sm font-bold text-gray-900">User Profile & Account Information</h4>
                  </div>
                  {selectedRequest.isVerified ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <ShieldCheck size={13} /> Verified User
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
                      Unverified
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[11px]">User Name</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedRequest.userName || 'N/A'}</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[11px]">Mobile Number</span>
                    <span className="font-bold text-gray-900 text-sm">{selectedRequest.userMobileNumber}</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[11px]">Referral Code</span>
                    <span className="font-mono font-bold text-indigo-700 text-sm">{selectedRequest.userReferCode || 'N/A'}</span>
                  </div>
                  <div className="bg-white/90 p-2.5 rounded-lg border border-blue-100">
                    <span className="text-gray-500 block text-[11px]">User ID</span>
                    <span className="font-mono text-[11px] text-gray-700 truncate block" title={selectedRequest.userId}>
                      {selectedRequest.userId}
                    </span>
                  </div>
                </div>
              </div>

              {/* 2. User Coin Earnings & Detailed Source Breakdown */}
              {selectedRequest.earningBreakdown && (
                <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                      <Award className="text-amber-500" size={18} />
                      User Coins Earning Details & Balance
                    </h4>
                    <span className="text-xs text-gray-500 font-medium">Live Breakdown</span>
                  </div>

                  {/* Summary Metric Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <p className="text-[11px] font-medium text-amber-700">Total Coins Earned</p>
                      <p className="text-lg font-black text-amber-900 mt-0.5">
                        {selectedRequest.earningBreakdown.totalEarnedCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <p className="text-[11px] font-medium text-blue-700">Current Coins Balance</p>
                      <p className="text-lg font-black text-blue-900 mt-0.5">
                        {(selectedRequest.userCoins ?? selectedRequest.earningBreakdown.currentCoins).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <p className="text-[11px] font-medium text-emerald-700">Available Wallet Balance</p>
                      <p className="text-lg font-black text-emerald-900 mt-0.5">
                        ₹{(selectedRequest.userWalletBalance ?? selectedRequest.earningBreakdown.currentWalletBalance).toLocaleString('en-IN')}
                      </p>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-[11px] font-medium text-purple-700">Total Redeemed Coins</p>
                      <p className="text-lg font-black text-purple-900 mt-0.5">
                        {selectedRequest.earningBreakdown.redeemedCoins.toLocaleString('en-IN')}
                      </p>
                    </div>
                  </div>

                  {/* Source Breakdown Grid */}
                  <div>
                    <p className="text-xs font-semibold text-gray-700 mb-2">Where User Earned Coins:</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 text-xs">
                      {/* Task Complete */}
                      <div className="p-3 bg-blue-50/70 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-blue-900">Task Complete</span>
                          <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.taskCompletion.count} apps
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.taskCompletion.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Refer & Earn */}
                      <div className="p-3 bg-indigo-50/70 rounded-lg border border-indigo-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-indigo-900">Refer & Earn</span>
                          <span className="text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.referral.count} users
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.referral.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Offer Wall */}
                      <div className="p-3 bg-violet-50/70 rounded-lg border border-violet-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-violet-900">Offer Wall</span>
                          <span className="text-[10px] bg-violet-100 text-violet-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.offerwall.count} offers
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.offerwall.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Scratch Card */}
                      <div className="p-3 bg-pink-50/70 rounded-lg border border-pink-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-pink-900">Scratch Card</span>
                          <span className="text-[10px] bg-pink-100 text-pink-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.scratchCard.count} cards
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.scratchCard.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Spin Wheel */}
                      <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-amber-900">Spin & Earn</span>
                          <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.spinWheel.count} spins
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.spinWheel.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Daily Bonus */}
                      <div className="p-3 bg-teal-50/70 rounded-lg border border-teal-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-teal-900">Daily Bonus</span>
                          <span className="text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.dailyBonus.count} days
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.dailyBonus.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Captcha Solver */}
                      <div className="p-3 bg-cyan-50/70 rounded-lg border border-cyan-200">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-cyan-900">Captcha Solver</span>
                          <span className="text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.sources.captcha.count} captchas
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          {selectedRequest.earningBreakdown.sources.captcha.coins.toLocaleString('en-IN')} coins
                        </p>
                      </div>

                      {/* Total Redeemed */}
                      <div className="p-3 bg-gray-100 rounded-lg border border-gray-300">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-gray-800">Total Paid Out</span>
                          <span className="text-[10px] bg-gray-200 text-gray-800 px-1.5 py-0.5 rounded font-bold">
                            {selectedRequest.earningBreakdown.withdrawalsSummary.approved} done
                          </span>
                        </div>
                        <p className="text-sm font-bold text-gray-900 mt-1">
                          ₹{selectedRequest.earningBreakdown.totalWithdrawn.toLocaleString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Payout Details & Payment Transfer */}
              <div className="bg-emerald-50/80 rounded-xl p-4 border border-emerald-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">Payout Amount</span>
                    <p className="text-2xl font-black text-emerald-900">{formatCurrency(selectedRequest.amount)}</p>
                  </div>
                  <span className="px-3 py-1 bg-white border border-emerald-300 rounded-lg text-xs font-bold text-emerald-800 shadow-sm">
                    {selectedRequest.paymentMethod === 'UPI' ? 'UPI Transfer' : 'Direct Bank Transfer'}
                  </span>
                </div>

                {selectedRequest.paymentMethod === 'UPI' ? (
                  <div className="bg-white p-3.5 rounded-lg border border-emerald-100 flex items-center justify-between shadow-sm">
                    <div>
                      <span className="text-xs text-gray-500 block">User UPI ID:</span>
                      <span className="text-sm font-mono font-bold text-gray-900 select-all">{selectedRequest.upiId}</span>
                    </div>
                    {selectedRequest.upiId && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(selectedRequest.upiId || '');
                          setSuccess('UPI ID copied to clipboard!');
                          setTimeout(() => setSuccess(''), 2000);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold hover:bg-emerald-200 transition-colors shadow-sm"
                      >
                        <Copy size={13} /> Copy UPI ID
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-white p-3.5 rounded-lg border border-emerald-100 space-y-2 shadow-sm">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <span className="text-gray-500 block text-[11px]">Bank Account Number</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-gray-900 text-sm select-all">{selectedRequest.bankAccountNumber}</span>
                          {selectedRequest.bankAccountNumber && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedRequest.bankAccountNumber || '');
                                setSuccess('Account number copied!');
                                setTimeout(() => setSuccess(''), 2000);
                              }}
                              className="p-1 text-gray-400 hover:text-emerald-700"
                              title="Copy Account Number"
                            >
                              <Copy size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">IFSC Code</span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono font-bold text-gray-900 text-sm select-all">{selectedRequest.bankIFSC}</span>
                          {selectedRequest.bankIFSC && (
                            <button
                              onClick={() => {
                                navigator.clipboard.writeText(selectedRequest.bankIFSC || '');
                                setSuccess('IFSC code copied!');
                                setTimeout(() => setSuccess(''), 2000);
                              }}
                              className="p-1 text-gray-400 hover:text-emerald-700"
                              title="Copy IFSC"
                            >
                              <Copy size={13} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Bank Name</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.bankName}</span>
                      </div>
                      <div>
                        <span className="text-gray-500 block text-[11px]">Account Holder Name</span>
                        <span className="font-semibold text-gray-900">{selectedRequest.accountHolderName}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* QR Code / Payment Proof Uploaded by User */}
                {(selectedRequest.qrCodeImage || selectedRequest.paymentProof) && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedRequest.qrCodeImage || selectedRequest.paymentProof || ''}
                        alt="QR Proof"
                        className="w-16 h-16 object-contain rounded-lg border border-purple-300 bg-white cursor-pointer shadow-sm hover:scale-105 transition-transform"
                        onClick={() => setPreviewImage(selectedRequest.qrCodeImage || selectedRequest.paymentProof || '')}
                      />
                      <div>
                        <p className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                          <QrCode size={14} /> Scan & Pay QR Code Attached
                        </p>
                        <p className="text-[11px] text-purple-700">Click image to enlarge or scan with PhonePe / GPay</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setPreviewImage(selectedRequest.qrCodeImage || selectedRequest.paymentProof || '')}
                      className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-semibold hover:bg-purple-700 transition-colors shadow-sm"
                    >
                      Enlarge QR
                    </button>
                  </div>
                )}
              </div>

              {/* Admin Notes / Payout Reference ID */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1.5">
                  {actionType === 'approve'
                    ? 'Payment Reference ID / UTR Number / Admin Notes (Optional):'
                    : 'Reason for Rejection *:'}
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder={
                    actionType === 'approve'
                      ? 'e.g., UTR: 123456789012 or Paid via PhonePe...'
                      : 'Please enter the reason for rejection...'
                  }
                  rows={2}
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-200 transition-all"
                  required={actionType === 'reject'}
                />
              </div>

              {/* Warning for Rejection */}
              {actionType === 'reject' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2.5 text-xs text-red-800">
                  <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={16} />
                  <div>
                    <span className="font-bold">Refund Notice:</span> Rejecting this request will immediately refund ₹{selectedRequest.amount.toLocaleString()} to user's wallet.
                  </div>
                </div>
              )}
            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 justify-end pt-5 border-t border-gray-200 mt-5">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
                  setAdminNotes('');
                  setActionType(null);
                }}
                className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleStatusUpdate}
                disabled={loading || (actionType === 'reject' && !adminNotes.trim())}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${
                  actionType === 'approve'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:from-green-700 hover:to-emerald-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {loading
                  ? 'Processing...'
                  : actionType === 'approve'
                  ? `Approve & Mark Paid (${formatCurrency(selectedRequest.amount)})`
                  : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-xl p-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-1.5 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors"
            >
              <X size={20} />
            </button>
            <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
              <QrCode size={18} className="text-purple-600" />
              Payment QR Code / Payment Proof (Scan to Pay)
            </h4>
            <div className="flex justify-center bg-gray-50 rounded-lg p-2 border border-gray-200">
              <img
                src={previewImage}
                alt="Enlarged Proof"
                className="max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
