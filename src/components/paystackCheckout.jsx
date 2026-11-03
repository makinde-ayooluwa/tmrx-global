import React, { useState } from "react";
import { usePaystackPayment } from "react-paystack";

const PaystackCheckout = ({
    email,
    amountInNaira,
    userId,
    onSuccessCallback,
}) => {
    const [verifying, setVerifying] = useState(false);

    const amount = Number(amountInNaira);

    const config = {
        reference: `TX_TMRX_GLOBAL-${Date.now()}-${Math.floor(
            Math.random() * 1000000
        )}`,
        email,
        amount: Math.round(amount * 100),
        publicKey: "pk_test_f912c77684d9e667cd987c1dce2945b290973a9a",
        currency: "NGN",
        metadata: {
            userId: String(userId),
        },
    };

    const initializePayment = usePaystackPayment(config);

    const onSuccess = async (response) => {
        const reference =
            typeof response === "string"
                ? response
                : response?.reference;

        if (!reference) {
            return;
        }

        setVerifying(true);

        try {
            await onSuccessCallback(reference);
        } catch (error) {
            console.error("Payment verification failed:", error);
        } finally {
            setVerifying(false);
        }
    };

    const onClose = () => {
        console.log("Paystack checkout closed.");
    };

    const handlePayment = () => {
        if (!email || !userId || !Number.isFinite(amount) || amount <= 0) {
            return;
        }

        initializePayment({
            onSuccess,
            onClose,
        });
    };

    return (
        <button
            type="button"
            onClick={handlePayment}
            disabled={verifying || !email || !userId || amount <= 0}
            className="w-full rounded-xl bg-emerald-600 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
            {verifying
                ? "Verifying payment..."
                : `Pay ₦${amount.toLocaleString("en-NG")} with Paystack`}
        </button>
    );
};

export default PaystackCheckout;