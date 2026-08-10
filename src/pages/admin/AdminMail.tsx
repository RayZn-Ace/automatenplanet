import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { RefreshCw, Mail, Send, Inbox, PenSquare, ArrowLeft } from "lucide-react";

type MailMessage = {
  id: string;
  direction: "inbound" | "outbound";
  from_email: string;
  from_name: string | null;
  to_email: string[];
  cc_email: string[];
  subject: string | null;
  text_body: string | null;
  html_body: string | null;
  snippet: string | null;
  message_id: string | null;
  status: string;
  error_message: string | null;
  is_read: boolean;
  created_at: string;
};

type Identity = { id: string; email: string; display_name: string | null; is_default: boolean };

type Tab = "inbound" | "outbound";

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

const StatusBadge = ({ m }: { m: MailMessage }) => {
  if (m.direction === "inbound") return <Badge variant="secondary">Empfangen</Badge>;
  if (m.status === "failed") return <Badge variant="destructive">Fehlgeschlagen</Badge>;
  return <Badge variant="secondary">Gesendet</Badge>;
};

const AdminMail = () => {
  const [messages, setMessages] = useState<MailMessage[]>([]);
  const [identities, setIdentities] = useState<Identity[]>([]);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<Tab>("inbound");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MailMessage | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [cc, setCc] = useState("");
  const [subject, setSubject] = useState("");
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [replyToId, setReplyToId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const [msgRes, idRes] = await Promise.all([
      supabase
        .from("mail_messages")
        .select(
          "id,direction,from_email,from_name,to_email,cc_email,subject,text_body,html_body,snippet,message_id,status,error_message,is_read,created_at",
        )
        .order("created_at", { ascending: false })
        .limit(300),
      supabase.from("mail_identities").select("id,email,display_name,is_default").order("email"),
    ]);
    setLoading(false);
    if (msgRes.error) {
      toast.error(msgRes.error.message);
      return;
    }
    setMessages((msgRes.data ?? []) as MailMessage[]);
    const ids = (idRes.data ?? []) as Identity[];
    setIdentities(ids);
    setFrom((prev) => prev || ids.find((i) => i.is_default)?.email || ids[0]?.email || "");
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("mail-messages-live")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "mail_messages" },
        () => void load(),
      )
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [load]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return messages.filter((m) => {
      if (m.direction !== tab) return false;
      if (!q) return true;
      return [m.subject, m.from_email, m.from_name, m.snippet, m.to_email.join(" ")]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [messages, tab, search]);

  const unread = useMemo(
    () => messages.filter((m) => m.direction === "inbound" && !m.is_read).length,
    [messages],
  );

  const open = async (m: MailMessage) => {
    setSelected(m);
    setComposeOpen(false);
    if (m.direction === "inbound" && !m.is_read) {
      const { error } = await supabase.from("mail_messages").update({ is_read: true }).eq("id", m.id);
      if (!error) {
        setMessages((prev) => prev.map((x) => (x.id === m.id ? { ...x, is_read: true } : x)));
      }
    }
  };

  const startCompose = () => {
    setSelected(null);
    setReplyToId(null);
    setTo("");
    setCc("");
    setSubject("");
    setText("");
    setComposeOpen(true);
  };

  const startReply = (m: MailMessage) => {
    setReplyToId(m.id);
    setTo(m.direction === "inbound" ? m.from_email : m.to_email.join(", "));
    setCc("");
    setSubject(m.subject?.startsWith("Re:") ? m.subject : `Re: ${m.subject ?? ""}`);
    const quoted = (m.text_body ?? "")
      .split("\n")
      .map((l) => `> ${l}`)
      .join("\n");
    setText(`\n\n---\nAm ${fmtDate(m.created_at)} schrieb ${m.from_email}:\n${quoted}`);
    const target = m.direction === "inbound" ? m.to_email[0] : m.from_email;
    if (target && identities.some((i) => i.email === target)) setFrom(target);
    setComposeOpen(true);
    setSelected(null);
  };

  const send = async () => {
    if (!from || !to.trim() || !subject.trim() || !text.trim()) {
      toast.error("Bitte Absender, Empfänger, Betreff und Nachricht ausfüllen.");
      return;
    }
    setSending(true);
    try {
      const identity = identities.find((i) => i.email === from);
      const { data, error } = await supabase.functions.invoke("mail-send", {
        body: {
          from,
          fromName: identity?.display_name ?? "",
          to: to.split(/[,;]/).map((v) => v.trim()).filter(Boolean),
          cc: cc.split(/[,;]/).map((v) => v.trim()).filter(Boolean),
          subject,
          text,
          replyToId,
        },
      });
      if (error) throw error;
      if ((data as { error?: string } | null)?.error) {
        throw new Error((data as { error: string }).error);
      }
      toast.success("E-Mail gesendet");
      setComposeOpen(false);
      setReplyToId(null);
      setTo("");
      setCc("");
      setSubject("");
      setText("");
      setTab("outbound");
      void load();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Versand fehlgeschlagen");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-[200px]">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <Mail className="h-5 w-5" /> Postfach
          </h1>
          <p className="text-sm text-muted-foreground">
            E-Mails an @automatenplanet.com empfangen und beantworten
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Aktualisieren
        </Button>
        <Button size="sm" onClick={startCompose}>
          <PenSquare className="h-4 w-4 mr-2" /> Neue E-Mail
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={tab === "inbound" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("inbound")}
        >
          <Inbox className="h-4 w-4 mr-2" /> Eingang
          {unread > 0 && <span className="ml-2 rounded-full bg-background/20 px-2 text-xs">{unread}</span>}
        </Button>
        <Button
          variant={tab === "outbound" ? "default" : "outline"}
          size="sm"
          onClick={() => setTab("outbound")}
        >
          <Send className="h-4 w-4 mr-2" /> Gesendet
        </Button>
        <Input
          className="w-full sm:w-64"
          placeholder="Suchen…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card className="divide-y max-h-[70vh] overflow-y-auto">
          {filtered.length === 0 && (
            <div className="p-6 text-sm text-muted-foreground">
              {loading ? "Lade…" : "Keine E-Mails vorhanden."}
            </div>
          )}
          {filtered.map((m) => (
            <button
              key={m.id}
              onClick={() => void open(m)}
              className={`w-full text-left p-3 hover:bg-muted/50 transition-colors ${
                selected?.id === m.id ? "bg-muted/60" : ""
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span
                  className={`text-sm truncate ${
                    m.direction === "inbound" && !m.is_read ? "font-semibold" : ""
                  }`}
                >
                  {m.direction === "inbound" ? m.from_name || m.from_email : m.to_email.join(", ")}
                </span>
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {fmtDate(m.created_at)}
                </span>
              </div>
              <div className="text-sm truncate">{m.subject || "(kein Betreff)"}</div>
              <div className="text-xs text-muted-foreground truncate">{m.snippet}</div>
            </button>
          ))}
        </Card>

        <Card className="p-4 min-h-[320px]">
          {composeOpen ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold">{replyToId ? "Antworten" : "Neue E-Mail"}</h2>
                <Button variant="ghost" size="sm" onClick={() => setComposeOpen(false)}>
                  <ArrowLeft className="h-4 w-4 mr-1" /> Abbrechen
                </Button>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mail-from">Absender</Label>
                <select
                  id="mail-from"
                  className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                >
                  {identities.map((i) => (
                    <option key={i.id} value={i.email}>
                      {i.display_name ? `${i.display_name} <${i.email}>` : i.email}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="mail-to">An</Label>
                  <Input
                    id="mail-to"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="empfaenger@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="mail-cc">CC (optional)</Label>
                  <Input id="mail-cc" value={cc} onChange={(e) => setCc(e.target.value)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mail-subject">Betreff</Label>
                <Input id="mail-subject" value={subject} onChange={(e) => setSubject(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="mail-text">Nachricht</Label>
                <Textarea
                  id="mail-text"
                  rows={12}
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              </div>
              <Button onClick={() => void send()} disabled={sending}>
                <Send className="h-4 w-4 mr-2" />
                {sending ? "Sende…" : "Senden"}
              </Button>
            </div>
          ) : selected ? (
            <div className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="font-semibold break-words">{selected.subject || "(kein Betreff)"}</h2>
                  <p className="text-sm text-muted-foreground break-words">
                    Von {selected.from_name ? `${selected.from_name} <${selected.from_email}>` : selected.from_email}
                  </p>
                  <p className="text-sm text-muted-foreground break-words">
                    An {selected.to_email.join(", ") || "—"}
                    {selected.cc_email.length > 0 && ` · CC ${selected.cc_email.join(", ")}`}
                  </p>
                  <p className="text-xs text-muted-foreground">{fmtDate(selected.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge m={selected} />
                  <Button size="sm" onClick={() => startReply(selected)}>
                    Antworten
                  </Button>
                </div>
              </div>
              {selected.error_message && (
                <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm">
                  {selected.error_message}
                </div>
              )}
              <div className="rounded-md border p-3 text-sm whitespace-pre-wrap break-words max-h-[50vh] overflow-y-auto">
                {selected.text_body || "(kein Textinhalt)"}
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
              E-Mail auswählen oder neue schreiben.
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminMail;
