'use client';

import React, { useId } from 'react';
import type { LucideIcon } from 'lucide-react';
import { ChevronDown } from 'lucide-react';

/* ================================================================
   TEXT INPUT
   ================================================================ */

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  icon?: LucideIcon;
  /** Visually hide the label but keep it accessible */
  srOnlyLabel?: boolean;
}

export default function Input({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  error,
  required,
  icon: Icon,
  srOnlyLabel = false,
  className = '',
  id: externalId,
  disabled,
  ...rest
}: InputProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className={[
            'text-sm font-medium text-dust-300',
            srOnlyLabel && 'sr-only',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required && (
            <span className="text-nebula-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust-500 pointer-events-none">
            <Icon size={16} strokeWidth={1.8} />
          </span>
        )}

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={[
            'celestial-input w-full',
            'px-4 py-2.5 text-sm text-foreground placeholder:text-dust-500',
            Icon && 'pl-10',
            error
              ? 'border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : '',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        />
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-400 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

/* ================================================================
   SELECT
   ================================================================ */

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  options: SelectOption[];
  placeholder?: string;
  error?: string;
  icon?: LucideIcon;
  srOnlyLabel?: boolean;
}

export function Select({
  label,
  options,
  placeholder,
  error,
  required,
  icon: Icon,
  srOnlyLabel = false,
  className = '',
  id: externalId,
  disabled,
  ...rest
}: SelectProps) {
  const generatedId = useId();
  const id = externalId ?? generatedId;
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label
          htmlFor={id}
          className={[
            'text-sm font-medium text-dust-300',
            srOnlyLabel && 'sr-only',
          ]
            .filter(Boolean)
            .join(' ')}
        >
          {label}
          {required && (
            <span className="text-nebula-500 ml-0.5" aria-hidden="true">
              *
            </span>
          )}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dust-500 pointer-events-none">
            <Icon size={16} strokeWidth={1.8} />
          </span>
        )}

        <select
          id={id}
          required={required}
          disabled={disabled}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={[
            'celestial-input w-full appearance-none',
            'px-4 py-2.5 pr-10 text-sm text-foreground',
            Icon && 'pl-10',
            error
              ? 'border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.15)]'
              : '',
            disabled && 'opacity-50 cursor-not-allowed',
            className,
          ]
            .filter(Boolean)
            .join(' ')}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom chevron */}
        <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-dust-500 pointer-events-none">
          <ChevronDown size={16} strokeWidth={1.8} />
        </span>
      </div>

      {error && (
        <p id={errorId} className="text-xs text-red-400 mt-0.5" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
