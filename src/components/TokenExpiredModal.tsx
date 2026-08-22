import { AlertTriangle, LogOut } from 'lucide-react';

interface TokenExpiredModalProps {
  isOpen: boolean;
  onConfirm: () => void;
}

const TokenExpiredModal = ({ isOpen, onConfirm }: TokenExpiredModalProps) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 transform transition-all">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="text-red-600" size={32} />
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-2">Token Expired</h3>
          <p className="text-gray-600">
            Your session has expired. Please log in again to continue.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-semibold hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2"
          >
            <LogOut size={20} />
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default TokenExpiredModal;
