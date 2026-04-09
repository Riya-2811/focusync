import React from 'react';

const SettingsSidebar = ({ sections, activeSection, onChange, theme }) => {
  return (
    <aside
      className="w-full lg:w-72 rounded-2xl p-3 h-fit sticky top-24"
      style={{ backgroundColor: theme.accent, border: `1px solid ${theme.border}` }}
    >
      <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide" style={{ color: theme.text, opacity: 0.75 }}>
        Settings
      </p>
      <nav className="space-y-1" aria-label="Settings sections">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            onClick={() => onChange(section.id)}
            className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
            style={
              activeSection === section.id
                ? { backgroundColor: theme.primary, color: 'white' }
                : { color: theme.text, backgroundColor: 'transparent' }
            }
          >
            <span className="mr-2" aria-hidden>{section.icon}</span>
            {section.label}
          </button>
        ))}
      </nav>
    </aside>
  );
};

export default SettingsSidebar;
