import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid,
  CreditCard,
  Users,
  Shield,
  UserCheck,
  Calendar,
  Smartphone,
  Coins,
  Ticket,
  Wallet,
  RotateCcw,
  Gift,
  Clock,
  Layers,
  Megaphone,
  Headphones,
  Brain,
  Share2,
  MessageSquare,
  ShoppingBag,
} from 'lucide-react';

interface SidebarProps {
  isExpanded: boolean;
}

const Sidebar = ({ isExpanded }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
    { icon: CreditCard, label: 'Payments', path: '/payments' },
    { icon: ShoppingBag, label: 'Gift voucher requests', path: '/gift-voucher-requests' },
    { icon: Users, label: 'Users', path: '/users' },
    { icon: Smartphone, label: 'Apps Install', path: '/apps-install' },
    { icon: Megaphone, label: 'Sponsor', path: '/sponsor-promotions' },
    { icon: Headphones, label: 'Support', path: '/support-settings' },
    { icon: Megaphone, label: 'Ads Settings', path: '/ads-settings' },
    { icon: MessageSquare, label: 'Popup message', path: '/popup-message-settings' },
    { icon: Shield, label: 'Captcha Settings', path: '/captcha-settings' },
    { icon: Brain, label: 'Quiz settings', path: '/task-controls-settings' },
    { icon: Share2, label: 'Social Links', path: '/social-links-settings' },
    { icon: UserCheck, label: 'Referral Settings', path: '/referral-settings' },
    { icon: Layers, label: 'Commission Slab', path: '/commission-slab-settings' },
    { icon: Calendar, label: 'Daily Bonus Settings', path: '/daily-bonus-settings' },
    { icon: Ticket, label: 'Scratch Card Settings', path: '/scratch-card-settings' },
    { icon: Clock, label: 'New Scratch Card Settings', path: '/scratch-card-daily-limit-settings' },
    { icon: Gift, label: 'Signup Bonus', path: '/signup-bonus-settings' },
    { icon: Coins, label: 'Coin Conversion', path: '/coin-conversion' },
    { icon: Wallet, label: 'Withdrawal Settings', path: '/withdrawal-settings' },
    { icon: RotateCcw, label: 'Spin Wheel Setup', path: '/spin-wheel-settings' },
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div
      className={`h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 flex flex-col py-6 fixed left-0 top-0 transition-all duration-300 ease-in-out z-20 shadow-2xl ${isExpanded ? 'w-64' : 'w-20'
        }`}
    >
      <div className={`mb-8 ${isExpanded ? 'px-6' : 'px-4'} flex items-center ${isExpanded ? 'justify-start' : 'justify-center'}`}>
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <div className="w-4 h-4 bg-gradient-to-br from-blue-500 to-indigo-600 rounded"></div>
          </div>
        </div>
        {isExpanded && (
          <div className="ml-3 transition-opacity duration-300 opacity-100">
            <div className="text-lg font-bold text-white">ProfitKaro</div>
            <div className="text-xs text-slate-400 font-medium">Admin Panel</div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col gap-2 px-4 overflow-y-auto overflow-x-hidden pb-4 sidebar-scroll" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={index}
              onClick={() => handleNavigation(item.path)}
              className={`rounded-xl flex items-center transition-all duration-200 flex-shrink-0 ${isExpanded ? 'w-full px-4 py-3 justify-start' : 'w-12 h-12 justify-center'
                } ${isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              title={!isExpanded ? item.label : undefined}
            >
              <item.icon size={22} className="flex-shrink-0" />
              {isExpanded && (
                <span className="ml-3 text-sm font-medium transition-opacity duration-300 opacity-100">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default Sidebar;
