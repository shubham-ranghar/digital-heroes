export type WinnerVerification = "pending" | "approved" | "rejected";
export type WinnerPayment = "pending" | "paid";

export type WinnerRow = {
  id: string;
  draw_id: string;
  user_id: string;
  tier: 3 | 4 | 5;
  prize_amount: number;
  proof_url: string | null;
  verification: WinnerVerification;
  payment: WinnerPayment;
  created_at: string;
  updated_at: string;
};

export type WinnerWithDraw = WinnerRow & {
  draw_month: string;
};
