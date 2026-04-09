import React from 'react';

const DangerZone = ({ theme, onExportData, onClearHistory, onDeleteAccount, message, busy }) => {
  return (
    <section className="rounded-2xl p-6" style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}>
      <h2 className="text-xl font-semibold mb-1" style={{ color: theme.primary }}>Data & Privacy</h2>
      <p className="text-sm mb-5" style={{ color: theme.text, opacity: 0.8 }}>
        Export or remove your data. Account deletion is permanent.
      </p>

      <div className="flex flex-wrap gap-3 mb-5">
        <button type="button" onClick={onExportData} className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90" style={{ backgroundColor: theme.primary }}>
          Export user data
        </button>
        <button type="button" onClick={onClearHistory} disabled={busy} className="px-4 py-2 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 disabled:opacity-60" style={{ backgroundColor: theme.background, border: `1px solid ${theme.border}`, color: theme.text }}>
          {busy ? 'Clearing...' : 'Clear productivity history'}
        </button>
      </div>

      <div className="rounded-xl p-4" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
        <h3 className="font-semibold mb-1" style={{ color: '#b91c1c' }}>Danger Zone</h3>
        <p className="text-sm mb-3" style={{ color: '#991b1b' }}>
          Deleting your account removes your profile and cannot be undone.
        </p>
        <button
          type="button"
          onClick={onDeleteAccount}
          className="px-4 py-2 rounded-xl text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: '#dc2626' }}
        >
          Delete account
        </button>
      </div>

      {message && (
        <div className="text-sm rounded-lg px-3 py-2 mt-4" style={{ backgroundColor: message.type === 'error' ? '#fee2e2' : '#dcfce7', color: message.type === 'error' ? '#b91c1c' : '#166534' }}>
          {message.text}
        </div>
      )}
    </section>
  );
};

export default DangerZone;
