import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormSection, Field } from "@/components/FormSection";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-manancial.png";

export const Route = createFileRoute("/admin/login")({
  head: () => ({ meta: [{ title: "Login Admin — Retiro Manancial" }] }),
  component: AdminLogin,
});

function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!email || !senha) {
      toast.error("Preencha email e senha");
      return;
    }
    localStorage.setItem("manancial_admin", "1");
    toast.success("Bem-vindo!");
    navigate({ to: "/admin/dashboard" });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar para a página inicial
        </Link>
        <div className="mb-6 text-center">
          <img src={logo} alt="Manancial" className="mx-auto h-24 w-24" />
          <h1 className="mt-4 text-2xl font-bold text-foreground">Painel Administrativo</h1>
          <p className="mt-1 text-sm text-muted-foreground">Retiro Manancial</p>
        </div>
        <form onSubmit={submit}>
          <FormSection title="Entrar">
            <Field label="E-mail" required>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </Field>
            <Field label="Senha" required>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            </Field>
            <Button type="submit" className="w-full rounded-full">Entrar</Button>
            <p className="text-center text-xs text-muted-foreground">
              Modo demonstração — qualquer email/senha funciona
            </p>
          </FormSection>
        </form>
      </div>
    </div>
  );
}