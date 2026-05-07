interface Props {
  className?: string;
}

const methods = ["AmEx", "MasterCard", "VISA", "SEPA", "Klarna", "giropay", "Apple Pay", "G Pay", "PayPal"];

const PaymentMethods = ({ className }: Props) => {
  return (
    <div className={className}>
      <div className="text-xs text-muted-foreground mb-3 text-center">Sichere Zahlung mit</div>
      <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-2 max-w-2xl mx-auto">
        {methods.map((m) => (
          <div
            key={m}
            className="h-10 px-2 rounded-md bg-background border border-border flex items-center justify-center text-[11px] font-semibold text-muted-foreground"
          >
            {m}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentMethods;
