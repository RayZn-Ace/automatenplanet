import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MessageCircle, Send, Star, Quote } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const testimonials = [
  {
    name: "Mehmet K.",
    role: "Kiosk-Besitzer, Berlin",
    text: "Seit ich zwei Greifautomaten im Kiosk stehen habe, verdiene ich monatlich 1.800€ extra. Beste Investition!",
    rating: 5,
  },
  {
    name: "Sarah L.",
    role: "Arcade Studio, Hamburg",
    text: "AutomatPlanet hat unser komplettes Studio ausgestattet. Top Qualität und exzellenter Service.",
    rating: 5,
  },
  {
    name: "Thomas R.",
    role: "Einkaufszentrum Manager, München",
    text: "Die Boxautomaten sind der absolute Hit. Die Kunden lieben es und wir verdienen passiv.",
    rating: 5,
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "", company: "", location: "", email: "", phone: "", machine: "", message: "",
  });

  const [newsletter, setNewsletter] = useState("");

  const whatsappUrl = `https://wa.me/4915123456789?text=${encodeURIComponent("Hallo AutomatPlanet, ich möchte gerne eine Beratung.")}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Anfrage gesendet! Wir melden uns innerhalb von 24h.");
    setFormData({ name: "", company: "", location: "", email: "", phone: "", machine: "", message: "" });
  };

  const handleNewsletter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletter.trim()) return;
    toast.success("Newsletter angemeldet!");
    setNewsletter("");
  };

  return (
    <section id="kontakt" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 md:px-6">
        {/* Testimonials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-24"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12">
            Kundenstimmen
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-card/60 p-6 relative"
              >
                <Quote className="absolute top-4 right-4 w-8 h-8 text-primary/20" />
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="font-bold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Contact Form & Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Jetzt <span className="text-primary text-glow">anfragen</span>
            </h2>
            <p className="text-muted-foreground mb-8">
              Lassen Sie sich unverbindlich beraten. Wir antworten innerhalb von 24 Stunden.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Name *" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="bg-muted/50 border-white/10" />
                <Input placeholder="Firma" value={formData.company} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="bg-muted/50 border-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input placeholder="Standort" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-muted/50 border-white/10" />
                <Input type="email" placeholder="E-Mail *" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="bg-muted/50 border-white/10" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input type="tel" placeholder="Telefon" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="bg-muted/50 border-white/10" />
                <Select value={formData.machine} onValueChange={(v) => setFormData({ ...formData, machine: v })}>
                  <SelectTrigger className="bg-muted/50 border-white/10">
                    <SelectValue placeholder="Automatentyp" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="greifautomat">Greifautomat</SelectItem>
                    <SelectItem value="boxautomat">Boxautomat</SelectItem>
                    <SelectItem value="basketball">Basketball Automat</SelectItem>
                    <SelectItem value="arcade">Arcade Automat</SelectItem>
                    <SelectItem value="prize">Prize Maschine</SelectItem>
                    <SelectItem value="event">Event Automat</SelectItem>
                    <SelectItem value="andere">Andere</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Textarea placeholder="Ihre Nachricht..." value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} className="bg-muted/50 border-white/10 min-h-[120px]" />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-white shadow-neon h-12 text-lg">
                <Send className="mr-2 w-5 h-5" /> Anfrage senden
              </Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex flex-col gap-8"
          >
            {/* Quick Contact */}
            <div className="space-y-4">
              <h3 className="text-2xl font-bold mb-4">Schnellkontakt</h3>
              <a href="tel:+4915123456789" className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-card/40 hover:border-primary/30 transition-all">
                <div className="p-3 rounded-lg bg-primary/20"><Phone className="w-5 h-5 text-primary" /></div>
                <div>
                  <p className="font-bold">Anrufen</p>
                  <p className="text-sm text-muted-foreground">+49 151 23456789</p>
                </div>
              </a>
              <a href="mailto:info@automatplanet.de" className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-card/40 hover:border-secondary/30 transition-all">
                <div className="p-3 rounded-lg bg-secondary/20"><Mail className="w-5 h-5 text-secondary" /></div>
                <div>
                  <p className="font-bold">E-Mail</p>
                  <p className="text-sm text-muted-foreground">info@automatplanet.de</p>
                </div>
              </a>
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-card/40 hover:border-green-500/30 transition-all">
                <div className="p-3 rounded-lg bg-green-500/20"><MessageCircle className="w-5 h-5 text-green-500" /></div>
                <div>
                  <p className="font-bold">WhatsApp</p>
                  <p className="text-sm text-muted-foreground">Direkt chatten</p>
                </div>
              </a>
            </div>

            {/* Newsletter */}
            <div className="rounded-2xl border border-accent/30 bg-accent/5 p-6">
              <h3 className="text-xl font-bold mb-2">Newsletter</h3>
              <p className="text-sm text-muted-foreground mb-4">Neue Automaten, Angebote & Business-Tipps direkt in Ihr Postfach.</p>
              <form onSubmit={handleNewsletter} className="flex gap-2">
                <Input type="email" placeholder="E-Mail Adresse" value={newsletter} onChange={(e) => setNewsletter(e.target.value)} className="bg-muted/50 border-white/10 flex-1" required />
                <Button type="submit" className="bg-accent hover:bg-accent/80 text-white">
                  Anmelden
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;