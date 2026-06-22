import { useState, useEffect }   from 'react';
import { Link, useNavigate }     from 'react-router-dom';
import { useAuth }               from '../context/AuthContext';
import api                       from '../api/axios';
import { getErrorMessage }       from '../utils/helpers';

import AppLogo from '../components/AppLogo';

export default function Register() {
  const { user }                    = useAuth();
  const navigate                    = useNavigate();
  const [form, setForm]             = useState({ name: '', email: '', password: '' });
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);
  const [loading, setLoading]       = useState(false);
  const [showPass, setShowPass]     = useState(false);

  // Redirect already-authenticated users to the dashboard — must run in
  // useEffect, not in the render body, since navigate() is a side effect.
  useEffect(() => {
    if (user) navigate('/', { replace: true });
  }, [user, navigate]);

  // After a successful registration, redirect to /login after 2 seconds so
  // the user can read the confirmation. The cleanup function cancels the
  // timer if the component unmounts first (e.g. the user clicks "Sign in"
  // manually before the delay finishes) — prevents a setTimeout leak and a
  // "can't update state on an unmounted component" warning.
  useEffect(() => {
    if (!success) return;
    const timer = setTimeout(() => navigate('/login'), 2000);
    return () => clearTimeout(timer);
  }, [success, navigate]);

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', form);
      setSuccess(true);
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

        <div className="card">
          {success ? (
            /* ── Success state ─────────────────────────────────────────────── */
            <div className="flex flex-col items-center py-4 gap-3 text-center">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center border border-green-100">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor"
                  strokeWidth="2.5" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">Account created</p>
                <p className="text-xs text-gray-400 mt-0.5">Redirecting to sign in…</p>
              </div>
            </div>
          ) : (
            /* ── Registration form ─────────────────────────────────────────── */
            <>
              <p className="text-sm text-gray-500 mb-5">
                Create your account to get started
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">

                {error && (
                  <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl">
                    {error}
                  </div>
                )}

                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="input"
                    placeholder="Jane Smith"
                    required
                    minLength={2}
                    autoComplete="name"
                    autoFocus
                  />
                </div>

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
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                    <span className="text-gray-400 font-normal ml-1">
                      (min. 8 characters)
                    </span>
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
                      minLength={8}
                      autoComplete="new-password"
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
                  {loading ? 'Creating account…' : 'Create account'}
                </button>

              </form>
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-400 mt-6">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-gray-700 font-medium hover:text-gray-900 transition-colors underline-offset-2 hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
}
