import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin, LoginRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginRequest>({
    Email: '',
    Password: '',
  });
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await adminLogin(formData);
      login(response.token);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Panel - Illustration */}
        <div className="lg:w-3/5 bg-gradient-to-br from-purple-600 to-indigo-700 p-12 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
            <div className="absolute bottom-20 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl"></div>
          </div>
          
          {/* Illustration Placeholder - You can replace this with an actual illustration */}
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-64 h-64 mb-8 relative">
              <div className="absolute inset-0 bg-blue-400 rounded-full opacity-20 blur-2xl"></div>
              <div className="relative w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                <div className="w-48 h-48 bg-white rounded-full flex items-center justify-center">
                  <div className="w-32 h-32 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full"></div>
                </div>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-10 left-10 w-20 h-20 bg-blue-300 rounded-full opacity-30 blur-xl"></div>
            <div className="absolute bottom-10 right-10 w-24 h-24 bg-purple-300 rounded-full opacity-30 blur-xl"></div>
          </div>

          <p className="text-purple-100 text-sm mt-8 text-center max-w-md opacity-75">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </p>
        </div>

        {/* Right Panel - Login Form */}
        <div className="lg:w-2/5 bg-white p-8 lg:p-12 flex flex-col justify-center relative">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
              Welcome back
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Login your account</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div>
                <input
                  type="email"
                  name="Email"
                  value={formData.Email}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                  className="w-full px-4 py-3 border-0 border-b-2 border-gray-300 focus:border-purple-600 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="Password"
                  value={formData.Password}
                  onChange={handleChange}
                  placeholder="Password"
                  required
                  className="w-full px-4 py-3 border-0 border-b-2 border-gray-300 focus:border-purple-600 focus:outline-none transition-colors text-gray-800 placeholder-gray-400"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 rounded-xl font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div className="mt-6 flex items-center justify-between text-sm">
              <button
                onClick={() => navigate('/signup')}
                className="text-purple-600 hover:text-purple-700 font-medium transition-colors"
              >
                Create Account
              </button>
              <a
                href="#"
                className="text-purple-600 hover:text-purple-700 underline font-medium transition-colors"
              >
                Forgot Password?
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
