import React, { useState } from "react";
import axios from "axios";
import type {
  RequisitosResponseDto,
  ErroResponseDto,
} from "../models/AppModel";
import { enviarRequisitos } from "../services/AppService";

const tiposRequisito = {
  FUNCIONAL: "Funcional",
  NAO_FUNCIONAL: "Não Funcional",
};

export const Home: React.FC = () => {
  // Lista de textos dos requisitos
  const [requisitos, setRequisitos] = useState<string[]>([""]);

  // Estados de carregamento, resultado e erro
  const [loading, setLoading] = useState<boolean>(false);
  const [resultados, setResultados] = useState<RequisitosResponseDto[] | null>(
    null,
  );
  const [erro, setErro] = useState<string | null>(null);

  // Manipulação dos inputs de requisitos
  const handleAdicionarCampo = () => {
    if (requisitos.length >= 10) {
      setErro("Você pode enviar no máximo 10 requisitos por vez.");
      return;
    }
    setRequisitos([...requisitos, ""]);
  };

  const handleRemoverCampo = (index: number) => {
    if (requisitos.length === 1) return; // Mantém pelo menos um campo
    const novosRequisitos = requisitos.filter((_, i) => i !== index);
    setRequisitos(novosRequisitos);
  };

  const handleTextChange = (index: number, valor: string) => {
    const novosRequisitos = [...requisitos];
    novosRequisitos[index] = valor;
    setRequisitos(novosRequisitos);
  };

  // Envio para o backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setResultados(null);

    // Validação básica
    const requisitosFiltrados = requisitos
      .map((r) => r.trim())
      .filter((r) => r.length > 0);
    if (requisitosFiltrados.length === 0) {
      setErro("Por favor, preencha pelo menos um requisito antes de enviar.");
      return;
    } else if (requisitosFiltrados.length > 10) {
      setErro("Você pode enviar no máximo 10 requisitos por vez.");
      return;
    }

    setLoading(true);

    try {
      const data = await enviarRequisitos({ requisitos: requisitosFiltrados });
      // Trata se o backend retornar objeto único ou array
      setResultados(Array.isArray(data) ? data : [data]);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        console.error("Mensagem:", err.message);
        console.error("URL:", err.config?.url);
        console.error("Status:", err.response?.status);
        console.error("Resposta:", err.response?.data);

        if (err.response?.data) {
          const erroDto = err.response.data as ErroResponseDto;
          setErro(
            erroDto.mensagem ||
              erroDto.detalhe ||
              "Erro ao processar requisição.",
          );
        } else {
          setErro(`Falha na requisição: ${err.message}`);
        }
      } else {
        console.error("Erro inesperado:", err);
        setErro("Ocorreu um erro inesperado.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>IA Avaliadora de Requisitos</h1>
        <p style={styles.subtitle}>
          Submeta os seus requisitos para análise automatizada de qualidade e
          aprimoramento.
        </p>
      </header>

      <main style={styles.content}>
        {/* FORMULÁRIO DE ENTRADA */}
        <form onSubmit={handleSubmit} style={styles.card}>
          <h2 style={styles.sectionTitle}>Entrada de Requisitos</h2>

          {requisitos.map((req, index) => (
            <div key={index} style={styles.inputGroup}>
              <label style={styles.label}>Campo {index + 1}</label>
              <div style={styles.inputRow}>
                <textarea
                  style={styles.textarea}
                  placeholder={`Digite o requisito ${index + 1}...`}
                  value={req}
                  onChange={(e) => handleTextChange(index, e.target.value)}
                  rows={2}
                />
                <button
                  type="button"
                  style={{ ...styles.iconBtn, ...styles.btnRemove }}
                  onClick={() => handleRemoverCampo(index)}
                  disabled={requisitos.length === 1}
                  title="Remover campo"
                >
                  -
                </button>
              </div>
            </div>
          ))}

          <div style={styles.actionRow}>
            <button
              type="button"
              style={styles.btnAdd}
              onClick={handleAdicionarCampo}
            >
              + Adicionar Novo Requisito
            </button>

            <button
              type="submit"
              style={
                loading
                  ? { ...styles.btnSubmit, opacity: 0.7 }
                  : styles.btnSubmit
              }
              disabled={loading}
            >
              {loading ? "Analisando..." : "Enviar para Avaliação"}
            </button>
          </div>
        </form>

        {/* MENSAGEM DE ERRO */}
        {erro && (
          <div style={styles.errorCard}>
            ⚠️ <strong>Erro:</strong> {erro}
          </div>
        )}

        {/* EXIBIÇÃO DOS RESULTADOS */}
        {resultados && resultados.length > 0 && (
          <div style={styles.resultsContainer}>
            <h2 style={styles.sectionTitle}>Resultado da Análise</h2>

            {resultados.map((res, idx) => (
              <div key={idx} style={styles.resultCard}>
                <div style={styles.badgeGroup}>
                  <span style={styles.badgeType}>
                    {tiposRequisito[res.tipo]}
                  </span>
                  {res.necessitaAprimoramento && (
                    <span style={styles.badgeWarning}>
                      Necessita Aprimoramento
                    </span>
                  )}
                </div>

                <div style={styles.reqBlock}>
                  <h4>Requisito Original:</h4>
                  <p style={styles.reqText}>{res.requisitoOriginal}</p>
                </div>

                {/* NOTAS DA AVALIAÇÃO ORIGINAL */}
                <h5 style={{ marginTop: "15px", marginBottom: "10px" }}>
                  Pontuação da Avaliação Original:
                </h5>
                <div style={styles.metricsGrid}>
                  <MetricCard
                    label="Clareza"
                    value={res.avaliacaoOriginal?.clareza}
                  />
                  <MetricCard
                    label="Não Ambiguidade"
                    value={res.avaliacaoOriginal?.naoAmbiguidade}
                  />
                  <MetricCard
                    label="Completude"
                    value={res.avaliacaoOriginal?.completude}
                  />
                  <MetricCard
                    label="Consistência"
                    value={res.avaliacaoOriginal?.consistencia}
                  />
                  <MetricCard
                    label="Testabilidade"
                    value={res.avaliacaoOriginal?.testabilidade}
                  />
                  <MetricCard
                    label="Mensurabilidade"
                    value={res.avaliacaoOriginal?.mensurabilidade}
                  />
                  <MetricCard
                    label="Qualidade Geral"
                    value={res.avaliacaoOriginal?.qualidadeGeral}
                    max={10}
                    highlight
                  />
                </div>

                {/* DEFICIÊNCIAS */}
                {res.deficiencias && res.deficiencias.length > 0 && (
                  <div style={styles.deficienciesBlock}>
                    <h4>Deficiências Encontradas:</h4>
                    <ul>
                      {res.deficiencias.map((d, dIdx) => (
                        <li key={dIdx}>{d}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* REQUISITO APRIMORADO */}
                {res.requisitoAprimorado && (
                  <div style={styles.improvedBlock}>
                    <h4>Sugestão de Requisito Aprimorado:</h4>
                    <p style={styles.improvedText}>{res.requisitoAprimorado}</p>

                    {res.avaliacaoAprimorada && (
                      <>
                        <h5 style={{ marginTop: "10px", marginBottom: "10px" }}>
                          Pontuação do Requisito Aprimorado:
                        </h5>
                        <div style={styles.metricsGrid}>
                          <MetricCard
                            label="Clareza"
                            value={res.avaliacaoAprimorada?.clareza}
                          />
                          <MetricCard
                            label="Não Ambiguidade"
                            value={res.avaliacaoAprimorada?.naoAmbiguidade}
                          />
                          <MetricCard
                            label="Completude"
                            value={res.avaliacaoAprimorada?.completude}
                          />
                          <MetricCard
                            label="Consistência"
                            value={res.avaliacaoAprimorada?.consistencia}
                          />
                          <MetricCard
                            label="Testabilidade"
                            value={res.avaliacaoAprimorada?.testabilidade}
                          />
                          <MetricCard
                            label="Mensurabilidade"
                            value={res.avaliacaoAprimorada?.mensurabilidade}
                          />
                          <MetricCard
                            label="Qualidade Geral Aprimorada"
                            value={res.avaliacaoAprimorada.qualidadeGeral}
                            max={10}
                            highlight
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

// Componente para os cards de métricas e notas
const MetricCard = ({
  label,
  value,
  max = 5,
  highlight,
}: {
  label: string;
  value?: number;
  max?: number;
  highlight?: boolean;
}) => (
  <div
    style={{
      ...styles.metricCard,
      ...(highlight ? styles.metricHighlight : {}),
    }}
  >
    <span style={styles.metricLabel}>{label}</span>
    <span style={styles.metricValue}>
      {value !== undefined ? `${value}/${max}` : "N/A"}
    </span>
  </div>
);

// CSS:
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f4f6f9",
    fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
    padding: "20px",
    color: "#333",
  },
  header: {
    textAlign: "center",
    marginBottom: "30px",
  },
  title: {
    color: "#2c3e50",
    margin: 0,
  },
  subtitle: {
    color: "#7f8c8d",
    marginTop: "5px",
  },
  content: {
    maxWidth: "800px",
    margin: "0 auto",
  },
  card: {
    backgroundColor: "#fff",
    padding: "25px",
    borderRadius: "10px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    color: "#34495e",
    borderBottom: "2px solid #ecf0f1",
    paddingBottom: "10px",
  },
  inputGroup: {
    marginBottom: "15px",
  },
  label: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "5px",
    color: "#555",
  },
  inputRow: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
  },
  textarea: {
    flex: 1,
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    fontSize: "14px",
    resize: "vertical",
  },
  iconBtn: {
    width: "38px",
    height: "38px",
    fontSize: "20px",
    fontWeight: "bold",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  btnRemove: {
    backgroundColor: "#e74c3c",
    color: "#fff",
  },
  actionRow: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: "20px",
    gap: "10px",
  },
  btnAdd: {
    backgroundColor: "#ecf0f1",
    color: "#2c3e50",
    border: "1px solid #bdc3c7",
    padding: "10px 15px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  btnSubmit: {
    backgroundColor: "#27ae60",
    color: "#fff",
    border: "none",
    padding: "10px 20px",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
  },
  errorCard: {
    marginTop: "20px",
    backgroundColor: "#fde8e8",
    color: "#c0392b",
    padding: "15px",
    borderRadius: "8px",
    border: "1px solid #f5c6cb",
  },
  resultsContainer: {
    marginTop: "30px",
  },
  resultCard: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginBottom: "20px",
    boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
  },
  badgeGroup: {
    display: "flex",
    gap: "10px",
    marginBottom: "15px",
  },
  badgeType: {
    backgroundColor: "#3498db",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  badgeWarning: {
    backgroundColor: "#e67e22",
    color: "#fff",
    padding: "4px 8px",
    borderRadius: "4px",
    fontSize: "12px",
    fontWeight: "bold",
  },
  reqBlock: {
    backgroundColor: "#f8f9fa",
    padding: "12px",
    borderRadius: "6px",
    borderLeft: "4px solid #3498db",
  },
  reqText: {
    margin: 0,
    fontStyle: "italic",
  },
  metricsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
    gap: "10px",
  },
  metricCard: {
    backgroundColor: "#f1f2f6",
    padding: "10px",
    borderRadius: "6px",
    textAlign: "center",
  },
  metricHighlight: {
    backgroundColor: "#e1f5fe",
    border: "1px solid #81d4fa",
  },
  metricLabel: {
    display: "block",
    fontSize: "11px",
    color: "#666",
    marginBottom: "4px",
  },
  metricValue: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "#2c3e50",
  },
  deficienciesBlock: {
    marginTop: "15px",
    backgroundColor: "#fff5f5",
    padding: "10px 15px",
    borderRadius: "6px",
    borderLeft: "4px solid #e74c3c",
  },
  improvedBlock: {
    marginTop: "15px",
    backgroundColor: "#f0fff4",
    padding: "15px",
    borderRadius: "6px",
    borderLeft: "4px solid #2ecc71",
  },
  improvedText: {
    fontSize: "15px",
    fontWeight: "500",
    color: "#27ae60",
  },
};
