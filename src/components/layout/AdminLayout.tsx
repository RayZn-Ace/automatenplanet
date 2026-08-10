import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { Session } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Radio,
  Route as RouteIcon,
  Euro,
  Package,
  Boxes,
  Mail,
  LogOut,
  Menu,
  X,
} from "lucide-react";

const NAV = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/live", label: "Live", icon: Radio },
  { to: "/admin/journeys", label: "Customer Journeys", icon: RouteIcon },
  { to: "/admin/umsatz", label: "Umsätze", icon: Euro },
  { to: "/admin/bestellungen", label: "Bestellungen", icon: Package },
  { to: "/admin/produkte", label: "Produkte", icon: Boxes },
  { to: "/admin/postfach", label: "Postfach", icon: Mail },
];

function AuthForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: pw });
      if (error) throw error;
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Helmet>
        <title>Admin Login</title>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>
      <Card className="w-full max-w-md p-6 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold">Admin</h1>
          <p className="text-sm text-muted-foreground">Bitte einloggen</p>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">E-Mail</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="pw">Passwort</Label>
            <Input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "…" : "Einloggen"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

const AdminLayout = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!ready) return null;
  if (!session) return <AuthForm />;

  return (
    <div className="min-h-screen bg-background text-foreground flex w-full">
      <Helmet>
        <meta name="robots" content="noindex,nofollow" />
      </Helmet>

      {/* Sidebar */}
      <aside
        className={`fixed z-40 inset-y-0 left-0 w-60 border-r border-border bg-card/95 backdrop-blur transition-transform md:translate-x-0 md:static md:z-auto ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-14 flex items-center justify-between px-4 border-b border-border">
          <span className="font-semibold">Admin Panel</span>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Menü schließen">
            <X className="h-5 w-5" />
          </button>
        </div>
        <nav className="p-2 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  isActive ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50"
                }`
              }
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-3 border-t border-border space-y-2">
          <p className="text-xs text-muted-foreground break-all">{session.user.email}</p>
          <Button
            size="sm"
            variant="outline"
            className="w-full"
            onClick={async () => {
              await supabase.auth.signOut();
              navigate("/");
            }}
          >
            <LogOut className="h-4 w-4 mr-2" /> Logout
          </Button>
        </div>
      </aside>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 md:hidden" onClick={() => setOpen(false)} aria-hidden />
      )}

      <div className="flex-1 min-w-0">
        <header className="h-14 flex items-center gap-3 border-b border-border px-4 md:hidden">
          <button onClick={() => setOpen(true)} aria-label="Menü öffnen">
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">Admin Panel</span>
        </header>
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
