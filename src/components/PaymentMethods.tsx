interface Props {
  className?: string;
}

const methods: { name: string; src: string }[] = [
  { name: "Visa", src: "/payment-icons/visa.svg" },
  { name: "Mastercard", src: "/payment-icons/mastercard.svg" },
  { name: "American Express", src: "/payment-icons/americanexpress.svg" },
  { name: "PayPal", src: "/payment-icons/paypal.svg" },
  { name: "Klarna", src: "/payment-icons/klarna.svg" },
  { name: "SEPA", src: "/payment-icons/sepa.svg" },
  { name: "giropay", src: "/payment-icons/giropay.svg" },
  { name: "Apple Pay", src: "/payment-icons/applepay.svg" },
  { name: "Google Pay", src: "/payment-icons/googlepay.svg" },
];

const PaymentMethods = ({ className }: Props) => {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground mb-3 text-center">Sichere Zahlung mit</div>
      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 max-w-2xl mx-auto">
        {methods.map((m) => (
          <div
            key={m.name}
            className="min-w-0 h-10 px-2 rounded-md bg-white border border-border flex items-center justify-center overflow-hidden"
            title={m.name}
          >
            <img
              src={m.src}
              alt={m.name}
              loading="lazy"
              className="max-h-6 max-w-full object-contain"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
