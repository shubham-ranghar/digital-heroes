"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";

import { FieldError, FormError } from "@/components/auth/form-message";
import { CheckoutButtons } from "@/components/subscription/checkout-buttons";
import { SubscriptionAccessPill } from "@/components/subscription/subscription-access-pill";
import { getSubscriptionAccessLabel } from "@/lib/subscription/grants";
import type { SubscriptionStatus } from "@/lib/subscription/types";
import { changePasswordAction } from "@/lib/auth/password-actions";
import { requestAccountDeletionAction } from "@/lib/profile/deletion-actions";
import {
  updateDisplayNameAction,
  updateProfileCharityAction,
} from "@/lib/profile/actions";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import type { CharityOption } from "@/components/auth/signup-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

type SettingsFormProps = {
  email: string;
  displayName: string | null;
  charityId: string | null;
  charityPercentage: number;
  charities: CharityOption[];
  hasBillingSubscription: boolean;
  cancelAtPeriodEnd: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  renewalDate: string | null;
  hasSubscriptionAccess: boolean;
};

export function SettingsForm({
  email,
  displayName,
  charityId,
  charityPercentage,
  charities,
  hasBillingSubscription,
  cancelAtPeriodEnd,
  subscriptionStatus,
  renewalDate,
  hasSubscriptionAccess,
}: SettingsFormProps) {
  const membershipLabel = getSubscriptionAccessLabel(
    subscriptionStatus
      ? {
          status: subscriptionStatus,
          renewal_date: renewalDate,
          cancel_at_period_end: cancelAtPeriodEnd,
        }
      : null,
    hasSubscriptionAccess,
  );
  const [name, setName] = useState(displayName ?? "");
  const [selectedCharityId, setSelectedCharityId] = useState(
    charityId ?? charities[0]?.id ?? "",
  );
  const [percentage, setPercentage] = useState(charityPercentage);
  const [nameError, setNameError] = useState<string | null>(null);
  const [charityError, setCharityError] = useState<string | null>(null);
  const [isNamePending, startNameTransition] = useTransition();
  const [isCharityPending, startCharityTransition] = useTransition();
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isPasswordPending, startPasswordTransition] = useTransition();
  const [isDeletePending, startDeleteTransition] = useTransition();

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

  function handleDeletionRequest() {
    startDeleteTransition(async () => {
      const result = await requestAccountDeletionAction();
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  function handleSaveCharity() {
    setCharityError(null);
    startCharityTransition(async () => {
      const result = await updateProfileCharityAction({
        charityId: selectedCharityId,
        percentage,
      });
      if (!result.ok) {
        setCharityError(result.message);
        toast.error(result.message);
        return;
      }
      toast.success(result.message);
    });
  }

  return (
    <div className="space-y-10">
      <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6">
        <h2 className="font-sans text-lg font-semibold text-navy">Profile</h2>
        <div className="space-y-2">
          <label className="text-sm text-slate" htmlFor="settings-email">
            Email
          </label>
          <Input id="settings-email" value={email} readOnly disabled />
        </div>
        <div className="space-y-2">
          <label className="text-sm text-slate" htmlFor="settings-display-name">
            Display name
          </label>
          <Input
            id="settings-display-name"
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
          disabled={isNamePending || name === (displayName ?? "")}
          onClick={handleSaveName}
        >
          {isNamePending ? "Saving…" : "Save name"}
        </Button>
      </section>

      <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6">
        <h2 className="font-sans text-lg font-semibold text-navy">Your charity</h2>
        {charities.length === 0 ? (
          <FormError message="No charities are available. Check back later." />
        ) : (
          <>
            <div className="space-y-2">
              <span className="text-sm text-slate">Partner cause</span>
              <Select
                value={selectedCharityId}
                onValueChange={(value) => setSelectedCharityId(value ?? "")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Choose a cause" />
                </SelectTrigger>
                <SelectContent>
                  {charities.map((charity) => (
                    <SelectItem key={charity.id} value={charity.id}>
                      {charity.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm text-slate">Share of subscription</span>
                <span className="font-sans text-2xl text-coral">{percentage}%</span>
              </div>
              <Slider
                min={10}
                max={100}
                step={1}
                value={[percentage]}
                onValueChange={(value) => {
                  const next = Array.isArray(value) ? value[0] : value;
                  setPercentage(next ?? 10);
                }}
                disabled={isCharityPending}
                aria-label="Charity contribution percentage"
              />
              <p className="text-xs text-muted-foreground">
                Minimum 10% of each billing cycle goes to your chosen charity.
              </p>
            </div>
            <FieldError message={charityError ?? undefined} />
            <Button
              type="button"
              size="sm"
              className="w-full sm:w-auto"
              disabled={
                isCharityPending ||
                (selectedCharityId === (charityId ?? "") &&
                  percentage === charityPercentage)
              }
              onClick={handleSaveCharity}
            >
              {isCharityPending ? "Saving…" : "Save charity"}
            </Button>
          </>
        )}
      </section>

      {hasBillingSubscription ? (
        <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6">
          <h2 className="font-sans text-lg font-semibold text-navy">Billing</h2>
          <SubscriptionAccessPill label={membershipLabel} />
          <p className="text-sm text-muted-foreground">
            {cancelAtPeriodEnd
              ? "Your plan stays active until the cancellation date. Resume below to keep billing."
              : "Cancel at the end of your current billing period. Access continues until then."}
          </p>
          <CheckoutButtons
            showManage
            cancelAtPeriodEnd={cancelAtPeriodEnd}
          />
        </section>
      ) : null}

      <section className="space-y-4 rounded-[20px] border border-line bg-surface p-6">
        <h2 className="font-sans text-lg font-semibold text-navy">Password</h2>
        <form onSubmit={handleChangePassword} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="settings-new-password">New password</Label>
            <PasswordInput
              id="settings-new-password"
              name="password"
              autoComplete="new-password"
              disabled={isPasswordPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="settings-confirm-password">Confirm password</Label>
            <PasswordInput
              id="settings-confirm-password"
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
            disabled={isPasswordPending}
          >
            {isPasswordPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </section>

      <section className="space-y-4 rounded-[20px] border border-dashed border-status-danger/40 bg-status-danger/5 p-6">
        <h2 className="font-sans text-lg font-semibold text-navy">Delete account</h2>
        <p className="text-sm text-muted-foreground">
          Request permanent deletion. We review each request manually; your subscription
          should be cancelled first.
        </p>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          className="w-full sm:w-auto"
          disabled={isDeletePending}
          onClick={handleDeletionRequest}
        >
          {isDeletePending ? "Submitting…" : "Request account deletion"}
        </Button>
      </section>
    </div>
  );
}
