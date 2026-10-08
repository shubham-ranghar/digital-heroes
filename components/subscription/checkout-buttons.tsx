import { BillingManageButtons } from "@/components/subscription/billing-manage-buttons";

type CheckoutButtonsProps = {
  showManage?: boolean;
  cancelAtPeriodEnd?: boolean;
};

/** @deprecated Use BillingManageButtons — kept for existing imports. */
export function CheckoutButtons({
  showManage = false,
  cancelAtPeriodEnd = false,
}: CheckoutButtonsProps) {
  return (
    <BillingManageButtons
      showManage={showManage}
      cancelAtPeriodEnd={cancelAtPeriodEnd}
    />
  );
}
