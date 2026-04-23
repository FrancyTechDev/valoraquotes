import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Mic, FileText, Zap, Clock, Users, Shield, CheckCircle2 } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import valoraLogo from "@/assets/valora-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VALORA — Preventivi professionali in pochi minuti" },
      {
        name: "description",
        content:
          "Trasforma una richiesta cliente in un preventivo strutturato e professionale. Pensato per architetti e professionisti.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 h-16 md:h-20">
          <div className="flex items-center gap-3">
            <img src={valoraLogo} alt="Valora" className="h-8 md:h-10 w-auto" />
          </div>
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              to="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Prova Valora
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 md:pt-44 pb-20 md:pb-32 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-xs font-medium text-muted-foreground mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-valora-green" />
            Pensato per architetti e professionisti
          </div>
          <h1 className="text-[clamp(2.25rem,5vw,4rem)] font-bold leading-[1.1] tracking-tight text-foreground">
            Crea preventivi professionali
            <br />
            <span className="text-muted-foreground">in pochi minuti</span>
          </h1>
          <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Trasforma una richiesta cliente in un preventivo strutturato, dettagliato e pronto da inviare. Senza perdere tempo.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/app"
              className="inline-flex items-center gap-2.5 rounded-xl bg-primary px-7 py-3.5 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10"
            >
              Prova Valora gratis
              <ArrowRight className="w-4 h-4" />
            </Link>
            <span className="text-sm text-muted-foreground">
              Nessun login richiesto · 3 preventivi gratuiti
            </span>
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-20 md:py-28 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-valora-green mb-3">Il problema</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Fare preventivi è lento e ripetitivo
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: Clock,
                title: "Ore di lavoro",
                desc: "Ogni preventivo richiede ricerca, calcolo e formattazione. Tempo sottratto al progetto.",
              },
              {
                icon: FileText,
                title: "Struttura inconsistente",
                desc: "Senza un formato standard, ogni preventivo è diverso. Meno credibilità professionale.",
              },
              {
                icon: Users,
                title: "Clienti che aspettano",
                desc: "Più tempo per rispondere significa più rischio di perdere il lavoro a un concorrente più veloce.",
              },
            ].map((item) => (
              <div key={item.title} className="space-y-3">
                <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-muted-foreground" />
                </div>
                <h3 className="text-base font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 md:py-28 px-6 bg-secondary/50 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-valora-green mb-3">Come funziona</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Tre passaggi. Un preventivo.
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "01",
                icon: Mic,
                title: "Descrivi il progetto",
                desc: "Registra un memo vocale o scrivi la richiesta del cliente. Anche poche frasi bastano.",
              },
              {
                step: "02",
                icon: Zap,
                title: "Valora analizza",
                desc: "Il sistema interpreta la richiesta e genera un preventivo strutturato per sezioni con prezzi realistici.",
              },
              {
                step: "03",
                icon: FileText,
                title: "Preventivo pronto",
                desc: "Rivedi, copia o stampa. Un documento professionale che puoi inviare direttamente al cliente.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto shadow-sm">
                  <item.icon className="w-6 h-6 text-foreground" />
                </div>
                <div>
                  <span className="text-xs font-bold text-valora-green">{item.step}</span>
                  <h3 className="text-lg font-semibold mt-1">{item.title}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Output preview */}
      <section className="py-20 md:py-28 px-6 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-valora-green mb-3">Esempio di output</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Un preventivo che parla per te
            </h2>
            <p className="mt-4 text-muted-foreground max-w-lg mx-auto">
              Ogni preventivo generato è strutturato come un documento professionale reale, pronto per il cliente.
            </p>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-xl shadow-primary/5 max-w-2xl mx-auto">
            {/* Mock header */}
            <div className="bg-primary px-8 py-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-primary-foreground/40 mb-2">
                Preventivo di massima
              </p>
              <h3 className="text-base font-bold text-primary-foreground">
                Ristrutturazione appartamento 85 mq — Milano, zona Isola
              </h3>
              <p className="text-sm text-primary-foreground/50 mt-1">
                Ristrutturazione completa con rifacimento impianti e finiture di fascia media
              </p>
            </div>

            <div className="px-8 py-6 space-y-5">
              {/* Meta */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-border/50">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Durata</span>
                  <p className="text-sm font-medium mt-0.5">12–14 settimane</p>
                </div>
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/60">Finiture</span>
                  <p className="text-sm font-medium mt-0.5">Fascia media</p>
                </div>
              </div>

              {/* Sample sections */}
              {[
                { num: "01", name: "OPERE EDILI", items: ["Demolizioni e smaltimento", "Nuove tramezzature in laterizio"], sub: "€ 12.450,00" },
                { num: "02", name: "IMPIANTI", items: ["Nuovo impianto elettrico (punti luce e prese)", "Impianto idrico-sanitario completo"], sub: "€ 18.280,00" },
                { num: "03", name: "FINITURE INTERNE", items: ["Pavimentazione in gres porcellanato (fornitura e posa)", "Tinteggiatura pareti e soffitti"], sub: "€ 14.650,00" },
              ].map((s) => (
                <div key={s.num} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-valora-green">{s.num}</span>
                    <span className="text-xs font-bold uppercase tracking-wider">{s.name}</span>
                    <div className="flex-1 border-b border-border/30" />
                  </div>
                  {s.items.map((item) => (
                    <div key={item} className="flex justify-between ml-6">
                      <span className="text-[13px] text-card-foreground/80">{item}</span>
                      <span className="text-[13px] text-muted-foreground">—</span>
                    </div>
                  ))}
                  <div className="flex justify-end">
                    <span className="text-sm font-semibold tabular-nums">{s.sub}</span>
                  </div>
                </div>
              ))}

              {/* Total */}
              <div className="border-t-2 border-valora-green/30 pt-4 flex justify-between items-center">
                <span className="text-base font-bold">Totale Preventivo</span>
                <span className="text-xl font-bold text-valora-green tabular-nums">€ 68.780,00</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 md:py-28 px-6 bg-secondary/50 border-t border-border/40">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-valora-green mb-3">I vantaggi</p>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Perché scegliere Valora
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-2xl mx-auto">
            {[
              { title: "Risparmi ore di lavoro", desc: "Quello che richiedeva mezza giornata ora si fa in pochi minuti." },
              { title: "Rispondi più velocemente", desc: "Invia preventivi prima dei tuoi concorrenti. La velocità fa la differenza." },
              { title: "Immagine professionale", desc: "Documenti strutturati e curati che comunicano competenza e serietà." },
              { title: "Nessun errore di struttura", desc: "Sezioni standard, voci dettagliate, totali coerenti. Sempre." },
            ].map((item) => (
              <div key={item.title} className="flex gap-4">
                <CheckCircle2 className="w-5 h-5 text-valora-green mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-28 px-6 border-t border-border/40">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
            Pronto a risparmiare tempo?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Prova Valora gratuitamente. Nessun login, nessuna carta di credito.
          </p>
          <Link
            to="/app"
            className="mt-10 inline-flex items-center gap-2.5 rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-lg shadow-primary/10"
          >
            Inizia ora
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={valoraLogo} alt="Valora" className="h-6 w-auto opacity-50" />
          </div>
          <p className="text-xs text-muted-foreground/50">
            © {new Date().getFullYear()} Valora · Preventivi intelligenti per professionisti
          </p>
        </div>
      </footer>
    </div>
  );
}
