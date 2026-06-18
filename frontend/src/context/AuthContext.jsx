import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

// ── Manual JWT decode ─────────────────────────────────────────────────────────
// The server JWT payload is { sub: userId, email, name, iat, exp }.
// We only need to read the payload — signature verification happens server-side.
// No library needed: split on '.', base64-decode the middle segment, parse JSON.
const decodeToken = (token) => {
  try {
    const payload = token.split('.')[1];
    // atob doesn't handle URL-safe base64 — replace chars before decoding
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const isTokenExpired = (decoded) => {
  if (!decoded?.exp) return true;
  // exp is in seconds — Date.now() is in milliseconds
  return decoded.exp * 1000 < Date.now();
};

// ── Provider ──────────────────────────────────────────────────────────────────
export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true); // true until the session check below finishes

  // On mount — restore the session and confirm it's actually still valid.
  //
  // Two things happen here:
  //  1. If the access token in localStorage is still structurally valid and
  //     unexpired, restore the user from it immediately and stop "loading"
  //     right away — this is what prevents a page refresh from flashing the
  //     login page for an already-authenticated user.
  //  2. Either way, call GET /auth/me in the background to confirm against
  //     the database. The token alone can't tell you if the user was
  //     deleted or had access revoked after it was issued — only the server
  //     can. If the access token had already expired (but a refresh token
  //     is still around), this call is also what triggers axios.js's
  //     automatic silent refresh — in that case `loading` stays true until
  //     it resolves, since there's no token to optimistically trust yet.
  useEffect(() => {
    let cancelled = false;

    const restoreSession = async () => {
      const token = localStorage.getItem('token');
      const refreshToken = localStorage.getItem('refreshToken');

      if (!token && !refreshToken) {
        setLoading(false);
        return;
      }

      const decoded = token ? decodeToken(token) : null;
      if (decoded && !isTokenExpired(decoded)) {
        setUser({ userId: decoded.sub, email: decoded.email, name: decoded.name });
        setLoading(false);
      } else if (!refreshToken) {
        // No usable access token and nothing to refresh with — give up.
        localStorage.removeItem('token');
        setLoading(false);
        return;
      }
      // else: access token missing/expired but a refresh token exists —
      // stay in `loading` and let the /auth/me call below (and axios.js's
      // automatic refresh-and-retry) resolve the session.

      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser({ userId: data.userId, email: data.email, name: data.name });
      } catch {
        // Already handled: axios.js tries a refresh first, and if that also
        // fails it dispatches 'auth:unauthorized', which the listener below
        // clears the user with.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    restoreSession();
    return () => { cancelled = true; };
  }, []);

  // axios.js dispatches this when a request comes back 401 and a token
  // refresh either wasn't possible or also failed. It runs before the
  // redirect to /login, so the user state is cleared right away instead of
  // staying stale for whatever's still mounted during the moment before the
  // page navigates.
  useEffect(() => {
    const handleUnauthorized = () => setUser(null);
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // Called after a successful login — stores both tokens and updates state.
  // decodeToken() returns null for a malformed token, so guard against that
  // before reading .sub/.email off of it (otherwise this throws "Cannot read
  // properties of null").
  const login = (accessToken, refreshToken) => {
    const decoded = decodeToken(accessToken);
    if (!decoded) {
      throw new Error('Received an invalid token from the server');
    }
    localStorage.setItem('token', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    setUser({ userId: decoded.sub, email: decoded.email, name: decoded.name });
  };

  // Revokes the refresh token server-side (so it can't be used again even
  // if someone got hold of it) and clears the local session either way —
  // if the server call fails (e.g. the access token had already expired),
  // the user still gets logged out locally.
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best effort — local cleanup below still happens regardless
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────
// Usage in any component: const { user, login, logout } = useAuth();
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
