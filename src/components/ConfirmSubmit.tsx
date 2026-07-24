"use client";

import { useTransition } from "react";

/**
 * Bouton qui déclenche une action serveur après confirmation.
 * `action` est une server action déjà liée à ses arguments.
 */
export function ConfirmSubmit({
  action,
  message,
  label,
  className = "",
}: {
  action: () => Promise<void>;
  message: string;
  label: string;
  className?: string;
}) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(message)) start(() => action());
      }}
      className={className}
    >
      {pending ? "…" : label}
    </button>
  );
}
