import { useState, useEffect } from 'react';
import { Users as UsersIcon, Eye, Search, ChevronLeft, ChevronRight, Coins, Wallet, UserPlus, Calendar, X, TrendingUp, TrendingDown, FileText, Loader2, Smartphone, Clock, LogIn, Edit, Save, Ban, Unlock, AlertCircle } from 'lucide-react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { getUsers, getUserById, updateUser, blockUser, unblockUser, User, UserDetails, UpdateUserRequest } from '../services/api';

const Users = () => {
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [detailsError, setDetailsError] = useState<string>('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<UpdateUserRequest>({});
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string>('');
  const [editSuccess, setEditSuccess] = useState<string>('');
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [blockReason, setBlockReason] = useState<string>('');
  const [blockLoading, setBlockLoading] = useState(false);
  const [blockError, setBlockError] = useState<string>('');

  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 20,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [statistics, setStatistics] = useState({
    totalCoins: 0,
    totalWalletBalance: 0,
  });

  const toggleSidebar = () => {
    setIsSidebarExpanded(!isSidebarExpanded);
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, limit]);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const params: any = {
        page: currentPage,
        limit: limit,
      };
      if (searchTerm.trim()) {
        params.search = searchTerm.trim();
      }
      const response = await getUsers(params);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
      setStatistics(response.data.statistics);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
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

  const formatCurrency = (amount: number) => {
    return `₹${amount.toLocaleString('en-IN')}`;
  };

  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN');
  };

  const handleViewUserDetails = async (user: User) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setDetailsError('');
    setUserDetails(null);

    try {
      const response = await getUserById(user.userId);
      setUserDetails(response.data);
    } catch (err) {
      setDetailsError(err instanceof Error ? err.message : 'Failed to load user details');
    } finally {
      setLoadingDetails(false);
    }
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

  const handleOpenEditModal = () => {
    if (userDetails) {
      setEditForm({
        MobileNumber: userDetails.mobileNumber,
        DeviceId: userDetails.deviceId,
        Coins: userDetails.coins,
        WalletBalance: userDetails.walletBalance,
      });
      setEditError('');
      setEditSuccess('');
      setShowEditModal(true);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userDetails) return;

    // Validate password if provided
    if (editForm.Password && editForm.Password.trim() !== '') {
      if (editForm.Password.trim().length < 6) {
        setEditError('Password must be at least 6 characters long');
        return;
      }
    }

    // Check if at least one field is provided or changed
    const hasChanges = 
      (editForm.MobileNumber && editForm.MobileNumber !== userDetails.mobileNumber) ||
      (editForm.Password && editForm.Password.trim() !== '') ||
      (editForm.DeviceId && editForm.DeviceId !== userDetails.deviceId) ||
      (editForm.Coins !== undefined && editForm.Coins !== userDetails.coins) ||
      (editForm.WalletBalance !== undefined && editForm.WalletBalance !== userDetails.walletBalance);

    if (!hasChanges) {
      setEditError('No changes detected. Please modify at least one field.');
      return;
    }

    setEditLoading(true);
    setEditError('');
    setEditSuccess('');

    try {
      const updateData: UpdateUserRequest = {};
      
      if (editForm.MobileNumber && editForm.MobileNumber !== userDetails.mobileNumber) {
        updateData.MobileNumber = editForm.MobileNumber;
      }
      
      // Password: send if provided and not empty
      if (editForm.Password && editForm.Password.trim() !== '') {
        updateData.Password = editForm.Password.trim();
      }
      
      if (editForm.DeviceId && editForm.DeviceId !== userDetails.deviceId) {
        updateData.DeviceId = editForm.DeviceId;
      }
      
      if (editForm.Coins !== undefined && editForm.Coins !== userDetails.coins) {
        updateData.Coins = editForm.Coins;
      }
      
      if (editForm.WalletBalance !== undefined && editForm.WalletBalance !== userDetails.walletBalance) {
        updateData.WalletBalance = editForm.WalletBalance;
      }

      if (Object.keys(updateData).length === 0) {
        setEditError('No changes detected. Please modify at least one field.');
        setEditLoading(false);
        return;
      }

      await updateUser(userDetails.userId, updateData);
      setEditSuccess('User updated successfully!');
      
      // Refresh user details after a short delay to show success message
      setTimeout(async () => {
        try {
          const updatedResponse = await getUserById(userDetails.userId);
          setUserDetails(updatedResponse.data);
          setShowEditModal(false);
          setEditForm({});
          setEditError('');
          setEditSuccess('');
        } catch (err) {
          setEditError('User updated but failed to refresh details');
        }
      }, 1500);
    } catch (err) {
      setEditError(err instanceof Error ? err.message : 'Failed to update user');
      setEditLoading(false);
    }
  };

  const handleBlockUser = async () => {
    if (!userDetails) return;

    setBlockLoading(true);
    setBlockError('');

    try {
      await blockUser(userDetails.userId, blockReason.trim() ? { reason: blockReason.trim() } : undefined);
      
      // Refresh user details
      const response = await getUserById(userDetails.userId);
      setUserDetails(response.data);
      setShowBlockModal(false);
      setBlockReason('');
      setBlockError('');
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : 'Failed to block user');
    } finally {
      setBlockLoading(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!userDetails) return;

    setBlockLoading(true);
    setBlockError('');

    try {
      await unblockUser(userDetails.userId);
      
      // Refresh user details
      const response = await getUserById(userDetails.userId);
      setUserDetails(response.data);
      setBlockError('');
    } catch (err) {
      setBlockError(err instanceof Error ? err.message : 'Failed to unblock user');
    } finally {
      setBlockLoading(false);
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
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <UsersIcon className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">Users Management</h1>
                <p className="text-gray-500 text-sm">View and manage all registered users</p>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <X className="text-red-600 flex-shrink-0" size={20} />
              <p className="text-red-700 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Users</p>
                  <p className="text-2xl font-bold text-gray-800">{formatNumber(pagination.totalUsers)}</p>
                </div>
                <UsersIcon className="text-indigo-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Coins</p>
                  <p className="text-2xl font-bold text-orange-600">{formatNumber(statistics.totalCoins)}</p>
                </div>
                <Coins className="text-orange-500" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Wallet Balance</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalWalletBalance)}</p>
                </div>
                <Wallet className="text-green-500" size={32} />
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by mobile number, device ID, or referral code..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSearch}
                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
              >
                Search
              </button>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="10">10 per page</option>
                <option value="20">20 per page</option>
                <option value="50">50 per page</option>
                <option value="100">100 per page</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <UsersIcon className="animate-pulse text-indigo-600 mx-auto mb-4" size={32} />
                <p className="text-gray-500">Loading users...</p>
              </div>
            ) : users.length === 0 ? (
              <div className="p-12 text-center">
                <UsersIcon className="text-gray-300 mx-auto mb-4" size={48} />
                <p className="text-gray-500">No users found</p>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          User ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Mobile Number
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Referral Code
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Coins
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Wallet Balance
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Referred By
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Created At
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-mono text-gray-900">
                              {user.userId.substring(0, 12)}...
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{user.mobileNumber}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-indigo-600">{user.referCode}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-orange-600">{formatNumber(user.coins)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-green-600">{formatCurrency(user.walletBalance)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.referredBy ? (
                              <div className="text-sm font-medium text-gray-900">{user.referredBy}</div>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-500">{formatDate(user.createdAt)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => handleViewUserDetails(user)}
                              className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                  <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Showing <span className="font-semibold">{((currentPage - 1) * limit) + 1}</span> to{' '}
                      <span className="font-semibold">
                        {Math.min(currentPage * limit, pagination.totalUsers)}
                      </span>{' '}
                      of <span className="font-semibold">{formatNumber(pagination.totalUsers)}</span> users
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(currentPage - 1)}
                        disabled={!pagination.hasPrevPage}
                        className="p-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                              className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                                currentPage === pageNum
                                  ? 'bg-indigo-600 text-white'
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

      {/* User Details Modal */}
      {showDetailsModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Eye className="text-indigo-600" size={24} />
                User Details
              </h3>
              <div className="flex items-center gap-2">
                {userDetails && (
                  <>
                    <button
                      onClick={handleOpenEditModal}
                      className="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                      title="Edit User"
                    >
                      <Edit size={20} />
                    </button>
                    {userDetails.isBlocked ? (
                      <button
                        onClick={handleUnblockUser}
                        disabled={blockLoading}
                        className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Unblock User"
                      >
                        <Unlock size={20} />
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          setShowBlockModal(true);
                          setBlockReason('');
                          setBlockError('');
                        }}
                        className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                        title="Block User"
                      >
                        <Ban size={20} />
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedUser(null);
                    setUserDetails(null);
                    setDetailsError('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Close"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            {loadingDetails ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="animate-spin text-indigo-600 mb-4" size={48} />
                <p className="text-gray-600">Loading user details...</p>
              </div>
            ) : detailsError ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex items-center gap-3">
                <X className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{detailsError}</p>
              </div>
            ) : userDetails ? (
              <div className="space-y-6">
                {/* Blocked Status Alert */}
                {userDetails.isBlocked && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                    <div className="flex-1">
                      <p className="text-red-800 font-semibold mb-1">User is Blocked</p>
                      {userDetails.blockedReason && (
                        <p className="text-sm text-red-700 mb-1">Reason: {userDetails.blockedReason}</p>
                      )}
                      {userDetails.blockedAt && (
                        <p className="text-xs text-red-600">Blocked at: {formatDate(userDetails.blockedAt)}</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Block/Unblock Error */}
                {blockError && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                    <X className="text-red-600 flex-shrink-0" size={20} />
                    <p className="text-red-700 text-sm font-medium">{blockError}</p>
                  </div>
                )}

                {/* User Information */}
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UsersIcon className="text-indigo-600" size={20} />
                    User Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">User ID</p>
                      <p className="text-sm font-mono font-semibold text-gray-900 break-all">{userDetails.userId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Mobile Number</p>
                      <p className="text-sm font-semibold text-gray-900">{userDetails.mobileNumber}</p>
                    </div>
                    {userDetails.password && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Password</p>
                        <p className="text-sm font-mono text-gray-900 break-all">{userDetails.password}</p>
                      </div>
                    )}
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Device ID</p>
                      <p className="text-sm font-mono text-gray-900 break-all">{userDetails.deviceId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referral Code</p>
                      <p className="text-sm font-semibold text-indigo-600">{userDetails.referCode}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Status</p>
                      {userDetails.isBlocked ? (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          <Ban size={14} />
                          Blocked
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          <Unlock size={14} />
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Financial Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Wallet className="text-green-600" size={20} />
                    Financial Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg p-4 border border-orange-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Coins className="text-orange-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Coins</p>
                          <p className="text-2xl font-bold text-orange-600">{formatNumber(userDetails.coins)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-green-200">
                      <div className="flex items-center gap-3 mb-2">
                        <Wallet className="text-green-600" size={24} />
                        <div>
                          <p className="text-sm text-gray-600">Wallet Balance</p>
                          <p className="text-2xl font-bold text-green-600">{formatCurrency(userDetails.walletBalance)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="text-blue-600" size={20} />
                    User Statistics
                  </h4>
                  <div className="space-y-4">
                    {/* Withdrawal Statistics */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Withdrawal Statistics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-purple-200">
                          <div className="flex items-center gap-2 mb-1">
                            <FileText className="text-purple-600" size={18} />
                            <p className="text-xs text-gray-600">Total Withdrawals</p>
                          </div>
                          <p className="text-xl font-bold text-purple-600">{formatNumber(userDetails.statistics.totalWithdrawalRequests)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="text-yellow-600" size={18} />
                            <p className="text-xs text-gray-600">Pending</p>
                          </div>
                          <p className="text-xl font-bold text-yellow-600">{formatNumber(userDetails.statistics.pendingWithdrawals)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="text-green-600" size={18} />
                            <p className="text-xs text-gray-600">Approved</p>
                          </div>
                          <p className="text-xl font-bold text-green-600">{formatNumber(userDetails.statistics.approvedWithdrawals)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="text-red-600" size={18} />
                            <p className="text-xs text-gray-600">Rejected</p>
                          </div>
                          <p className="text-xl font-bold text-red-600">{formatNumber(userDetails.statistics.rejectedWithdrawals)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Wallet className="text-indigo-600" size={18} />
                            <p className="text-xs text-gray-600">Total Withdrawn</p>
                          </div>
                          <p className="text-xl font-bold text-indigo-600">{formatCurrency(userDetails.statistics.totalWithdrawn)}</p>
                        </div>
                      </div>
                    </div>
                    {/* App Submission Statistics */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">App Submission Statistics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Smartphone className="text-blue-600" size={18} />
                            <p className="text-xs text-gray-600">Total Submissions</p>
                          </div>
                          <p className="text-xl font-bold text-blue-600">{formatNumber(userDetails.statistics.totalAppSubmissions)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-yellow-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="text-yellow-600" size={18} />
                            <p className="text-xs text-gray-600">Pending</p>
                          </div>
                          <p className="text-xl font-bold text-yellow-600">{formatNumber(userDetails.statistics.pendingAppSubmissions)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingUp className="text-green-600" size={18} />
                            <p className="text-xs text-gray-600">Approved</p>
                          </div>
                          <p className="text-xl font-bold text-green-600">{formatNumber(userDetails.statistics.approvedAppSubmissions)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-red-200">
                          <div className="flex items-center gap-2 mb-1">
                            <TrendingDown className="text-red-600" size={18} />
                            <p className="text-xs text-gray-600">Rejected</p>
                          </div>
                          <p className="text-xl font-bold text-red-600">{formatNumber(userDetails.statistics.rejectedAppSubmissions)}</p>
                        </div>
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <div className="flex items-center gap-2 mb-1">
                            <Coins className="text-orange-600" size={18} />
                            <p className="text-xs text-gray-600">Total Earnings</p>
                          </div>
                          <p className="text-xl font-bold text-orange-600">{formatNumber(userDetails.statistics.totalEarningsFromApps)}</p>
                        </div>
                      </div>
                    </div>
                    {/* Referral Statistics */}
                    <div>
                      <h5 className="text-sm font-semibold text-gray-700 mb-3">Referral Statistics</h5>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <div className="flex items-center gap-2 mb-1">
                            <UserPlus className="text-blue-600" size={18} />
                            <p className="text-xs text-gray-600">Referral Count</p>
                          </div>
                          <p className="text-xl font-bold text-blue-600">{formatNumber(userDetails.statistics.referralCount)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Referral Information */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <UserPlus className="text-blue-600" size={20} />
                    Referral Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Referred By</p>
                      {userDetails.referredBy ? (
                        <p className="text-sm font-semibold text-indigo-600">{userDetails.referredBy}</p>
                      ) : (
                        <p className="text-sm text-gray-400">Not referred by anyone</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Withdrawal Requests */}
                {userDetails.withdrawalRequests && userDetails.withdrawalRequests.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <FileText className="text-purple-600" size={20} />
                      Withdrawal Requests ({userDetails.withdrawalRequests.length})
                    </h4>
                    <div className="space-y-3">
                      {userDetails.withdrawalRequests.map((request) => (
                        <div key={request.requestId} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Request ID</p>
                              <p className="text-sm font-mono text-gray-900">{request.requestId.substring(0, 12)}...</p>
                            </div>
                            <span className={getStatusBadge(request.status)}>{request.status}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Amount</p>
                              <p className="text-sm font-semibold text-green-600">{formatCurrency(request.amount)}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Payment Method</p>
                              <p className="text-sm font-medium text-gray-900">{request.paymentMethod}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Created At</p>
                              <p className="text-sm text-gray-900">{formatDate(request.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* App Submissions */}
                {userDetails.appSubmissions && userDetails.appSubmissions.length > 0 && (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Smartphone className="text-purple-600" size={20} />
                      App Submissions ({userDetails.appSubmissions.length})
                    </h4>
                    <div className="space-y-3">
                      {userDetails.appSubmissions.map((submission) => (
                        <div key={submission.submissionId} className="bg-white rounded-lg p-4 border border-gray-200">
                          <div className="flex items-start justify-between mb-3">
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
                                <p className="text-sm font-semibold text-gray-900">{submission.appName}</p>
                                <p className="text-xs text-gray-500">Reward: {submission.appRewardCoins} Coins</p>
                              </div>
                            </div>
                            <span className={getStatusBadge(submission.status)}>{submission.status}</span>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Submission ID</p>
                              <p className="text-xs font-mono text-gray-900">{submission.submissionId.substring(0, 12)}...</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Difficulty</p>
                              <p className="text-xs font-medium text-gray-900">{submission.appDifficulty}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Created At</p>
                              <p className="text-xs text-gray-900">{formatDate(submission.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Timestamps */}
                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <Calendar className="text-gray-600" size={20} />
                    Account Information
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {userDetails.signupTime && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <UserPlus className="text-blue-600" size={16} />
                          Signup Time
                        </p>
                        <p className="text-sm text-gray-900">{formatDate(userDetails.signupTime)}</p>
                      </div>
                    )}
                    {userDetails.lastLoginTime && (
                      <div>
                        <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                          <LogIn className="text-green-600" size={16} />
                          Last Login Time
                        </p>
                        <p className="text-sm text-gray-900">{formatDate(userDetails.lastLoginTime)}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                <p className="text-gray-500">No details available</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Edit className="text-indigo-600" size={24} />
                Edit User
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditForm({});
                  setEditError('');
                  setEditSuccess('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {editSuccess && (
              <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 flex items-center gap-3">
                <Save className="text-green-600 flex-shrink-0" size={20} />
                <p className="text-green-700 text-sm font-medium">{editSuccess}</p>
              </div>
            )}

            {editError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <X className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{editError}</p>
              </div>
            )}

            <form onSubmit={handleEditSubmit} className="space-y-6">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">User Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <input
                      type="text"
                      value={editForm.MobileNumber || ''}
                      onChange={(e) => setEditForm({ ...editForm, MobileNumber: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter mobile number"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password <span className="text-gray-500 font-normal">(leave empty to keep current)</span>
                    </label>
                    <input
                      type="password"
                      value={editForm.Password || ''}
                      onChange={(e) => setEditForm({ ...editForm, Password: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter new password (min 6 characters)"
                      minLength={6}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {editForm.Password && editForm.Password.length > 0 && editForm.Password.length < 6 ? (
                        <span className="text-red-600">Password must be at least 6 characters long</span>
                      ) : (
                        'Minimum 6 characters required. Leave empty to keep current password.'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Device ID
                    </label>
                    <input
                      type="text"
                      value={editForm.DeviceId || ''}
                      onChange={(e) => setEditForm({ ...editForm, DeviceId: e.target.value })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter device ID"
                    />
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4">Financial Information</h4>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Coins
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.Coins !== undefined ? editForm.Coins : ''}
                      onChange={(e) => setEditForm({ ...editForm, Coins: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter coins amount"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Wallet Balance
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={editForm.WalletBalance !== undefined ? editForm.WalletBalance : ''}
                      onChange={(e) => setEditForm({ ...editForm, WalletBalance: e.target.value ? Number(e.target.value) : undefined })}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter wallet balance"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditForm({});
                    setEditError('');
                    setEditSuccess('');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  disabled={editLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={18} />
                      Update User
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Block User Modal */}
      {showBlockModal && userDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Ban className="text-red-600" size={24} />
                Block User
              </h3>
              <button
                onClick={() => {
                  setShowBlockModal(false);
                  setBlockReason('');
                  setBlockError('');
                }}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            </div>

            {blockError && (
              <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-center gap-3">
                <X className="text-red-600 flex-shrink-0" size={20} />
                <p className="text-red-700 text-sm font-medium">{blockError}</p>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Are you sure you want to block <span className="font-semibold text-gray-900">{userDetails.mobileNumber}</span>?
                </p>
                <p className="text-xs text-gray-500 mb-4">
                  Blocked users will not be able to access the system.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason <span className="text-gray-500 font-normal">(optional)</span>
                </label>
                <textarea
                  value={blockReason}
                  onChange={(e) => setBlockReason(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                  placeholder="Enter reason for blocking this user..."
                  rows={4}
                />
                <p className="text-xs text-gray-500 mt-1">
                  This reason will be stored with the block record.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowBlockModal(false);
                    setBlockReason('');
                    setBlockError('');
                  }}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
                  disabled={blockLoading}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBlockUser}
                  disabled={blockLoading}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {blockLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Blocking...
                    </>
                  ) : (
                    <>
                      <Ban size={18} />
                      Block User
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
