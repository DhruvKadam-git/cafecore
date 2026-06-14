"use client";

import React, { useState, useRef } from "react";
import { X, Banknote, CreditCard, QrCode, CheckCircle, Printer, Loader2 } from "lucide-react";

type PaymentMethodType = "cash" | "card" | "upi";

export interface PaymentCartItem {
  name: string;
  price: number;
  quantity: number;
}

interface PaymentModalProps {
  total: number;
  onClose: () => void;
  onSuccess: () => void;
  onPaySuccess: (method: string, amount: number) => Promise<void> | void;
  cartItems?: PaymentCartItem[];
  tableName?: string;
}

export function PaymentModal({ total, onClose, onSuccess, onPaySuccess, cartItems = [], tableName }: PaymentModalProps) {
  const [method, setMethod] = useState<PaymentMethodType>("cash");
  const [paid, setPaid] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paidMethod, setPaidMethod] = useState<PaymentMethodType>("cash");

  // Snapshot cart data at modal open so receipt survives even after parent clears state
  const receiptData = useRef({ items: [...cartItems], total, tableName });

  const handlePay = async () => {
    if (isProcessing) return;
    setIsProcessing(true);
    try {
      await onPaySuccess(method, total);
      setPaidMethod(method);
      setPaid(true);
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally {
      setIsProcessing(false);
    }
  };

  const methods = [
    { id: "cash" as PaymentMethodType, label: "Cash", icon: Banknote },
    { id: "card" as PaymentMethodType, label: "Card", icon: CreditCard },
    { id: "upi" as PaymentMethodType, label: "UPI", icon: QrCode },
  ];

  const handlePrintReceipt = () => {
    const rd = receiptData.current;
    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
    const timeStr = now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });

    const subtotal = rd.items.reduce((s, i) => s + i.price * i.quantity, 0);
    const tax = rd.total - subtotal;

    const itemRows = rd.items.map(item =>
      `<tr>
        <td style="padding:4px 0;text-align:left;">${item.name}</td>
        <td style="padding:4px 8px;text-align:center;">${item.quantity}</td>
        <td style="padding:4px 0;text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>`
    ).join("");

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Receipt - Brewhouse</title>
        <style>
          @media print {
            body { margin: 0; padding: 0; }
            .no-print { display: none !important; }
          }
          body {
            font-family: 'Courier New', monospace;
            max-width: 300px;
            margin: 0 auto;
            padding: 20px;
            color: #000;
          }
          .header { text-align: center; margin-bottom: 16px; }
          .header h1 { font-size: 20px; margin: 0; }
          .header p { font-size: 12px; margin: 4px 0; color: #555; }
          .divider { border-top: 1px dashed #999; margin: 12px 0; }
          table { width: 100%; font-size: 13px; border-collapse: collapse; }
          th { text-align: left; font-size: 11px; color: #555; padding-bottom: 6px; border-bottom: 1px solid #ddd; }
          th:last-child { text-align: right; }
          th:nth-child(2) { text-align: center; }
          .totals { font-size: 13px; }
          .totals .row { display: flex; justify-content: space-between; padding: 3px 0; }
          .totals .grand { font-size: 16px; font-weight: bold; border-top: 2px solid #000; padding-top: 8px; margin-top: 4px; }
          .footer { text-align: center; margin-top: 20px; font-size: 11px; color: #777; }
          .method-badge { display: inline-block; background: #f0f0f0; padding: 2px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-top: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>☕ Brewhouse</h1>
          <p>Coffee &amp; Kitchen</p>
          <p>${dateStr} · ${timeStr}</p>
          ${rd.tableName ? `<p style="font-weight:bold;margin-top:4px;">${rd.tableName}</p>` : ""}
        </div>

        <div class="divider"></div>

        <table>
          <thead>
            <tr><th>Item</th><th>Qty</th><th style="text-align:right;">Amount</th></tr>
          </thead>
          <tbody>
            ${itemRows}
          </tbody>
        </table>

        <div class="divider"></div>

        <div class="totals">
          <div class="row"><span>Subtotal</span><span>$${subtotal.toFixed(2)}</span></div>
          <div class="row"><span>Tax</span><span>$${tax.toFixed(2)}</span></div>
          <div class="row grand"><span>Total</span><span>$${rd.total.toFixed(2)}</span></div>
        </div>

        <div style="text-align:center;margin-top:12px;">
          <span>Paid via</span>
          <span class="method-badge">${paidMethod.toUpperCase()}</span>
        </div>

        <div class="footer">
          <p>Thank you for visiting Brewhouse!</p>
          <p>Have a great day ☕</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank", "width=400,height=600");
    if (printWindow) {
      printWindow.document.write(receiptHTML);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 300);
    }
  };

  if (paid) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[380px] p-8 flex flex-col items-center text-center shadow-2xl theme-transition animate-fade-in-up">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-4">
            <CheckCircle size={36} className="text-success" />
          </div>
          <h3 className="text-[20px] font-bold text-text-heading">Money Received!</h3>
          <p className="text-text-muted text-[14px] mt-2">
            Payment via <span className="font-bold text-text-heading">{paidMethod.toUpperCase()}</span> completed
          </p>
          <p className="text-[28px] font-bold text-primary mt-3">${receiptData.current.total.toFixed(2)}</p>
          <div className="flex gap-3 mt-6 w-full">
            <button
              onClick={handlePrintReceipt}
              className="flex-1 flex items-center justify-center gap-2 bg-surface hover:bg-border-custom/30 border border-border-custom text-text-heading text-[13px] font-bold py-2.5 rounded-[12px] transition-colors theme-transition"
            >
              <Printer size={15} />
              Print Receipt
            </button>
            <button onClick={onClose} className="flex-1 bg-primary hover:brightness-105 text-white text-[13px] font-bold py-2.5 rounded-[12px] transition-colors">
              New Order
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border-custom rounded-[22px] w-full max-w-[440px] shadow-2xl overflow-hidden theme-transition">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-custom">
          <div>
            <h2 className="text-[20px] font-bold text-text-heading">Payment</h2>
            <p className="text-[13px] text-text-muted mt-0.5">Total due: <span className="text-primary font-bold">${total.toFixed(2)}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-[12px] hover:bg-surface text-text-muted transition-colors theme-transition">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-5">
          {/* Method selection */}
          <div>
            <p className="text-[13px] font-semibold text-text-muted mb-3">Select Payment Method</p>
            <div className="grid grid-cols-3 gap-2">
              {methods.map(m => {
                const Icon = m.icon;
                return (
                  <button key={m.id} onClick={() => setMethod(m.id)}
                    className={`flex flex-col items-center gap-2 py-4 rounded-[14px] border-2 transition-all font-sans ${
                      method === m.id
                        ? "bg-primary border-primary text-white shadow-lg scale-[1.02]"
                        : "bg-surface border-border-custom text-text-muted hover:border-primary hover:text-text-heading"
                    }`}>
                    <Icon size={24} strokeWidth={1.75} />
                    <span className="text-[13px] font-bold">{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Amount display */}
          <div className="bg-primary/5 border border-primary/15 rounded-[16px] p-5 flex flex-col items-center gap-1">
            <span className="text-[13px] font-semibold text-text-muted">Amount to Charge</span>
            <span className="text-[32px] font-bold text-primary">${total.toFixed(2)}</span>
            <span className="text-[12px] font-medium text-text-muted mt-1">
              {method === "cash" ? "💵 Collect cash from customer" :
               method === "card" ? "💳 Swipe or tap card" :
               "📱 Customer scans QR code"}
            </span>
          </div>

          {/* Pay Button */}
          <button
            onClick={handlePay}
            disabled={isProcessing}
            className="w-full bg-primary hover:brightness-105 disabled:opacity-60 text-white text-[15px] font-bold py-3.5 rounded-[14px] transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <><Loader2 size={18} className="animate-spin" /> Processing...</>
            ) : (
              `Confirm ${method === "cash" ? "Cash" : method === "card" ? "Card" : "UPI"} Payment`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
