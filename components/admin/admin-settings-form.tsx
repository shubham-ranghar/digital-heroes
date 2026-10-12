"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError } from "@/components/auth/form-message";
import { changePasswordAction } from "@/lib/auth/password-actions";
import { updateDisplayNameAction } from "@/lib/profile/actions";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RevealStagger, RevealStaggerItem } from "@/components/motion/reveal";

type AdminSettingsFormProps = {
  email: string;
  displayName: string | null;
};

export function AdminSettingsForm({ email, displayName }: AdminSettingsFormProps) {
  const [name, setName] = useState(displayName ?? "");
  const [nameError, setNameError] = useState<string | null>(null);
  const [isNamePending, startNameTransition] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();

  function handleSaveName() {
    setNameError(null);
    startNameTransition(async () => {
      const result = await updateDisplayNameAction({ displayName: name });
      if (!result.ok) {
        setNameError(result.fieldErrors?.displayName ?? result.message);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  function handleChangePassword(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPasswordError(null);
    const form = event.currentTarget;
    const formData = new FormData(form);
    startPasswordTransition(async () => {
      const result = await changePasswordAction(formData);
      if (!result.ok) {
        setPasswordError(
          result.fieldErrors?.confirmPassword ??
            result.fieldErrors?.password ??
            result.message ??
            "Could not update password",
        );
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
      form.reset();
    });
  }

  return (
    <RevealStagger trigger="mount" stagger={0.06} className="space-y-10">
      <RevealStaggerItem fast>
        <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6 shadow-[var(--shadow-resting)]">
          <h2 className="font-sans text-lg font-semibold text-navy">Profile</h2>
          <div className="space-y-1">
            <p className="text-sm text-slate">Email</p>
            <p className="break-all text-sm font-medium text-navy">{email}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-slate">Role</p>
            <p className="text-sm font-medium text-navy">Admin</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm text-slate" htmlFor="admin-settings-display-name">
              Display name
            </label>
            <Input
              id="admin-settings-display-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              autoComplete="name"
            />
            <FieldError message={nameError ?? undefined} />
          </div>
          <Button
            type="button"
            size="sm"
            className="w-full sm:w-auto"
            disabled={name === (displayName ?? "")}
            loading={isNamePending}
            onClick={handleSaveName}
          >
            {isNamePending ? "Saving…" : "Save name"}
          </Button>
        </section>
      </RevealStaggerItem>

      <RevealStaggerItem fast>
        <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6 shadow-[var(--shadow-resting)]">
          <h2 className="font-sans text-lg font-semibold text-navy">Password</h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-settings-new-password">New password</Label>
              <PasswordInput
                id="admin-settings-new-password"
                name="password"
                autoComplete="new-password"
                disabled={isPasswordPending}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="admin-settings-confirm-password">Confirm password</Label>
              <PasswordInput
                id="admin-settings-confirm-password"
                name="confirmPassword"
                autoComplete="new-password"
                disabled={isPasswordPending}
                required
              />
            </div>
            <FieldError message={passwordError ?? undefined} />
            <Button
              type="submit"
              size="sm"
              className="w-full sm:w-auto"
              loading={isPasswordPending}
            >
              {isPasswordPending ? "Updating…" : "Update password"}
            </Button>
          </form>
        </section>
      </RevealStaggerItem>
    </RevealStagger>
  );
}
