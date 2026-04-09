import React from 'react';

const AccountSettings = ({ theme, form, onChange, onSubmit, saving, message }) => {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Account Settings</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Update your profile information used across FOCUSYNC.
      </p>
      <form className="space-y-4" onSubmit={onSubmit}>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Full name</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => onChange('username', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 border"
            style={{ backgroundColor: theme.background, borderColor: theme.border, color: theme.text }}
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1.5" style={{ color: theme.text }}>Email address</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => onChange('email', e.target.value)}
            className="w-full rounded-xl px-3 py-2.5 border"
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
          {saving ? 'Saving...' : 'Save changes'}
        </button>
      </form>
    </section>
  );
};

export default AccountSettings;
