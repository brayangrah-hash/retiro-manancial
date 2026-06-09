import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  MOCK_RETIRANTES, STATUS_OPTIONS, MODALIDADES, statusBadgeClass, calcularPosicoesFila,
  type Retirante, type StatusInscricao,
} from "@/lib/mock-data";
import {
  Download, LogOut, Search, Users, UserCheck, UserPlus,
  UserX, CheckCircle2, AlertCircle, Trash2,
} from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-manancial.png";

export const Route = createFileRoute("/admin/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Retiro Manancial" }] }),
  component: Dashboard,
});

function Dashboard() {
  const navigate = useNavigate();
  const [retirantes, setRetirantes] = useState<Retirante[]>(MOCK_RETIRANTES);
  const [busca, setBusca] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroModalidade, setFiltroModalidade] = useState<string>("todas");
  const [detalhe, setDetalhe] = useState<Retirante | null>(null);
  const [dataRecusa, setDataRecusa] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("manancial_admin")) {
      navigate({ to: "/admin/login" });
    }
  }, [navigate]);

  // Fila por modalidade, recalculada sempre que retirantes muda (inclui alterações de status).
  const posicoesFila = useMemo(() => calcularPosicoesFila(retirantes), [retirantes]);

  const filtrados = useMemo(() => {
    const lista = retirantes.filter((r) => {
      const matchBusca = !busca ||
        r.nome.toLowerCase().includes(busca.toLowerCase()) ||
        r.cidade.toLowerCase().includes(busca.toLowerCase()) ||
        r.cpf.includes(busca);
      const matchStatus = filtroStatus === "todos" || r.status_inscricao === filtroStatus;
      const matchModalidade = filtroModalidade === "todas" || r.modalidade === filtroModalidade;
      return matchBusca && matchStatus && matchModalidade;
    });
    // Ordena por posição na fila (asc). Quem não está na fila vai para o fim, ordenado por nome.
    return lista.sort((a, b) => {
      const pa = posicoesFila.get(a.id);
      const pb = posicoesFila.get(b.id);
      if (pa !== undefined && pb !== undefined) return pa - pb;
      if (pa !== undefined) return -1;
      if (pb !== undefined) return 1;
      return a.nome.localeCompare(b.nome, "pt-BR");
    });
  }, [retirantes, busca, filtroStatus, filtroModalidade, posicoesFila]);

  const totais = useMemo(() => ({
    total: retirantes.length,
    fila: retirantes.filter((r) => r.status_inscricao === "Na fila").length,
    confirmados: retirantes.filter((r) => r.status_inscricao === "Chamado e aceito").length,
    recusados: retirantes.filter((r) => r.status_inscricao === "Chamado e não aceito").length,
    concluidos: retirantes.filter((r) => r.status_inscricao === "Já fez o retiro").length,
    excluidos: retirantes.filter((r) => r.status_inscricao === "Pediu para excluir da lista").length,
  }), [retirantes]);

  function alterarStatus(id: string, novoStatus: StatusInscricao) {
    setRetirantes((prev) => prev.map((r) => {
      if (r.id !== id) return r;
      const upd: Retirante = { ...r, status_inscricao: novoStatus };
      if (novoStatus !== "Chamado e não aceito") upd.data_recusa_vaga = null;
      return upd;
    }));
    toast.success(`Status alterado para "${novoStatus}"`);
  }

  function alterarModalidade(id: string, novaModalidade: string) {
    const alvo = retirantes.find((r) => r.id === id);
    if (!alvo) return;
    if (alvo.modalidade === novaModalidade) return;
    const duplicado = retirantes.some(
      (r) => r.id !== id &&
        r.cpf.replace(/\D/g, "") === alvo.cpf.replace(/\D/g, "") &&
        r.modalidade === novaModalidade,
    );
    if (duplicado) {
      toast.error("Este CPF já está inscrito na modalidade selecionada.");
      return;
    }
    setRetirantes((prev) => prev.map((r) =>
      r.id === id ? { ...r, modalidade: novaModalidade } : r
    ));
    setDetalhe((d) => d && d.id === id ? { ...d, modalidade: novaModalidade } : d);
    toast.success("Modalidade alterada");
  }


  function confirmarRecusa(id: string) {
    if (!dataRecusa) {
      toast.error("Informe a data da recusa");
      return;
    }
    setRetirantes((prev) => prev.map((r) =>
      r.id === id ? { ...r, status_inscricao: "Chamado e não aceito", data_recusa_vaga: dataRecusa } : r
    ));
    setDetalhe((d) => d && d.id === id ? { ...d, data_recusa_vaga: dataRecusa } : d);
    toast.success("Recusa registrada");
    setDataRecusa("");
  }

  function logout() {
    localStorage.removeItem("manancial_admin");
    navigate({ to: "/admin/login" });
  }

  function exportarCsv() {
    const headers = [
      "Nome", "CPF", "Nascimento", "WhatsApp", "Email", "Camisa",
      "Paroquia", "Modalidade", "Cidade", "Bairro", "Endereco", "CEP",
      "Restricoes", "Alergias", "Emergencia Nome", "Emergencia Tel",
      "Status", "Data Recusa", "Inscricao em",
    ];
    const rows = filtrados.map((r) => [
      r.nome, r.cpf, r.data_nascimento, r.whatsapp, r.email, r.tamanho_camisa,
      r.paroquia, r.modalidade, r.cidade, r.bairro, r.endereco, r.cep,
      r.restricoes_alimentares, r.alergias, r.contato_emergencia_nome, r.contato_emergencia_telefone,
      r.status_inscricao, r.data_recusa_vaga ?? "", r.created_at,
    ]);
    const csv = [headers, ...rows]
      .map((row) => row.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `retirantes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Lista exportada");
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Manancial" className="h-12 w-12" />
            <div>
              <Link to="/" className="text-xs text-muted-foreground hover:text-foreground">← Voltar para o site</Link>
              <h1 className="text-xl font-bold text-foreground md:text-2xl">Painel Manancial</h1>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={logout}>
            <LogOut className="mr-2 h-4 w-4" /> Sair
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
          <SummaryCard icon={Users} label="Total de pré-cadastros" value={totais.total} color="bg-primary/10 text-primary" />
          <SummaryCard icon={UserPlus} label="Na fila" value={totais.fila} color="bg-amber-100 text-amber-700" />
          <SummaryCard icon={CheckCircle2} label="Chamado e aceito" value={totais.confirmados} color="bg-emerald-100 text-emerald-700" />
          <SummaryCard icon={UserX} label="Chamado e não aceito" value={totais.recusados} color="bg-rose-100 text-rose-700" />
          <SummaryCard icon={CheckCircle2} label="Já fez o retiro" value={totais.concluidos} color="bg-sky-100 text-sky-700" />
          <SummaryCard icon={AlertCircle} label="Pediu para excluir" value={totais.excluidos} color="bg-slate-100 text-slate-600" />
        </div>

        <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, cidade ou CPF…"
              className="pl-9"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
            />
          </div>
          <Select value={filtroStatus} onValueChange={setFiltroStatus}>
            <SelectTrigger className="md:w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_OPTIONS.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filtroModalidade} onValueChange={setFiltroModalidade}>
            <SelectTrigger className="md:w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as modalidades</SelectItem>
              {MODALIDADES.map((m) => (
                <SelectItem key={m} value={m}>{m}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={exportarCsv} className="rounded-full">
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>

        <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 w-20">Fila</th>
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Cidade</th>
                  <th className="px-4 py-3">Modalidade</th>
                  <th className="px-4 py-3">Data da inscrição</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((r) => {
                  const pos = posicoesFila.get(r.id);
                  return (
                  <tr key={r.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-4 py-3">
                      {pos !== undefined ? (
                        <span
                          title={`Posição ${pos} na fila de ${r.modalidade}`}
                          className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-primary/10 px-2 text-xs font-semibold text-primary"
                        >
                          #{pos}
                        </span>
                      ) : (
                        <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground">
                          —
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-foreground">{r.nome}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.cidade}</td>
                    <td className="px-4 py-3 text-muted-foreground">{r.modalidade}</td>
                    <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(r.status_inscricao)}`}>
                        {r.status_inscricao}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="outline" size="sm" onClick={() => setDetalhe(r)}>
                        Ver detalhes
                      </Button>
                    </td>
                  </tr>
                  );
                })}
                {filtrados.length === 0 && (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    Nenhum retirante encontrado.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          {detalhe && (
            <>
              <DialogHeader>
                <DialogTitle>{detalhe.nome}</DialogTitle>
                <DialogDescription>
                  Inscrito em {new Date(detalhe.created_at).toLocaleDateString("pt-BR")} às {new Date(detalhe.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <DetailBlock title="Status da inscrição">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <Select
                      value={detalhe.status_inscricao}
                      onValueChange={(v) => {
                        alterarStatus(detalhe.id, v as StatusInscricao);
                        setDetalhe({ ...detalhe, status_inscricao: v as StatusInscricao });
                      }}
                    >
                      <SelectTrigger className="sm:w-64"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className={`inline-flex w-fit rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusBadgeClass(detalhe.status_inscricao)}`}>
                      {detalhe.status_inscricao}
                    </span>
                  </div>

                  {detalhe.status_inscricao === "Chamado e não aceito" && (
                    <div className="mt-3 rounded-lg border border-border bg-muted/40 p-3">
                      <label className="text-xs font-medium text-foreground">
                        Data da recusa
                      </label>
                      <div className="mt-1 flex gap-2">
                        <Input
                          type="date"
                          value={dataRecusa || detalhe.data_recusa_vaga || ""}
                          onChange={(e) => setDataRecusa(e.target.value)}
                        />
                        <Button size="sm" onClick={() => confirmarRecusa(detalhe.id)}>
                          Salvar
                        </Button>
                      </div>
                      {detalhe.data_recusa_vaga && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Registrada em: {new Date(detalhe.data_recusa_vaga).toLocaleDateString("pt-BR")}
                        </p>
                      )}
                    </div>
                  )}
                </DetailBlock>

                <DetailBlock title="Dados pessoais">
                  <DetailRow label="CPF" value={detalhe.cpf} />
                  <DetailRow label="Nascimento" value={new Date(detalhe.data_nascimento).toLocaleDateString("pt-BR")} />
                  <DetailRow label="WhatsApp" value={detalhe.whatsapp} />
                  <DetailRow label="E-mail" value={detalhe.email} />
                  <DetailRow label="Camisa" value={detalhe.tamanho_camisa} />
                  <DetailRow label="Rede social" value={detalhe.link_rede_social} />
                </DetailBlock>

                <DetailBlock title="Endereço">
                  <DetailRow label="Endereço" value={detalhe.endereco} />
                  <DetailRow label="Bairro" value={detalhe.bairro} />
                  <DetailRow label="Cidade" value={detalhe.cidade} />
                  <DetailRow label="CEP" value={detalhe.cep} />
                </DetailBlock>

                <DetailBlock title="Retiro">
                  <DetailRow label="Data e hora da inscrição" value={`${new Date(detalhe.created_at).toLocaleDateString("pt-BR")} às ${new Date(detalhe.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`} />
                  <DetailRow label="Paróquia" value={detalhe.paroquia} />
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-sm">
                    <span className="text-muted-foreground">Modalidade</span>
                    <Select
                      value={detalhe.modalidade}
                      onValueChange={(v) => alterarModalidade(detalhe.id, v)}
                    >
                      <SelectTrigger className="sm:w-72"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MODALIDADES.map((m) => (
                          <SelectItem key={m} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {detalhe.ano_manancial_senior && (
                    <DetailRow label="Ano Sênior" value={detalhe.ano_manancial_senior} />
                  )}
                  {detalhe.tem_sacramento_matrimonio !== null && (
                    <DetailRow label="Sacramento Matrimônio" value={detalhe.tem_sacramento_matrimonio ? "Sim" : "Não"} />
                  )}
                  {detalhe.e_casado !== null && detalhe.e_casado !== undefined && (
                    <DetailRow label="É casado(a)" value={detalhe.e_casado ? "Sim" : "Não"} />
                  )}
                  {detalhe.nome_conjuge && (
                    <DetailRow label="Nome do(a) cônjuge" value={detalhe.nome_conjuge} />
                  )}
                  {detalhe.motivo_inscricao && (
                    <div className="pt-2 text-sm">
                      <p className="text-muted-foreground">Motivo da inscrição</p>
                      <p className="mt-1 font-medium text-foreground whitespace-pre-wrap">{detalhe.motivo_inscricao}</p>
                    </div>
                  )}
                </DetailBlock>

                <DetailBlock title="Saúde e emergência">
                  <DetailRow label="Restrições" value={detalhe.restricoes_alimentares} />
                  <DetailRow label="Alergias" value={detalhe.alergias} />
                  <DetailRow label="Emergência" value={`${detalhe.contato_emergencia_nome} — ${detalhe.contato_emergencia_telefone}`} />
                </DetailBlock>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SummaryCard({
  icon: Icon, label, value, color = "bg-primary/10 text-primary",
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
  color?: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <div className={`flex h-9 w-9 items-center justify-center rounded-full ${color.split(" ")[0]}`}>
          <Icon className={`h-4 w-4 ${color.split(" ")[1]}`} />
        </div>
      </div>
      <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
    </div>
  );
}

function DetailBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-muted/20 p-4">
      <h3 className="mb-2 text-sm font-semibold text-foreground">{title}</h3>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}