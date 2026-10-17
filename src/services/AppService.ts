import axios from "axios";
import type {
  RequisitosRequestDto,
  RequisitosResponseDto,
} from "../models/AppModel";

export const api = axios.create({
  baseURL: "http://localhost:8080/ia",
  timeout: 5 * 60 * 1000, // minutos * segundos * milisegundos
});

export async function enviarRequisitos(
  requisitos: RequisitosRequestDto,
): Promise<RequisitosResponseDto[]> {
  const response = await api.post<RequisitosResponseDto[]>(
    "/envio",
    requisitos,
  );
  return response.data;
}
