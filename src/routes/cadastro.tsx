import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { FormSection, Field } from "@/components/FormSection";
import {
  MODALIDADES, TAMANHOS_CAMISA, MOCK_RETIRANTES,
  calcularIdade, modalidadesPermitidasPorIdade, cpfJaInscritoNaModalidade, validarCpf,
} from "@/lib/mock-data";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import logo from "@/assets/logo-manancial.png";

export const Route = createFileRoute("/cadastro")({
  head: () => ({
    meta: [
      { title: "Pré-inscrição — Retiro Manancial" },
      { name: "description", content: "Formulário de pré-inscrição para o Retiro Manancial." },
    ],
  }),
  component: CadastroPage,
});

function CadastroPage() {
  const navigate = useNavigate();
  const [modalidade, setModalidade] = useState<string>("");
  const [dataNascimento, setDataNascimento] = useState<string>("");
  const [cpf, setCpf] = useState<string>("");
  const [whatsapp, setWhatsapp] = useState<string>("");
  const [temRestricao, setTemRestricao] = useState<string>("nao");
  const [confirmaSenior, setConfirmaSenior] = useState(false);
  const [confirmaMatrimonio, setConfirmaMatrimonio] = useState(false);
  const [anoSenior, setAnoSenior] = useState("");
  const [dataMatrimonio, setDataMatrimonio] = useState("");
  const [eCasado, setECasado] = useState<string>("nao");
  const [nomeConjuge, setNomeConjuge] = useState("");
  const [numero, setNumero] = useState("");
  const [complemento, setComplemento] = useState("");
  const [motivoInscricao, setMotivoInscricao] = useState("");
  const [cep, setCep] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [cidade, setCidade] = useState("");
  const [buscandoCep, setBuscandoCep] = useState(false);

  const idade = calcularIdade(dataNascimento);
  const modalidadesDisponiveis = modalidadesPermitidasPorIdade(idade);

  // Se a modalidade selecionada não é mais compatível com a idade, limpa.
  useEffect(() => {
    if (modalidade && !modalidadesDisponiveis.includes(modalidade as (typeof MODALIDADES)[number])) {
      setModalidade("");
    }
  }, [modalidade, modalidadesDisponiveis]);

  const isAlliance = modalidade === "Manancial Alliance";

  function formatCpf(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    let out = d;
    if (d.length > 9) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6, 9)}-${d.slice(9)}`;
    else if (d.length > 6) out = `${d.slice(0, 3)}.${d.slice(3, 6)}.${d.slice(6)}`;
    else if (d.length > 3) out = `${d.slice(0, 3)}.${d.slice(3)}`;
    return out;
  }

  function formatPhone(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  }

  function formatCep(value: string) {
    const d = value.replace(/\D/g, "").slice(0, 8);
    return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
  }

  async function buscarCep(value: string) {
    const clean = value.replace(/\D/g, "");
    if (clean.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`);
      const data = await res.json();
      if (!data.erro) {
        setEndereco(data.logradouro || "");
        setBairro(data.bairro || "");
        setCidade(data.localidade || "");
      }
    } catch {
      // silencioso
    } finally {
      setBuscandoCep(false);
    }
  }

  const cpfDigits = cpf.replace(/\D/g, "");
  const cpfCompleto = cpfDigits.length === 11;
  const cpfValido = cpfCompleto && validarCpf(cpf);
  const cpfDuplicado =
    cpfValido && modalidade
      ? cpfJaInscritoNaModalidade(MOCK_RETIRANTES, cpf, modalidade)
      : false;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!cpfValido) {
      toast.error("CPF inválido.");
      return;
    }
    if (idade === null) {
      toast.error("Informe a data de nascimento.");
      return;
    }
    if (!modalidade) {
      toast.error("Selecione uma modalidade compatível com a idade.");
      return;
    }
    if (cpfDuplicado) {
      toast.error("Este CPF já está inscrito nesta modalidade.");
      return;
    }
    if (isAlliance && (!confirmaSenior || !confirmaMatrimonio || !anoSenior.trim() || !dataMatrimonio)) {
      toast.error("Para o Manancial Alliance, confirme os requisitos e preencha as datas.");
      return;
    }
    toast.success("Pré-cadastro enviado!");
    navigate({ to: "/sucesso" });
  }


  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-to-br from-[oklch(0.40_0.065_220)] to-[oklch(0.58_0.075_215)] px-6 py-10 text-white shadow-md">
        <div className="mx-auto max-w-2xl">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-white/85 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Link>
          <div className="mt-4 flex items-center gap-4">
            <img src={logo} alt="Manancial" className="h-20 w-20 shrink-0 drop-shadow-md md:h-24 md:w-24" />
            <div>
              <h1 className="text-2xl font-bold md:text-3xl">Formulário de Pré-inscrição</h1>
              <p className="mt-1 text-sm italic text-white/90 md:text-base">
                "Aquele que beber da água que eu darei, nunca mais terá sede" (Jo 4,14).
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          <span className="text-destructive">*</span> Campos obrigatórios
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <FormSection title="Dados Pessoais">
            <Field label="CPF" required>
              <Input
                required
                placeholder="000.000.000-00"
                inputMode="numeric"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                aria-invalid={cpfCompleto && !cpfValido}
              />
              {cpfCompleto && !cpfValido && (
                <p className="text-xs text-destructive">CPF inválido</p>
              )}
              {cpfValido && cpfDuplicado && (
                <p className="text-xs text-destructive">
                  Este CPF já está inscrito nesta modalidade
                </p>
              )}
              {cpfValido && !cpfDuplicado && (
                <p className="text-xs text-emerald-600">CPF válido</p>
              )}
            </Field>
            <Field label="Nome completo" required>
              <Input required placeholder="Seu nome completo" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field
                label="Data de nascimento"
                required
                hint={idade !== null ? `Idade: ${idade} ano${idade === 1 ? "" : "s"}` : undefined}
              >
                <Input
                  type="date"
                  required
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                />
              </Field>
              <Field label="WhatsApp" required>
                <Input
                  required
                  type="tel"
                  placeholder="(00) 00000-0000"
                  inputMode="numeric"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(formatPhone(e.target.value))}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="E-mail">
                <Input type="email" placeholder="seu@email.com" />
              </Field>
              <Field label="Tamanho da camisa" required>
                <Select required>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {TAMANHOS_CAMISA.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </div>
            <Field label="Instagram ou Facebook" hint="Link ou @ do perfil">
              <Input placeholder="@seuperfil" />
            </Field>

            <Field label="É casado(a)?" required>
              <RadioGroup value={eCasado} onValueChange={setECasado} className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="nao" /> Não
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="sim" /> Sim
                </label>
              </RadioGroup>
            </Field>
            {eCasado === "sim" && (
              <Field label="Nome do(a) cônjuge" required>
                <Input
                  required
                  placeholder="Nome completo do(a) cônjuge"
                  value={nomeConjuge}
                  onChange={(e) => setNomeConjuge(e.target.value)}
                />
              </Field>
            )}
          </FormSection>

          <FormSection title="Endereço">
            <Field label="CEP" required hint={buscandoCep ? "Buscando…" : "Buscaremos seu endereço automaticamente"}>
              <Input
                required
                placeholder="00000-000"
                inputMode="numeric"
                value={cep}
                onChange={(e) => {
                  const masked = formatCep(e.target.value);
                  setCep(masked);
                  buscarCep(masked);
                }}
              />
            </Field>
            <Field label="Endereço (rua)" required>
              <Input required value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Número" required>
                <Input
                  required
                  inputMode="numeric"
                  placeholder="Ex: 629"
                  value={numero}
                  onChange={(e) => setNumero(e.target.value)}
                />
              </Field>
              <Field label="Complemento" hint="Apto, bloco, referência (opcional)">
                <Input
                  placeholder="Ex: Apto 101"
                  value={complemento}
                  onChange={(e) => setComplemento(e.target.value)}
                />
              </Field>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Bairro" required>
                <Input required value={bairro} onChange={(e) => setBairro(e.target.value)} />
              </Field>
              <Field label="Cidade" required>
                <Input required value={cidade} onChange={(e) => setCidade(e.target.value)} />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Dados do Retiro">
            <Field label="Paróquia / Comunidade" required>
              <Input required placeholder="Ex: Paróquia São José" />
            </Field>
            <Field
              label="Modalidade do retiro"
              required
              hint={
                idade === null
                  ? "Informe a data de nascimento para ver as modalidades disponíveis para a sua idade."
                  : modalidadesDisponiveis.length === 0
                    ? `Nenhuma modalidade disponível para ${idade} ano${idade === 1 ? "" : "s"}.`
                    : `Mostrando modalidades compatíveis com ${idade} ano${idade === 1 ? "" : "s"}.`
              }
            >
              <Select
                value={modalidade}
                onValueChange={setModalidade}
                required
                disabled={idade === null || modalidadesDisponiveis.length === 0}
              >
                <SelectTrigger><SelectValue placeholder="Selecione a modalidade" /></SelectTrigger>
                <SelectContent>
                  {modalidadesDisponiveis.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>

            {isAlliance && (
              <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                <p className="text-sm font-medium text-foreground">
                  Requisitos para o Manancial Alliance
                </p>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={confirmaSenior}
                    onCheckedChange={(v) => setConfirmaSenior(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Confirmo que eu e meu cônjuge já realizamos o Manancial/Acampamento Sênior.
                    <span className="text-destructive">&nbsp;*</span>
                  </span>
                </label>
                <Field label="Em qual ano/edição vocês realizaram o Manancial/Acampamento Sênior?" required>
                  <Input
                    required={isAlliance}
                    placeholder="Ex: 2024"
                    value={anoSenior}
                    onChange={(e) => setAnoSenior(e.target.value)}
                  />
                </Field>
                <label className="flex items-start gap-3 text-sm">
                  <Checkbox
                    checked={confirmaMatrimonio}
                    onCheckedChange={(v) => setConfirmaMatrimonio(v === true)}
                    className="mt-0.5"
                  />
                  <span>
                    Confirmo que possuímos o Sacramento do Matrimônio.
                    <span className="text-destructive">&nbsp;*</span>
                  </span>
                </label>
                <Field label="Data do Sacramento do Matrimônio" required>
                  <Input
                    type="date"
                    required={isAlliance}
                    value={dataMatrimonio}
                    onChange={(e) => setDataMatrimonio(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                  />
                </Field>
              </div>
            )}

            <Field label="O que te motivou a se inscrever no Retiro Manancial?" required>
              <Textarea
                required
                placeholder="Conte um pouco sobre o que te trouxe até aqui"
                value={motivoInscricao}
                onChange={(e) => setMotivoInscricao(e.target.value)}
                rows={4}
              />
            </Field>
          </FormSection>

          <FormSection title="Saúde e Emergência">
            <Field label="Possui restrições alimentares?" required>
              <RadioGroup value={temRestricao} onValueChange={setTemRestricao} className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="nao" /> Não
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <RadioGroupItem value="sim" /> Sim
                </label>
              </RadioGroup>
            </Field>
            {temRestricao === "sim" && (
              <Field label="Quais restrições alimentares?" required>
                <Textarea required placeholder="Descreva as restrições" />
              </Field>
            )}
            <Field label="Alergias a medicamentos">
              <Textarea placeholder="Descreva alergias ou escreva 'Nenhuma'" />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field label="Contato de emergência (nome)" required>
                <Input required />
              </Field>
              <Field label="Contato de emergência (telefone)" required>
                <Input required type="tel" placeholder="(00) 00000-0000" />
              </Field>
            </div>
          </FormSection>

          <div className="flex justify-end pt-2">
            <Button type="submit" size="lg" className="rounded-full px-10">
              Enviar pré-inscrição
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}