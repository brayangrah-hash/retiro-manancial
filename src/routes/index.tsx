import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import heroImage from "@/assets/waterfall-hero.jpg";
import logo from "@/assets/logo-manancial.png";
import { Button } from "@/components/ui/button";
import { Heart, Users, Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Retiro Manancial — Pré-inscrição" },
      { name: "description", content: "Pré-inscrição para o Retiro Católico Manancial. Faça sua reserva de vaga." },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[oklch(0.30_0.06_200/0.55)] via-[oklch(0.30_0.06_200/0.45)] to-[oklch(0.30_0.06_200/0.7)]" />
        </div>
        <div className="relative mx-auto max-w-3xl px-6 py-20 text-center text-white md:py-28">
          <img
            src={logo}
            alt="Retiro Manancial"
            className="mx-auto h-40 w-40 drop-shadow-xl md:h-52 md:w-52"
          />
          <h1 className="sr-only">Retiro Manancial</h1>
          <p className="mx-auto mt-6 max-w-xl text-base italic text-white/95 md:text-lg">
            "Aquele que beber da água que eu darei, nunca mais terá sede" (Jo 4,14).
          </p>
          <div className="mt-8 flex justify-center">
            <Button asChild size="lg" className="rounded-full bg-white px-8 text-primary hover:bg-white/90">
              <Link to="/cadastro">Fazer meu pré-cadastro</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* About */}
      <section className="mx-auto max-w-3xl px-6 py-16">
        <div className="rounded-2xl bg-card p-8 shadow-sm md:p-10">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Sobre o encontro
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            O Retiro Manancial é um encontro de fé, partilha e renovação espiritual,
            preparado com carinho para todas as faixas etárias. Um tempo de oração,
            silêncio e fraternidade para você se reencontrar com Deus.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              { icon: Heart, title: "Acolhimento", text: "Um lugar para descansar a alma." },
              { icon: Users, title: "Comunidade", text: "Para todas as idades." },
              { icon: Sparkles, title: "Renovação", text: "Experiência transformadora." },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-xl border border-border bg-background p-5">
                <Icon className="h-6 w-6 text-primary" />
                <h3 className="mt-3 font-semibold text-foreground">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 flex justify-center">
            <Button asChild size="lg" className="rounded-full px-8">
              <Link to="/cadastro">Fazer meu pré-cadastro</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-border bg-card/50 py-6 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-3xl px-6">
          <p>Retiro Manancial · Pré-inscrição</p>
          <Link
            to="/admin/login"
            className="mt-2 inline-block text-xs text-muted-foreground/70 hover:text-primary"
          >
            Acesso da organização
          </Link>
        </div>
      </footer>
    </div>
  );
}
