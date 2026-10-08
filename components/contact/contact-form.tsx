"use client";

import { useState, useTransition } from "react";

import { FieldError, FormError, FormSuccess } from "@/components/auth/form-message";
import { submitContactMessageAction } from "@/lib/contact/actions";
import type { ContactActionResult } from "@/lib/contact/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ContactForm() {
  const [result, setResult] = useState<ContactActionResult | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const form = event.currentTarget;
    startTransition(async () => {
      const response = await submitContactMessageAction(formData);
      setResult(response);
      if (response.ok) {
        form.reset();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4" noValidate>
      <FormError message={result?.ok === false ? result.message : undefined} />
      <FormSuccess message={result?.ok ? result.message : undefined} />

      <div className="space-y-2">
        <Label htmlFor="contact-name">Name</Label>
        <Input
          id="contact-name"
          name="name"
          autoComplete="name"
          required
          disabled={isPending}
          aria-invalid={Boolean(result && !result.ok && result.fieldErrors?.name)}
        />
        <FieldError
          message={result && !result.ok ? result.fieldErrors?.name : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-email">Email</Label>
        <Input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          disabled={isPending}
          aria-invalid={Boolean(result && !result.ok && result.fieldErrors?.email)}
        />
        <FieldError
          message={result && !result.ok ? result.fieldErrors?.email : undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="contact-message">Message</Label>
        <textarea
          id="contact-message"
          name="message"
          required
          disabled={isPending}
          rows={5}
          className="w-full rounded-xl border border-input bg-surface px-3 py-2 text-sm text-on-surface outline-none placeholder:text-muted-on-surface focus-visible:border-coral focus-visible:ring-2 focus-visible:ring-coral/50"
          aria-invalid={Boolean(result && !result.ok && result.fieldErrors?.message)}
        />
        <FieldError
          message={result && !result.ok ? result.fieldErrors?.message : undefined}
        />
      </div>

      <Button type="submit" className="w-full sm:w-auto" loading={isPending}>
        {isPending ? "Sending…" : "Send message"}
      </Button>
    </form>
  );
}
