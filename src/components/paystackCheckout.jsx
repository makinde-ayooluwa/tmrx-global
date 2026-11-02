import React from 'react';
import { usePaystackPayment } from 'react-paystack';

const PaystackCheckout = ({ email, amountInNaira, onSuccessCallback }) => {
  // Paystack expects the amount in kobo (multiply Naira by 100)
  const config = {
    reference: `TX_TMRX_GLOBAL-${(new Date()).getTime().toString()}`,
    email: email,
    amount: Math.round(amountInNaira * 100), // e.g., ₦5,000 = 500000 kobo
    publicKey: "pk_test_f912c77684d9e667cd987c1dce2945b290973a9a",
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference) => {
    // Call your backend here to verify the transaction and fulfill the order
    console.log("Payment successful! Reference:", reference);
    onSuccessCallback(reference);
  };

  const onClose = () => {
    console.log("Payment closed.");
  };

  return (
    <button
      onClick={() => initializePayment({ onSuccess, onClose })}
      className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700"
    >
      Pay ₦{amountInNaira.toLocaleString()} with Paystack
    </button>
  );
};

export default PaystackCheckout;