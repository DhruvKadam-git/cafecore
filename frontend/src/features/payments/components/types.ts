export type PaymentType = "Cash" | "Card" | "UPI";

export interface PaymentMethod {
  id: string;
  name: string;
  type: PaymentType;
  upiId: string;       // only used when type === "UPI"
  upiQrImage: string | null; // uploaded QR image (base64) or null
  active: boolean;
}
