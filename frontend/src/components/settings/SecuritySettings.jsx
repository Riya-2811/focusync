import React from 'react';
import PasswordField from '../PasswordField';

const SecuritySettings = ({ theme, form, onChange, onSubmit, saving, message }) => {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Password & Security</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Change your password regularly to keep your account secure.
      </p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Current password</label>
          <PasswordField
            value={form.currentPassword}
            onChange={(e) => onChange('currentPassword', e.target.value)}
            placeholder="Current password"
            iconColor={theme.text}
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>New password</label>
          <PasswordField
            value={form.newPassword}
            onChange={(e) => onChange('newPassword', e.target.value)}
            placeholder="Minimum 8 characters"
            iconColor={theme.text}
            autoComplete="new-password"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Confirm new password</label>
          <PasswordField
            value={form.confirmPassword}
            onChange={(e) => onChange('confirmPassword', e.target.value)}
            placeholder="Re-enter new password"
            iconColor={theme.text}
            autoComplete="new-password"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
          />
        </div>
        {message && (
          <div className="text-sm rounded-lg px-3 py-2" style={{ backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#b91c1c' : '#166534' }}>
            {message.text}
          </div>
        )}
        <button
          type="submit"
          disabled={saving}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: theme.primary }}
        >
          {saving ? 'Updating...' : 'Update password'}
        </button>
      </form>
    </section>
  );
};

export default SecuritySettings;
