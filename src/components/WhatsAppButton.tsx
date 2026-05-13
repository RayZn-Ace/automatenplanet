import { MessageCircle } from "lucide-react";

const WhatsAppButton = () => {
  const whatsappUrl = "https://api.whatsapp.com/send?phone=4915510706035&text=" + encodeURIComponent("Hallo, ich interessiere mich für Arcade-Automaten.");

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="WhatsApp Kontakt"
      className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-[#25D366] px-5 py-3 text-white font-semibold shadow-lg hover:bg-[#1ebe5d] hover:scale-105 transition-all duration-200 group"
    >
      <MessageCircle className="w-6 h-6 fill-white stroke-white" />
      <span className="hidden sm:inline text-sm">WhatsApp</span>
    </a>
  );
};

export default WhatsAppButton;