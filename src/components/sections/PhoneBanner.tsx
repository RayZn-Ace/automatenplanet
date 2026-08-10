import { Phone } from "lucide-react";

const PhoneBanner = () => {
  return (
    <div className="bg-primary/10 border-y border-primary/20">
      <div className="container mx-auto px-4 md:px-6 py-4 flex flex-col sm:flex-row items-center justify-center gap-3 text-center">
        <Phone className="w-5 h-5 text-primary" />
        <span className="text-sm text-muted-foreground">Fragen? Rufen Sie uns an:</span>
        <a href="tel:+4951112282957" className="text-lg font-bold text-primary hover:underline">
          0511 12282957
        </a>
      </div>
    </div>
  );
};

export default PhoneBanner;
