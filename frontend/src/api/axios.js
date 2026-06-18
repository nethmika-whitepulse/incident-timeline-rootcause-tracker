import axios from 'axios';

const api = axios.create({
  baseURL: '/api', // Vite proxies /api/* to localhost:5000/api/* (see vite.config.js)
});

// ── Request interceptor ───────────────────────────────────────────────────────
// Reads the JWT from localStorage and attaches it as a Bearer token on every
// outgoing request. Controllers protected by JwtAuthGuard expect this header.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// A 401 from these endpoints means "wrong email/password", not "your session
// expired" — they're hit from the public Login/Register forms before a user
// is ever authenticated, so they must NOT trigger the refresh/logout flow
// below. Without this, a failed login attempt would redirect the user back
// to /login (a hard reload of the page they're already on) instead of
// letting the form show "Invalid credentials".
const AUTH_ENDPOINTS = ['auth/login', 'auth/register'];
const isAuthEndpoint = (url = '') => AUTH_ENDPOINTS.some((path) => url.includes(path));

// The access token is short-lived (15m) by design — the backend issues a
// refresh token alongside it (see auth.service.ts) and sessions stay alive
// by silently exchanging it for a new pair via POST /auth/refresh instead of
// forcing a re-login every 15 minutes.
//
// These track an in-flight refresh so that if several requests 401 around
// the same time, only one refresh call goes out and the rest queue up and
// wait for it rather than each firing their own.
let isRefreshing = false;
let pendingQueue = [];

const resolveQueue = (error) => {
  pendingQueue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve()));
  pendingQueue = [];
};

// Nothing left to try — either there's no refresh token, or the refresh
// token itself was rejected (expired/revoked). Clear everything, tell
// AuthContext to drop its in-memory user immediately (window.location.href
// doesn't unload the page synchronously, so anything still mounted in that
// gap would otherwise keep rendering as "logged in"), then send the user to
// login.
const forceLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  window.dispatchEvent(new Event('auth:unauthorized'));
  window.location.href = '/login';
};

// ── Response interceptor ──────────────────────────────────────────────────────
// On a 401 from an authenticated request, the access token has expired or is
// otherwise invalid. Try to silently exchange the refresh token for a new
// pair and retry the original request once; only if that fails too
// (refresh token also expired/revoked) does this fall back to a full logout.
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status !== 401 || isAuthEndpoint(originalRequest?.url)) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem('refreshToken');

    // Already retried once after a refresh and still unauthorized, or
    // there's no refresh token to try in the first place — nothing left to
    // do but log out.
    if (originalRequest._retry || !refreshToken) {
      forceLogout();
      return Promise.reject(error);
    }

    if (isRefreshing) {
      // A refresh is already in flight for another request — wait for it
      // instead of firing a second one, then retry this request.
      return new Promise((resolve, reject) => {
        pendingQueue.push({ resolve, reject });
      }).then(() => {
        originalRequest._retry = true;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // Plain axios here, not the `api` instance — this call must not run
      // through these same interceptors, or a failed refresh would
      // recursively try to refresh again.
      const { data } = await axios.post('/api/auth/refresh', { refresh_token: refreshToken });
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('refreshToken', data.refresh_token);
      resolveQueue(null);
      return api(originalRequest);
    } catch (refreshError) {
      resolveQueue(refreshError);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
