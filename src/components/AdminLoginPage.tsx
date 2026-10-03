import React, { useState } from 'react';
import { Lock, Mail, Eye, EyeOff, AlertCircle, ArrowLeft, KeyRound } from 'lucide-react';
import { loginAdmin, AUTHORIZED_ADMIN_EMAILS } from '../lib/firebase';

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  onBackToHome?: () => void;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({
  onLoginSuccess,
  onBackToHome,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotNotice, setShowForgotNotice] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await loginAdmin(email, password);
      setIsLoading(false);
      onLoginSuccess();
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Incorrect email address or password. Please verify your credentials and try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-[#FAF7F2]">
      <div className="w-full max-w-md">
        
        {/* Subtle Back link to storefront */}
        {onBackToHome && (
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-[#5A1224] hover:text-[#7A1C33] font-semibold mb-6 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Storefront</span>
          </button>
        )}

        {/* Card */}
        <div className="bg-white rounded-3xl border border-[#E8DDD2] shadow-xl p-7 sm:p-9 text-left relative overflow-hidden">
          {/* Subtle gold top border accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#5A1224] via-[#C59E3F] to-[#5A1224]" />

          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-2xl bg-[#FAF3EC] border border-[#E8DDD2] flex items-center justify-center mx-auto mb-3 text-[#5A1224] shadow-xs">
              <Lock className="w-5 h-5 text-[#C59E3F]" />
            </div>
            
            <p
              className="text-xs uppercase tracking-[0.25em] text-[#8C7A6B] font-bold"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              SUPERWOMAN'S HUB
            </p>
            
            <h1
              className="text-2xl sm:text-3xl font-serif font-bold text-[#5A1224] mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Admin Portal
            </h1>
            
            <p className="text-xs text-[#6B5E57] mt-1.5 leading-relaxed">
              Sign in to manage your store products, orders, and settings.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FDEDEC] border border-[#F5C2C7] flex items-start gap-2.5 text-xs text-[#842029]">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#B02A37]" />
              <div className="leading-snug">{error}</div>
            </div>
          )}

          {/* Forgot Password Helper Box */}
          {showForgotNotice && (
            <div className="mb-6 p-3.5 rounded-xl bg-[#FAF3EC] border border-[#E8DDD2] text-xs text-[#5A1224] flex items-start gap-2.5">
              <KeyRound className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#C59E3F]" />
              <div className="leading-relaxed">
                <span className="font-semibold block mb-0.5">Admin Access Help</span>
                Use any designated administrator email:
                <ul className="mt-1 list-disc list-inside space-y-0.5 font-medium text-[#2D2825]">
                  {AUTHORIZED_ADMIN_EMAILS.map((adminEmail) => (
                    <li key={adminEmail}>
                      <button
                        type="button"
                        onClick={() => setEmail(adminEmail)}
                        className="text-[#5A1224] hover:underline"
                      >
                        {adminEmail}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#47403B] mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. tessybest180@gmail.com"
                  autoComplete="email"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D9C8BA] text-sm text-[#2D2825] focus:outline-none focus:border-[#5A1224] focus:ring-1 focus:ring-[#5A1224] transition-all placeholder:text-[#A89A8E]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#47403B]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotNotice(!showForgotNotice)}
                  className="text-[11px] text-[#5A1224] hover:text-[#C59E3F] hover:underline transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#8C7A6B]">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-[#FAF7F2] border border-[#D9C8BA] text-sm text-[#2D2825] focus:outline-none focus:border-[#5A1224] focus:ring-1 focus:ring-[#5A1224] transition-all placeholder:text-[#A89A8E]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-[#8C7A6B] hover:text-[#5A1224] transition-colors cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-full bg-[#5A1224] hover:bg-[#721830] text-[#FAF7F2] text-xs font-semibold uppercase tracking-wider shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying...</span>
                  </div>
                ) : (
                  <span>Sign In to Admin Portal</span>
                )}
              </button>
            </div>
          </form>

          {/* Footer Notice */}
          <div className="mt-7 pt-5 border-t border-[#F0E6DC] flex items-center justify-between text-[11px] text-[#8C7A6B]">
            <span>Superwoman's Hub Admin</span>
            <span>Private Portal</span>
          </div>

        </div>

      </div>
    </div>
  );
};
