import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, Menu, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LogoutConfirmDialog from './LogoutConfirmDialog';

interface HeaderProps {
  isSidebarExpanded: boolean;
  onToggleSidebar: () => void;
}

const Header = ({ isSidebarExpanded, onToggleSidebar }: HeaderProps) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  return (
    <div
      className={`h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8 fixed top-0 right-0 z-10 transition-all duration-300 ease-in-out ${
        isSidebarExpanded ? 'left-64' : 'left-20'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
          aria-label="Toggle sidebar"
        >
          <Menu className="text-gray-400" size={24} />
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search"
            className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-6 rounded overflow-hidden">
            <img
              src="https://flagcdn.com/w40/gb.png"
              alt="UK"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div className="relative">
          <Bell className="text-gray-600" size={24} />
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
            2
          </span>
        </div>

        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200">
          <img
            src="https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100"
            alt="User"
            className="w-full h-full object-cover"
          />
        </div>

        <button
          onClick={() => setShowLogoutDialog(true)}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-600 hover:text-red-600"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>

      <LogoutConfirmDialog
        isOpen={showLogoutDialog}
        onClose={() => setShowLogoutDialog(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
};

export default Header;
