import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

interface Props {
  productName?: string;
  className?: string;
}

const WHATSAPP_PHONE = "4905111228957";

const WhatsAppConsultButton = ({ productName, className }: Props) => {
  const text = productName
    ? `Hallo, ich hätte gerne eine Beratung zu: ${productName}`
    : "Hallo, ich hätte gerne eine Beratung.";
  const href = `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(text)}`;
  return (
    <Button
      asChild
      size="lg"
      className={`bg-[hsl(142_70%_38%)] hover:bg-[hsl(142_70%_32%)] text-white border-0 ${className ?? ""}`}
    >
      <a href={href} target="_blank" rel="noopener noreferrer">
        <MessageCircle className="mr-2 w-5 h-5" />
        Jetzt auf WhatsApp beraten lassen
      </a>
    </Button>
  );
};

export default WhatsAppConsultButton;
