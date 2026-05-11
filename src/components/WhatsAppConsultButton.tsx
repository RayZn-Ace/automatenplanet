import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Props {
  productName?: string;
  className?: string;
  label?: string;
}

const WHATSAPP_PHONE = "4905111228957";

const WhatsAppConsultButton = ({ productName, className, label }: Props) => {
  const text = productName
    ? `Hallo, ich hätte gerne eine Beratung zu: ${productName}`
    : "Hallo, ich hätte gerne eine Beratung.";
  const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  return (
    <Button
      asChild
      size="lg"
      className={`bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_32%)] text-white border-0 w-full sm:w-auto max-w-full h-auto min-h-11 py-2.5 px-4 sm:px-6 text-sm sm:text-base leading-tight ${className ?? ""}`}
    >
      <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 text-center break-words">
        <MessageCircle className="w-5 h-5 shrink-0" />
        <span className="break-words">{label ?? "Jetzt auf WhatsApp beraten lassen"}</span>
      </a>
    </Button>
  );
};

export default WhatsAppConsultButton;
