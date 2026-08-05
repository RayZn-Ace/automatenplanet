import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";
import { formatGross } from "@/lib/pricing";
import { trackEvent } from "@/lib/tracking";
import { track } from "@/lib/analytics";

type Status = "loading" | "paid" | "pending" | "failed";

const OrderStatus = () => {
  const [params] = useSearchParams();
  const orderId = params.get("o") ?? "";
  const clearCart = useCartStore((s) => s.clearCart);
  const [status, setStatus] = useState<Status>("loading");
  const [order, setOrder] = useState<{ order_number: string; total_gross_cents: number; email: string } | null>(null);

  useEffect(() => {
    if (!orderId) {
      setStatus("failed");
      return;
    }
    let cancelled = false;
    let tries = 0;

    const poll = async () => {
      tries += 1;
      const { data, error } = await supabase.functions.invoke("order-status", { body: { orderId } });
      if (cancelled) return;
      if (error || !data?.order) {
        setStatus("failed");
        return;
      }
      setOrder(data.order);
      const s = data.order.status as string;
      if (s === "paid") {
        setStatus("paid");
        clearCart();
        trackEvent("purchase", {
          value: data.order.total_gross_cents / 100,
          currency: "EUR",
          transactionId: data.order.order_number,
        });
        track("purchase", {
          question_id: data.order.order_number,
          value_cents: data.order.total_gross_cents,
          currency: "EUR",
        });
        return;
      }
      if (["failed", "canceled", "expired"].includes(s)) {
        setStatus("failed");
        return;
      }
      if (tries < 8) {
        setTimeout(poll, 2000);
      } else {
        setStatus("pending");
      }
    };
    poll();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Helmet>
        <title>Bestellstatus | AutomatPlanet</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Navbar />

      <main className="container mx-auto px-4 md:px-6 pt-28 pb-20">
        <div className="max-w-xl mx-auto rounded-2xl border border-border bg-card p-6 sm:p-10 text-center">
          {status === "loading" && (
            <>
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-5 animate-spin" />
              <h1 className="text-2xl font-bold mb-2">Zahlung wird geprüft…</h1>
              <p className="text-muted-foreground">Bitte dieses Fenster kurz offen lassen.</p>
            </>
          )}

          {status === "paid" && order && (
            <>
              <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-5" />
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Vielen Dank für Ihre Bestellung!</h1>
              <p className="text-muted-foreground mb-6">
                Bestellnummer <span className="font-semibold text-foreground">{order.order_number}</span> über{" "}
                <span className="font-semibold text-foreground">
                  {(order.total_gross_cents / 100).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}€
                </span>{" "}
                ist bei uns eingegangen. Eine Bestätigung geht an {order.email}.
              </p>
              <Button asChild size="lg"><Link to="/">Zurück zur Startseite</Link></Button>
            </>
          )}

          {status === "pending" && (
            <>
              <Clock className="w-12 h-12 text-primary mx-auto mb-5" />
              <h1 className="text-2xl font-bold mb-2">Zahlung in Bearbeitung</h1>
              <p className="text-muted-foreground mb-6">
                Ihre Zahlung wurde noch nicht endgültig bestätigt. Sobald sie eingeht, erhalten Sie eine E-Mail von uns.
              </p>
              <Button asChild size="lg" variant="outline"><Link to="/">Zurück zur Startseite</Link></Button>
            </>
          )}

          {status === "failed" && (
            <>
              <XCircle className="w-12 h-12 text-destructive mx-auto mb-5" />
              <h1 className="text-2xl font-bold mb-2">Zahlung nicht abgeschlossen</h1>
              <p className="text-muted-foreground mb-6">
                Die Zahlung wurde abgebrochen oder abgelehnt. Ihr Warenkorb bleibt erhalten – Sie können es erneut versuchen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg"><Link to="/kasse">Erneut versuchen</Link></Button>
                <Button asChild size="lg" variant="outline"><Link to="/">Zur Startseite</Link></Button>
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderStatus;
