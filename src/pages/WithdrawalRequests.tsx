import { useState, useEffect } from 'react';
import { DollarSign, CheckCircle2, XCircle, Clock, Filter, Search, AlertCircle, Eye, X } from 'lucide-react';
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
  }, [statusFilter]);

  const fetchRequests = async () => {
    setFetching(true);
    setError('');
    try {
      const filter = statusFilter === 'All' ? undefined : statusFilter;
      const response = await getWithdrawalRequests(filter);
      setRequests(response.data.requests);
      setSelectedRequestIds([]);
      setStats({
        totalRequests: response.data.totalRequests,
        pendingCount: response.data.pendingCount,
        approvedCount: response.data.approvedCount,
        rejectedCount: response.data.rejectedCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load withdrawal requests');
    } finally {
      setFetching(false);
    }
  };

  const toggleRequestSelection = (requestId: string) => {
    setSelectedRequestIds((prev) =>
      prev.includes(requestId) ? prev.filter((id) => id !== requestId) : [...prev, requestId]
    );
  };

  const toggleSelectAllVisible = () => {
    const visibleIds = filteredRequests.map((request) => request.requestId);
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

  const filteredRequests = requests.filter((request) => {
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      return (
        request.userMobileNumber.toLowerCase().includes(searchLower) ||
        request.userId.toLowerCase().includes(searchLower) ||
        request.requestId.toLowerCase().includes(searchLower) ||
        (request.upiId && request.upiId.toLowerCase().includes(searchLower)) ||
        (request.bankAccountNumber && request.bankAccountNumber.includes(searchTerm))
      );
    }
    return true;
  });

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
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by mobile, user ID, UPI ID, or account number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
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
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500">No withdrawal requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <input
                          type="checkbox"
                          checked={
                            filteredRequests.length > 0 &&
                            filteredRequests.every((request) => selectedRequestIds.includes(request.requestId))
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
                    {filteredRequests.map((request) => (
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
                            <div className="font-medium text-gray-900">{request.userMobileNumber}</div>
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

      {/* Approval/Rejection Modal */}
      {showModal && selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">
              {actionType === 'approve' ? 'Approve' : 'Reject'} Withdrawal Request
            </h3>

            {/* Request Details */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 space-y-2">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Request ID:</span>
                  <span className="ml-2 font-mono text-gray-900">{selectedRequest.requestId}</span>
                </div>
                <div>
                  <span className="text-gray-600">Amount:</span>
                  <span className="ml-2 font-semibold text-gray-900">{formatCurrency(selectedRequest.amount)}</span>
                </div>
                <div>
                  <span className="text-gray-600">User Mobile:</span>
                  <span className="ml-2 text-gray-900">{selectedRequest.userMobileNumber}</span>
                </div>
                <div>
                  <span className="text-gray-600">Payment Method:</span>
                  <span className="ml-2 text-gray-900">{selectedRequest.paymentMethod}</span>
                </div>
                {selectedRequest.paymentMethod === 'UPI' && selectedRequest.upiId && (
                  <div className="col-span-2">
                    <span className="text-gray-600">UPI ID:</span>
                    <span className="ml-2 text-gray-900">{selectedRequest.upiId}</span>
                  </div>
                )}
                {selectedRequest.paymentMethod === 'BankTransfer' && (
                  <>
                    <div>
                      <span className="text-gray-600">Bank Name:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.bankName}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Number:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.bankAccountNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">IFSC:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.bankIFSC}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Account Holder:</span>
                      <span className="ml-2 text-gray-900">{selectedRequest.accountHolderName}</span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Admin Notes */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Admin Notes {actionType === 'reject' && <span className="text-red-600">*</span>}
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder={actionType === 'approve' ? 'Optional notes...' : 'Please provide reason for rejection...'}
                rows={4}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200 transition-all"
                required={actionType === 'reject'}
              />
            </div>

            {/* Warning for Rejection */}
            {actionType === 'reject' && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-yellow-800">
                    <p className="font-semibold mb-1">Important:</p>
                    <p>Rejecting this request will automatically return ₹{selectedRequest.amount.toLocaleString()} to the user's wallet balance.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedRequest(null);
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
                {loading ? 'Processing...' : actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalRequests;
