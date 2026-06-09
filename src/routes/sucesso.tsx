import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import logo from "@/assets/logo-manancial.png";

export const Route = createFileRoute("/sucesso")({
  head: () => ({
    meta: [{ title: "Pré-inscrição enviada — Retiro Manancial" }],
  }),
  component: SucessoPage,
});

function SucessoPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-8 text-center shadow-sm md:p-12">
        <img src={logo} alt="Manancial" className="mx-auto mb-4 h-24 w-24" />
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <h1 className="mt-6 text-2xl font-bold text-foreground md:text-3xl">
          Pré-cadastro realizado!
        </h1>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Obrigado por se inscrever no Retiro Manancial. Sua pré-inscrição foi recebida
          com sucesso. Você está na fila de acordo com a data de inscrição e a modalidade
          escolhida. Nossa equipe entrará em contato em breve.
        </p>
        <p className="mt-4 italic text-sm text-muted-foreground">
          "Aquele que beber da água que eu darei, nunca mais terá sede" (Jo 4,14).
        </p>
        <div className="mt-8">
          <Button asChild className="rounded-full px-8">
            <Link to="/">Voltar para a página inicial</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}