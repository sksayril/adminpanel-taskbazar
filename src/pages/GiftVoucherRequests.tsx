import { useState, useEffect } from 'react';
import {
  Gift,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  Search,
  AlertCircle,
  Eye,
  X,
  Package,
  RefreshCw,
  Truck,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getGiftVoucherRequests,
  approveGiftVoucherRequest,
  rejectGiftVoucherRequest,
  deliverGiftVoucherRequest,
  type GiftVoucherRequest,
  type GiftVoucherRequestStatus,
} from '../services/api';

const STATUS_OPTIONS: Array<GiftVoucherRequestStatus | 'All'> = [
  'All',
  'Pending',
  'Approved',
  'Rejected',
  'Delivered',
];

const GiftVoucherRequests = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [statusFilter, setStatusFilter] = useState<GiftVoucherRequestStatus | 'All'>('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<GiftVoucherRequest | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [actionModal, setActionModal] = useState<'approve' | 'reject' | 'deliver' | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [voucherCodeInput, setVoucherCodeInput] = useState('');

  const [requests, setRequests] = useState<GiftVoucherRequest[]>([]);
  const [stats, setStats] = useState({
    totalRequests: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    deliveredCount: 0,
  });

  const toggleSidebar = () => setIsSidebarExpanded(!isSidebarExpanded);

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    setFetching(true);
    setError('');
    try {
      const filter = statusFilter === 'All' ? undefined : statusFilter;
      const response = await getGiftVoucherRequests(filter);
      setRequests(response.data.requests);
      setStats({
        totalRequests: response.data.totalRequests,
        pendingCount: response.data.pendingCount,
        approvedCount: response.data.approvedCount,
        rejectedCount: response.data.rejectedCount,
        deliveredCount: response.data.deliveredCount,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gift voucher requests');
    } finally {
      setFetching(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString('en-IN')}`;

  const filteredRequests = requests.filter((request) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      request.userMobileNumber.toLowerCase().includes(q) ||
      request.userId.toLowerCase().includes(q) ||
      request.requestId.toLowerCase().includes(q) ||
      request.brand.toLowerCase().includes(q) ||
      (request.voucherCode && request.voucherCode.toLowerCase().includes(q))
    );
  });

  const getStatusBadge = (status: string) => {
    const base = 'px-3 py-1 rounded-full text-xs font-semibold';
    switch (status) {
      case 'Pending':
        return `${base} bg-yellow-100 text-yellow-800`;
      case 'Approved':
        return `${base} bg-green-100 text-green-800`;
      case 'Rejected':
        return `${base} bg-red-100 text-red-800`;
      case 'Delivered':
        return `${base} bg-indigo-100 text-indigo-800`;
      default:
        return `${base} bg-gray-100 text-gray-800`;
    }
  };

  const openAction = (request: GiftVoucherRequest, kind: 'approve' | 'reject' | 'deliver') => {
    setSelectedRequest(request);
    setAdminNotes('');
    setVoucherCodeInput('');
    setActionModal(kind);
  };

  const closeActionModal = () => {
    setActionModal(null);
    setSelectedRequest(null);
    setAdminNotes('');
    setVoucherCodeInput('');
  };

  const submitAction = async () => {
    if (!selectedRequest || !actionModal) return;

    if (actionModal === 'deliver') {
      const code = voucherCodeInput.trim();
      if (!code) {
        setError('Enter the voucher code to deliver.');
        return;
      }
    }

    setLoading(true);
    setError('');
    setSuccess('');
    try {
      if (actionModal === 'approve') {
        await approveGiftVoucherRequest(selectedRequest.requestId, {
          adminNotes: adminNotes.trim() || undefined,
        });
        setSuccess('Request approved. Enter the voucher code when ready using Deliver.');
      } else if (actionModal === 'reject') {
        await rejectGiftVoucherRequest(selectedRequest.requestId, {
          adminNotes: adminNotes.trim() || undefined,
        });
        setSuccess('Request rejected; amount refunded to user wallet.');
      } else {
        await deliverGiftVoucherRequest(selectedRequest.requestId, {
          voucherCode: voucherCodeInput.trim(),
          adminNotes: adminNotes.trim() || undefined,
        });
        setSuccess('Voucher code delivered; user can see it in the app.');
      }
      closeActionModal();
      fetchRequests();
      setTimeout(() => setSuccess(''), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setLoading(false);
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
              <div className="w-12 h-12 bg-gradient-to-br from-fuchsia-500 to-violet-600 rounded-xl flex items-center justify-center shadow-lg">
                <Gift className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Gift voucher requests</h1>
                <p className="text-gray-500 text-sm">
                  Approve → deliver code, or reject pending requests (wallet refunded). Wallet is debited when the user
                  submits.
                </p>
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

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Total', value: stats.totalRequests, icon: Gift, color: 'text-violet-600' },
              { label: 'Pending', value: stats.pendingCount, icon: Clock, color: 'text-yellow-600' },
              { label: 'Approved', value: stats.approvedCount, icon: CheckCircle2, color: 'text-green-600' },
              { label: 'Rejected', value: stats.rejectedCount, icon: XCircle, color: 'text-red-600' },
              { label: 'Delivered', value: stats.deliveredCount, icon: Package, color: 'text-indigo-600' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-xl p-5 shadow-md border border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">{label}</p>
                    <p className="text-2xl font-bold text-gray-800">{value}</p>
                  </div>
                  <Icon className={color} size={28} />
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search mobile, user ID, brand, voucher code…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="text-gray-400" size={20} />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as GiftVoucherRequestStatus | 'All')}
                  className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>
                      {s === 'All' ? 'All statuses' : s}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={() => fetchRequests()}
                disabled={fetching}
                className="px-4 py-3 bg-gray-100 border border-gray-200 rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-gray-50 disabled:opacity-50"
              >
                <RefreshCw className={fetching ? 'animate-spin' : ''} size={18} />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {fetching ? (
              <div className="p-12 text-center">
                <Clock className="animate-spin text-violet-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading gift voucher requests…</p>
              </div>
            ) : filteredRequests.length === 0 ? (
              <div className="p-12 text-center">
                <Gift className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500">No gift voucher requests found</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">User</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Brand</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Amount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Code</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Created</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredRequests.map((request) => (
                      <tr key={request.requestId} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-gray-900">{request.userMobileNumber}</div>
                          <div className="text-xs text-gray-500 font-mono truncate max-w-[140px]" title={request.userId}>
                            {request.userId.substring(0, 10)}…
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-gray-900">{request.brand}</div>
                          <div className="text-xs text-gray-500 capitalize">{request.type}</div>
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold">{formatCurrency(request.amount)}</td>
                        <td className="px-4 py-3">
                          <span className={getStatusBadge(request.status)}>{request.status}</span>
                        </td>
                        <td className="px-4 py-3 text-sm font-mono text-gray-700 max-w-[160px] truncate">
                          {request.voucherCode ?? '—'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">{formatDate(request.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                              title="Details"
                            >
                              <Eye size={16} />
                            </button>
                            {request.status === 'Pending' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => openAction(request, 'approve')}
                                  className="px-2 py-1 bg-green-600 text-white rounded-lg text-xs font-semibold hover:bg-green-700"
                                >
                                  Approve
                                </button>
                                <button
                                  type="button"
                                  onClick={() => openAction(request, 'reject')}
                                  className="px-2 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {request.status === 'Approved' && (
                              <button
                                type="button"
                                onClick={() => openAction(request, 'deliver')}
                                className="px-2 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 flex items-center gap-1"
                              >
                                <Truck size={14} />
                                Deliver
                              </button>
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

      {showDetailsModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Gift className="text-violet-600" size={22} />
                Gift voucher details
              </h3>
              <button
                type="button"
                onClick={() => {
                  setShowDetailsModal(false);
                  setSelectedRequest(null);
                }}
                className="p-2 text-gray-400 hover:text-gray-600"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>
            <dl className="space-y-3 text-sm">
              <div>
                <dt className="text-gray-500">Request ID</dt>
                <dd className="font-mono break-all text-gray-900">{selectedRequest.requestId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Status</dt>
                <dd>
                  <span className={getStatusBadge(selectedRequest.status)}>{selectedRequest.status}</span>
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Brand / Type</dt>
                <dd className="text-gray-900">
                  {selectedRequest.brand} · {selectedRequest.type}
                </dd>
              </div>
              <div>
                <dt className="text-gray-500">Amount</dt>
                <dd className="font-semibold">{formatCurrency(selectedRequest.amount)}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Voucher code</dt>
                <dd className="font-mono">{selectedRequest.voucherCode ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Mobile</dt>
                <dd>{selectedRequest.userMobileNumber}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Device ID</dt>
                <dd className="font-mono text-xs break-all">{selectedRequest.userDeviceId}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Admin notes</dt>
                <dd className="text-gray-700">{selectedRequest.adminNotes ?? '—'}</dd>
              </div>
              <div>
                <dt className="text-gray-500">Created / Updated</dt>
                <dd className="text-xs text-gray-600">
                  {formatDate(selectedRequest.createdAt)}
                  <br />
                  {formatDate(selectedRequest.updatedAt)}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      )}

      {actionModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-800 mb-2">
              {actionModal === 'approve' && 'Approve request'}
              {actionModal === 'reject' && 'Reject & refund wallet'}
              {actionModal === 'deliver' && 'Deliver voucher code'}
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {actionModal === 'approve' && 'Moves status to Approved so you can deliver the code next.'}
              {actionModal === 'reject' &&
                'Only allowed while Pending. Amount will be refunded to the user wallet.'}
              {actionModal === 'deliver' && 'Must be Approved. User will see this code in the app.'}
            </p>
            <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm">
              <span className="font-semibold">{selectedRequest.brand}</span> · {formatCurrency(selectedRequest.amount)}
            </div>
            {actionModal === 'deliver' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Voucher code *</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 font-mono"
                  placeholder="ABCD-EFGH-IJKL"
                  value={voucherCodeInput}
                  onChange={(e) => setVoucherCodeInput(e.target.value)}
                  autoComplete="off"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin notes (optional)</label>
              <textarea
                rows={2}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-violet-500 text-sm"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={closeActionModal}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitAction}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 ${
                  actionModal === 'reject'
                    ? 'bg-red-600 hover:bg-red-700'
                    : actionModal === 'deliver'
                      ? 'bg-indigo-600 hover:bg-indigo-700'
                      : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? '…' : actionModal === 'approve' ? 'Approve' : actionModal === 'reject' ? 'Reject' : 'Deliver'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GiftVoucherRequests;
