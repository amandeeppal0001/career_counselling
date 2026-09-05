/**
 * Dynamically loads the Razorpay checkout script if not already present
 */
export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve(true));
      existingScript.addEventListener('error', () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => {
      console.error("Failed to load Razorpay SDK");
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

/**
 * Launches the Razorpay checkout modal
 */
export const openRazorpayModal = async ({
  orderData,
  user,
  counsellor,
  onSuccess,
  onFailure,
  onDismiss
}) => {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    throw new Error("Unable to load Razorpay payment gateway. Please check your internet connection.");
  }

  const key = orderData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;

  if (!key || key === 'rzp_test_placeholder') {
    console.warn("Razorpay Key is currently a placeholder. Please update RAZORPAY_KEY_ID with your test key.");
  }

  const options = {
    key: key,
    amount: orderData.amount,
    currency: orderData.currency || "INR",
    name: "Career Guidance Consultation",
    description: `1-on-1 Counseling Session with ${counsellor?.fullName || 'Counselor'}`,
    order_id: orderData.orderId,
    prefill: {
      name: user?.name || "",
      email: user?.email || "",
      contact: user?.phoneNumber || counsellor?.phoneNumber || ""
    },
    notes: {
      studentId: user?._id || "",
      counsellorId: counsellor?.userId || counsellor?._id || ""
    },
    theme: {
      color: "#7c3aed" // Vibrant purple matching the platform
    },
    handler: function (response) {
      // response contains: razorpay_payment_id, razorpay_order_id, razorpay_signature
      if (onSuccess) {
        onSuccess(response);
      }
    },
    modal: {
      ondismiss: function () {
        if (onDismiss) {
          onDismiss();
        }
      }
    }
  };

  const rzp = new window.Razorpay(options);

  rzp.on("payment.failed", function (response) {
    console.error("Razorpay payment failed:", response.error);
    if (onFailure) {
      onFailure(response.error);
    }
  });

  rzp.open();
};
