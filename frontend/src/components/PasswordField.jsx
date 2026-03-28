import React, { useState } from 'react';

function EyeOpen({ color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOff({ color }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <line x1="2" y1="2" x2="22" y2="22" />
    </svg>
  );
}

/**
 * Password input with visibility toggle (eye icon).
 */
export default function PasswordField({
  value,
  onChange,
  placeholder,
  disabled,
  className = '',
  style,
  onFocus,
  onBlur,
  iconColor = '#64748b',
  autoComplete = 'current-password',
}) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full p-3 pr-11 rounded-lg border-2 transition-colors focus:outline-none placeholder:opacity-60 ${className}`}
        style={style}
        onFocus={onFocus}
        onBlur={onBlur}
        disabled={disabled}
      />
      <button
        type="button"
        className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400/50 focus-visible:ring-offset-1 disabled:opacity-40"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        disabled={disabled}
      >
        {show ? <EyeOff color={iconColor} /> : <EyeOpen color={iconColor} />}
      </button>
    </div>
  );
}
