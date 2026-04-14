import { Control, FieldError, FieldValues, Path } from "react-hook-form";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectFieldProps<T extends FieldValues = any> {
  name: Path<T>;
  label: string;
  control: Control<T>;
  error?: FieldError;
  disabled?: boolean;
  required?: boolean;
  options: SelectOption[];
  placeholder?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  loading?: boolean;
  loadingPlaceholder?: string;
}
