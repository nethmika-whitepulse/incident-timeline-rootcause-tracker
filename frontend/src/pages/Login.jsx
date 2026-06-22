import { useState, useEffect }   from 'react';
import { Link, useNavigate }     from 'react-router-dom';
import { useAuth }               from '../context/AuthContext';
import api                       from '../api/axios';
import { getErrorMessage }       from '../utils/helpers';

import AppLogo from '../components/AppLogo';

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Login() {
  const { login, user }           = useAuth();
  const navigate                  = useNavigate();
  const [form, setForm]           = useState({ email: '', password: '' });
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);
  const [showPass, setShowPass]   = useState(false);

  // Redirect already-authenticated users to the dashboard. This must run in
  // useEffect, not directly in the render body — calling navigate() during
  // render is a side effect and breaks React's rules of render (and causes
  // double-invocation issues under Strict Mode).
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      // AuthContext.login stores both tokens and decodes name from the payload
      login(data.access_token, data.refresh_token);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        <AppLogo />

        {/* Card */}
        <div className="card">
          <p className="text-sm text-gray-500 mb-5">
            Sign in to your workspace
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error banner */}
            {error && (
              <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input"
                placeholder="you@example.com"
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="input pr-14"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 transition-colors px-1"
                  tabIndex={-1}
                >
                  {showPass ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-1"
            >
              {loading && (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              )}
              {loading ? 'Signing in…' : 'Sign in'}
            </button>

          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-400 mt-6">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-gray-700 font-medium hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
          >
            Create one
          </Link>
        </p>

      </div>
    </div>
  );
}
