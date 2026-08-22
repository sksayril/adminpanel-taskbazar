import { useState, useEffect } from 'react';
import {
  Layers,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Users,
  TrendingUp,
  Coins,
  Wallet,
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import {
  getCommissionSlabs,
  createCommissionSlab,
  updateCommissionSlab,
  deleteCommissionSlab,
  getUsersEarnings,
  CommissionSlab,
  CreateCommissionSlabRequest,
  UpdateCommissionSlabRequest,
  UserEarning,
} from '../services/api';

type TabType = 'slabs' | 'earnings';

const CommissionSlabSettings = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('slabs');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [success, setSuccess] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Slabs state
  const [slabs, setSlabs] = useState<CommissionSlab[]>([]);
  const [totalSlabs, setTotalSlabs] = useState(0);
  const [activeSlabs, setActiveSlabs] = useState(0);
  const [showSlabModal, setShowSlabModal] = useState(false);
  const [editingSlab, setEditingSlab] = useState<CommissionSlab | null>(null);
  const [slabForm, setSlabForm] = useState<CreateCommissionSlabRequest>({
    SlabName: '',
    MinEarnings: 0,
    MaxEarnings: null,
    CommissionPercentage: 0,
    RewardType: 'Coins',
    IsActive: true,
    Order: 0,
    CommissionBasedOn: 'ReferredUserWalletBalance',
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingSlabId, setDeletingSlabId] = useState<string | null>(null);

  // Earnings state
  const [earningsLoading, setEarningsLoading] = useState(false);
  const [earningsUsers, setEarningsUsers] = useState<UserEarning[]>([]);
  const [earningsPagination, setEarningsPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [earningsStatistics, setEarningsStatistics] = useState({
    totalCoins: 0,
    totalWalletBalance: 0,
    totalEarnings: 0,
    totalReferrals: 0,
  });
  const [earningsSearch, setEarningsSearch] = useState('');
  const [earningsSortBy, setEarningsSortBy] = useState<'totalEarnings' | 'coins' | 'walletBalance' | 'referralCount'>('totalEarnings');

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  // Fetch slabs
  useEffect(() => {
    if (activeTab === 'slabs') {
      fetchSlabs();
    }
  }, [activeTab]);

  // Fetch earnings
  useEffect(() => {
    if (activeTab === 'earnings') {
      fetchEarnings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, earningsPagination.currentPage, earningsSortBy]);

  const fetchSlabs = async () => {
    setFetching(true);
    setError('');
    try {
      const response = await getCommissionSlabs();
      setSlabs(response.data.slabs);
      setTotalSlabs(response.data.totalSlabs);
      setActiveSlabs(response.data.activeSlabs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load commission slabs');
    } finally {
      setFetching(false);
    }
  };

  const fetchEarnings = async () => {
    setEarningsLoading(true);
    try {
      const params: any = {
        page: earningsPagination.currentPage,
        limit: earningsPagination.limit,
        sortBy: earningsSortBy,
      };
      if (earningsSearch.trim()) {
        params.search = earningsSearch.trim();
      }
      const response = await getUsersEarnings(params);
      setEarningsUsers(response.data.users);
      setEarningsPagination(response.data.pagination);
      setEarningsStatistics(response.data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users earnings');
    } finally {
      setEarningsLoading(false);
    }
  };

  const handleSearchEarnings = () => {
    setEarningsPagination({ ...earningsPagination, currentPage: 1 });
    // Trigger fetch immediately with search term
    fetchEarnings();
  };

  const openCreateModal = () => {
    setEditingSlab(null);
    setSlabForm({
      SlabName: '',
      MinEarnings: 0,
      MaxEarnings: null,
      CommissionPercentage: 0,
      RewardType: 'Coins',
      IsActive: true,
      Order: 0,
      CommissionBasedOn: 'ReferredUserWalletBalance',
    });
    setShowSlabModal(true);
  };

  const openEditModal = (slab: CommissionSlab) => {
    setEditingSlab(slab);
    setSlabForm({
      SlabName: slab.SlabName,
      MinEarnings: slab.MinEarnings,
      MaxEarnings: slab.MaxEarnings,
      CommissionPercentage: slab.CommissionPercentage,
      RewardType: slab.RewardType,
      IsActive: slab.IsActive,
      Order: slab.Order,
      CommissionBasedOn: slab.CommissionBasedOn,
    });
    setShowSlabModal(true);
  };

  const handleSlabSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Validation
    if (!slabForm.SlabName.trim()) {
      setError('Slab name is required');
      setLoading(false);
      return;
    }

    if (slabForm.MinEarnings < 0) {
      setError('Minimum earnings must be 0 or greater');
      setLoading(false);
      return;
    }

    if (slabForm.MaxEarnings !== null && slabForm.MaxEarnings <= slabForm.MinEarnings) {
      setError('Maximum earnings must be greater than minimum earnings');
      setLoading(false);
      return;
    }

    if (slabForm.CommissionPercentage < 0 || slabForm.CommissionPercentage > 100) {
      setError('Commission percentage must be between 0 and 100');
      setLoading(false);
      return;
    }

    try {
      if (editingSlab) {
        await updateCommissionSlab(editingSlab._id, slabForm);
        setSuccess('Commission slab updated successfully');
      } else {
        await createCommissionSlab(slabForm);
        setSuccess('Commission slab created successfully');
      }
      setShowSlabModal(false);
      fetchSlabs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save commission slab');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (slabId: string) => {
    setDeletingSlabId(slabId);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSlabId) return;

    setLoading(true);
    setError('');
    try {
      await deleteCommissionSlab(deletingSlabId);
      setSuccess('Commission slab deleted successfully');
      setShowDeleteModal(false);
      setDeletingSlabId(null);
      fetchSlabs();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete commission slab');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Commission Slab Settings</h1>
                <p className="text-gray-500 text-sm">Manage tiered commission structures based on user earnings</p>
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

          {/* Tabs */}
          <div className="mb-6 flex gap-2 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('slabs')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'slabs'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Commission Slabs
            </button>
            <button
              onClick={() => setActiveTab('earnings')}
              className={`px-6 py-3 font-semibold text-sm transition-all ${
                activeTab === 'earnings'
                  ? 'text-purple-600 border-b-2 border-purple-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Users Earnings
            </button>
          </div>

          {/* Commission Slabs Tab */}
          {activeTab === 'slabs' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header with Stats */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Commission Slabs</h2>
                    <p className="text-sm text-gray-600">Configure tiered commission rates</p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={fetchSlabs}
                      disabled={fetching}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      <RefreshCw className={fetching ? 'animate-spin' : ''} size={18} />
                      Refresh
                    </button>
                    <button
                      onClick={openCreateModal}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg flex items-center gap-2"
                    >
                      <Plus size={18} />
                      Create Slab
                    </button>
                  </div>
                </div>
                <div className="flex gap-6">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Total Slabs</div>
                    <div className="text-2xl font-bold text-gray-800">{totalSlabs}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600">Active Slabs</div>
                    <div className="text-2xl font-bold text-green-600">{activeSlabs}</div>
                  </div>
                </div>
              </div>

              {/* Slabs Table */}
              {fetching ? (
                <div className="p-12 text-center">
                  <RefreshCw className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                  <p className="text-gray-500">Loading commission slabs...</p>
                </div>
              ) : slabs.length === 0 ? (
                <div className="p-12 text-center">
                  <Layers className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 text-lg font-medium">No commission slabs found</p>
                  <p className="text-gray-400 text-sm mt-2">Create your first commission slab to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Slab Name</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Earnings Range</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Commission %</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Reward Type</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Based On</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Order</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {slabs.map((slab) => (
                        <tr key={slab._id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-gray-800">{slab.SlabName}</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">
                              {formatCurrency(slab.MinEarnings)} - {slab.MaxEarnings === null ? '∞' : formatCurrency(slab.MaxEarnings)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-semibold text-purple-600">{slab.CommissionPercentage}%</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {slab.RewardType === 'Coins' ? (
                                <Coins className="text-yellow-500" size={16} />
                              ) : (
                                <Wallet className="text-green-500" size={16} />
                              )}
                              <span className="text-sm text-gray-700">{slab.RewardType}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-xs text-gray-600 max-w-[150px] truncate" title={slab.CommissionBasedOn}>
                              {slab.CommissionBasedOn}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm text-gray-700">{slab.Order}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                slab.IsActive
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {slab.IsActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => openEditModal(slab)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleDeleteClick(slab._id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={18} />
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
          )}

          {/* Users Earnings Tab */}
          {activeTab === 'earnings' && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">Users Earnings</h2>
                    <p className="text-sm text-gray-600">View detailed earnings breakdown for all users</p>
                  </div>
                  <button
                    onClick={fetchEarnings}
                    disabled={earningsLoading}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <RefreshCw className={earningsLoading ? 'animate-spin' : ''} size={18} />
                    Refresh
                  </button>
                </div>

                {/* Statistics */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Coins className="text-yellow-500" size={16} />
                      Total Coins
                    </div>
                    <div className="text-xl font-bold text-gray-800 mt-1">{earningsStatistics.totalCoins.toLocaleString()}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Wallet className="text-green-500" size={16} />
                      Total Wallet
                    </div>
                    <div className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(earningsStatistics.totalWalletBalance)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <TrendingUp className="text-purple-500" size={16} />
                      Total Earnings
                    </div>
                    <div className="text-xl font-bold text-gray-800 mt-1">{formatCurrency(earningsStatistics.totalEarnings)}</div>
                  </div>
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <div className="text-sm text-gray-600 flex items-center gap-2">
                      <Users className="text-blue-500" size={16} />
                      Total Referrals
                    </div>
                    <div className="text-xl font-bold text-gray-800 mt-1">{earningsStatistics.totalReferrals.toLocaleString()}</div>
                  </div>
                </div>

                {/* Search and Sort */}
                <div className="mt-4 flex gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      value={earningsSearch}
                      onChange={(e) => setEarningsSearch(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSearchEarnings()}
                      placeholder="Search by username, mobile, or refer code..."
                      className="w-full pl-12 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <button
                    onClick={handleSearchEarnings}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-all"
                  >
                    Search
                  </button>
                  <select
                    value={earningsSortBy}
                    onChange={(e) => {
                      setEarningsSortBy(e.target.value as any);
                      setEarningsPagination({ ...earningsPagination, currentPage: 1 });
                    }}
                    className="px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="totalEarnings">Sort by Total Earnings</option>
                    <option value="coins">Sort by Coins</option>
                    <option value="walletBalance">Sort by Wallet Balance</option>
                    <option value="referralCount">Sort by Referral Count</option>
                  </select>
                </div>
              </div>

              {/* Earnings Table */}
              {earningsLoading ? (
                <div className="p-12 text-center">
                  <RefreshCw className="animate-spin text-purple-600 mx-auto mb-4" size={32} />
                  <p className="text-gray-500">Loading users earnings...</p>
                </div>
              ) : earningsUsers.length === 0 ? (
                <div className="p-12 text-center">
                  <Users className="text-gray-400 mx-auto mb-4" size={48} />
                  <p className="text-gray-500 text-lg font-medium">No users found</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">User</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Coins</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Wallet</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Total Earnings</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Referrals</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Earnings Breakdown</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {earningsUsers.map((user) => (
                          <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4">
                              <div>
                                <div className="font-semibold text-gray-800">{user.userName || user.mobileNumber}</div>
                                <div className="text-xs text-gray-500">{user.referCode}</div>
                                {user.referredBy && (
                                  <div className="text-xs text-gray-400">Referred by: {user.referredBy}</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Coins className="text-yellow-500" size={16} />
                                <span className="text-sm font-semibold text-gray-800">{user.coins.toLocaleString()}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-2">
                                <Wallet className="text-green-500" size={16} />
                                <span className="text-sm font-semibold text-gray-800">{formatCurrency(user.walletBalance)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm font-bold text-purple-600">{formatCurrency(user.totalEarnings)}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-700">{user.referralCount}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-xs text-gray-600 space-y-1">
                                <div>Apps: {formatCurrency(user.earningsBreakdown.appInstallations)}</div>
                                <div>Scratch: {formatCurrency(user.earningsBreakdown.scratchCards)}</div>
                                <div>Captcha: {formatCurrency(user.earningsBreakdown.captcha)}</div>
                                <div>Daily: {formatCurrency(user.earningsBreakdown.dailyBonus)}</div>
                                <div>Referral: {formatCurrency(user.earningsBreakdown.referralEarnings)}</div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {earningsPagination.totalPages > 1 && (
                    <div className="p-6 border-t border-gray-200 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Showing {((earningsPagination.currentPage - 1) * earningsPagination.limit) + 1} to{' '}
                        {Math.min(earningsPagination.currentPage * earningsPagination.limit, earningsPagination.totalUsers)} of{' '}
                        {earningsPagination.totalUsers} users
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            setEarningsPagination({ ...earningsPagination, currentPage: earningsPagination.currentPage - 1 })
                          }
                          disabled={!earningsPagination.hasPrevPage}
                          className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <ChevronLeft size={18} />
                        </button>
                        <span className="px-4 py-2 text-sm font-semibold text-gray-700">
                          Page {earningsPagination.currentPage} of {earningsPagination.totalPages}
                        </span>
                        <button
                          onClick={() =>
                            setEarningsPagination({ ...earningsPagination, currentPage: earningsPagination.currentPage + 1 })
                          }
                          disabled={!earningsPagination.hasNextPage}
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
          )}

          {/* Create/Edit Slab Modal */}
          {showSlabModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-800">
                    {editingSlab ? 'Edit Commission Slab' : 'Create Commission Slab'}
                  </h3>
                  <button
                    onClick={() => setShowSlabModal(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleSlabSubmit} className="p-6 space-y-6">
                  {/* Slab Name */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Slab Name *</label>
                    <input
                      type="text"
                      value={slabForm.SlabName}
                      onChange={(e) => setSlabForm({ ...slabForm, SlabName: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="e.g., Bronze Tier, Silver Tier"
                    />
                  </div>

                  {/* Earnings Range */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Min Earnings *</label>
                      <input
                        type="number"
                        value={slabForm.MinEarnings}
                        onChange={(e) => setSlabForm({ ...slabForm, MinEarnings: Number(e.target.value) })}
                        min="0"
                        step="0.01"
                        required
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Max Earnings (leave empty for no limit)</label>
                      <input
                        type="number"
                        value={slabForm.MaxEarnings === null ? '' : slabForm.MaxEarnings}
                        onChange={(e) =>
                          setSlabForm({
                            ...slabForm,
                            MaxEarnings: e.target.value === '' ? null : Number(e.target.value),
                          })
                        }
                        min={slabForm.MinEarnings}
                        step="0.01"
                        className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                        placeholder="No limit"
                      />
                    </div>
                  </div>

                  {/* Commission Percentage */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Percentage *</label>
                    <input
                      type="number"
                      value={slabForm.CommissionPercentage}
                      onChange={(e) => setSlabForm({ ...slabForm, CommissionPercentage: Number(e.target.value) })}
                      min="0"
                      max="100"
                      step="0.01"
                      required
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                      placeholder="0-100"
                    />
                    <p className="mt-1 text-xs text-gray-500">Enter a value between 0 and 100</p>
                  </div>

                  {/* Reward Type */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Reward Type</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSlabForm({ ...slabForm, RewardType: 'Coins' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          slabForm.RewardType === 'Coins'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Coins className={slabForm.RewardType === 'Coins' ? 'text-purple-600' : 'text-gray-500'} size={20} />
                          <span className={`font-semibold ${slabForm.RewardType === 'Coins' ? 'text-purple-700' : 'text-gray-700'}`}>
                            Coins
                          </span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSlabForm({ ...slabForm, RewardType: 'WalletBalance' })}
                        className={`p-4 rounded-xl border-2 transition-all ${
                          slabForm.RewardType === 'WalletBalance'
                            ? 'border-purple-500 bg-purple-50 shadow-md'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Wallet className={slabForm.RewardType === 'WalletBalance' ? 'text-purple-600' : 'text-gray-500'} size={20} />
                          <span
                            className={`font-semibold ${slabForm.RewardType === 'WalletBalance' ? 'text-purple-700' : 'text-gray-700'}`}
                          >
                            Wallet Balance
                          </span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Commission Based On */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Commission Based On</label>
                    <select
                      value={slabForm.CommissionBasedOn}
                      onChange={(e) =>
                        setSlabForm({
                          ...slabForm,
                          CommissionBasedOn: e.target.value as 'ReferredUserWalletBalance' | 'WithdrawalRequestAmount' | 'WithdrawalRequestTime',
                        })
                      }
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    >
                      <option value="ReferredUserWalletBalance">Referred User Wallet Balance</option>
                      <option value="WithdrawalRequestAmount">Withdrawal Request Amount</option>
                      <option value="WithdrawalRequestTime">Withdrawal Request Time</option>
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      What value the commission percentage is calculated from
                    </p>
                  </div>

                  {/* Order */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Order</label>
                    <input
                      type="number"
                      value={slabForm.Order}
                      onChange={(e) => setSlabForm({ ...slabForm, Order: Number(e.target.value) })}
                      min="0"
                      className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-200 transition-all"
                    />
                    <p className="mt-1 text-xs text-gray-500">Lower order = checked first when determining which slab applies</p>
                  </div>

                  {/* Is Active */}
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={slabForm.IsActive}
                        onChange={(e) => setSlabForm({ ...slabForm, IsActive: e.target.checked })}
                        className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                      />
                      <span className="text-sm font-semibold text-gray-700">Is Active</span>
                    </label>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-6 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <RefreshCw className="animate-spin" size={20} />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={20} />
                          {editingSlab ? 'Update Slab' : 'Create Slab'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowSlabModal(false)}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Delete Confirmation Modal */}
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-800">Delete Commission Slab</h3>
                </div>
                <div className="p-6">
                  <p className="text-gray-700 mb-4">
                    Are you sure you want to delete this commission slab? This action cannot be undone.
                  </p>
                </div>
                <div className="p-6 border-t border-gray-200 flex gap-4">
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={loading}
                    className="flex-1 bg-red-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Deleting...' : 'Delete'}
                  </button>
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletingSlabId(null);
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommissionSlabSettings;
