import { cn } from "@/lib/utils";
import { AlertCircle } from "lucide-react";

interface FormFieldProps {
  label: string;
  required?: boolean;
  help?: string;
  error?: string;
  htmlFor?: string;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  required,
  help,
  error,
  htmlFor,
  className,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={htmlFor}
        className="block text-sm font-medium text-charcoal"
      >
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>

      {children}

      {error && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600">
          <AlertCircle className="h-3 w-3 shrink-0" />
          {error}
        </p>
      )}

      {help && !error && (
        <p className="text-xs text-muted">{help}</p>
      )}
    </div>
  );
}

/* Consistent input class string for use throughout admin forms */
export const inputStyles = cn(
  "w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-charcoal",
  "placeholder:text-muted/50",
  "transition-colors duration-150",
  "focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/10",
  "disabled:cursor-not-allowed disabled:bg-surface disabled:text-muted"
);

export const selectStyles = cn(inputStyles, "appearance-none bg-white pr-10");
