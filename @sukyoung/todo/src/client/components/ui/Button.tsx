import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button">;

export const Button = ({ className = "", ...props }: ButtonProps) => {
  return (
    <button
      className={`rounded-md bg-slate-950 px-3 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300 ${className}`}
      {...props}
    />
  );
};
