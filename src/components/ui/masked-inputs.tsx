"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  maskPhone,
  maskCnpj,
  maskCurrency,
  normalizeCurrency,
  currencyFromNumber,
  maskPercent,
  normalizePercent,
  onlyDigits,
  maskInteger,
} from "@/lib/masks";

// ─── Base Styles ────────────────────────────────────────────────────────────

const baseInputClasses =
  "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive";

// ─── PhoneInput ─────────────────────────────────────────────────────────────

interface MaskedInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: string;
  onValueChange?: (rawValue: string) => void;
}

export const PhoneInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, value = "", onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value ? maskPhone(value) : ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value ? maskPhone(value) : "");
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = onlyDigits(e.target.value).slice(0, 11);
      const masked = maskPhone(raw);
      setDisplayValue(masked);
      onValueChange?.(raw);
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const raw = onlyDigits(pasted).slice(0, 11);
      const masked = maskPhone(raw);
      setDisplayValue(masked);
      onValueChange?.(raw);
    }

    return (
      <input
        ref={ref}
        type="tel"
        inputMode="numeric"
        data-slot="input"
        className={cn(baseInputClasses, className)}
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="(00) 00000-0000"
        {...props}
      />
    );
  }
);
PhoneInput.displayName = "PhoneInput";

// ─── CnpjInput ──────────────────────────────────────────────────────────────

export const CnpjInput = React.forwardRef<HTMLInputElement, MaskedInputProps>(
  ({ className, value = "", onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value ? maskCnpj(value) : ""
    );

    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(value ? maskCnpj(value) : "");
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = onlyDigits(e.target.value).slice(0, 14);
      const masked = maskCnpj(raw);
      setDisplayValue(masked);
      onValueChange?.(raw);
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const raw = onlyDigits(pasted).slice(0, 14);
      const masked = maskCnpj(raw);
      setDisplayValue(masked);
      onValueChange?.(raw);
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        data-slot="input"
        className={cn(baseInputClasses, className)}
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        placeholder="00.000.000/0000-00"
        {...props}
      />
    );
  }
);
CnpjInput.displayName = "CnpjInput";

// ─── CurrencyInput ──────────────────────────────────────────────────────────

interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onValueChange?: (numericValue: number) => void;
}

export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value && value > 0 ? currencyFromNumber(value) : ""
    );

    React.useEffect(() => {
      if (value !== undefined && value > 0) {
        setDisplayValue(currencyFromNumber(value));
      } else if (value === 0 || value === undefined) {
        // Não resetar se o usuário está digitando
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = onlyDigits(e.target.value);
      if (raw === "" || raw === "0") {
        setDisplayValue("");
        onValueChange?.(0);
        return;
      }
      const masked = maskCurrency(raw);
      setDisplayValue(masked);
      onValueChange?.(normalizeCurrency(raw));
    }

    function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
      e.preventDefault();
      const pasted = e.clipboardData.getData("text");
      const raw = onlyDigits(pasted);
      if (raw === "") return;
      const masked = maskCurrency(raw);
      setDisplayValue(masked);
      onValueChange?.(normalizeCurrency(raw));
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      // Permitir: backspace, delete, tab, escape, enter, arrows
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ];
      if (allowedKeys.includes(e.key)) return;
      // Bloquear tudo que não é dígito
      if (!/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        data-slot="input"
        className={cn(baseInputClasses, className)}
        value={displayValue}
        onChange={handleChange}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        placeholder="R$ 0,00"
        {...props}
      />
    );
  }
);
CurrencyInput.displayName = "CurrencyInput";

// ─── PercentInput ───────────────────────────────────────────────────────────

interface PercentInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onValueChange?: (numericValue: number) => void;
}

export const PercentInput = React.forwardRef<HTMLInputElement, PercentInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value && value > 0 ? value.toString().replace(".", ",") : ""
    );

    React.useEffect(() => {
      if (value !== undefined && value > 0) {
        setDisplayValue(value.toString().replace(".", ","));
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const masked = maskPercent(e.target.value);
      setDisplayValue(masked);
      onValueChange?.(normalizePercent(masked));
    }

    return (
      <div className="relative">
        <input
          ref={ref}
          type="text"
          inputMode="decimal"
          data-slot="input"
          className={cn(baseInputClasses, "pr-8", className)}
          value={displayValue}
          onChange={handleChange}
          placeholder="0,00"
          {...props}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400">
          %
        </span>
      </div>
    );
  }
);
PercentInput.displayName = "PercentInput";

// ─── IntegerInput ───────────────────────────────────────────────────────────

interface IntegerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value"> {
  value?: number;
  onValueChange?: (numericValue: number) => void;
}

export const IntegerInput = React.forwardRef<HTMLInputElement, IntegerInputProps>(
  ({ className, value, onValueChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState(() =>
      value && value > 0 ? value.toString() : ""
    );

    React.useEffect(() => {
      if (value !== undefined && value > 0) {
        setDisplayValue(value.toString());
      }
    }, [value]);

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = maskInteger(e.target.value);
      setDisplayValue(raw);
      onValueChange?.(raw ? parseInt(raw, 10) : 0);
    }

    function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
      const allowedKeys = [
        "Backspace",
        "Delete",
        "Tab",
        "Escape",
        "Enter",
        "ArrowLeft",
        "ArrowRight",
        "Home",
        "End",
      ];
      if (allowedKeys.includes(e.key)) return;
      // Bloquear ponto, vírgula, "e", letras
      if (!/^\d$/.test(e.key) && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
      }
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        data-slot="input"
        className={cn(baseInputClasses, className)}
        value={displayValue}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        {...props}
      />
    );
  }
);
IntegerInput.displayName = "IntegerInput";
