import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../../store/useAuthStore';
import { Wine } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await login(email, password);
    // After login, we rely on the protected route to either let them through or kick them out.
    // If successful, navigate to admin index
    navigate('/admin');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 font-outfit">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-admin-deep-forest text-white">
            <Wine className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">9/10 Mart Admin</h1>
          <p className="mt-2 text-sm text-slate-500">Sign in to manage the store</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-admin-deep-forest focus:ring-1 focus:ring-admin-deep-forest"
              placeholder="admin@910mart.com"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-4 py-2.5 outline-none transition-colors focus:border-admin-deep-forest focus:ring-1 focus:ring-admin-deep-forest"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="mt-6 w-full rounded-lg bg-admin-deep-forest py-3 text-sm font-semibold text-white transition-colors hover:bg-admin-deep-forest/90 disabled:opacity-50"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
