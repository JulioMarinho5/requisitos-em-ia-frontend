export interface RequisitosRequestDto {
    requisitos: string[];
}

export interface RequisitosResponseDto {
    requisitoOriginal: string;
    tipo: 'FUNCIONAL' | 'NAO_FUNCIONAL';
    avaliacaoOriginal: AvaliacaoDto;
    deficiencias: string[];
    necessitaAprimoramento: boolean;
    requisitoAprimorado: string;
    avaliacaoAprimorada: AvaliacaoDto;
}

export interface AvaliacaoDto {
    clareza: number;
    naoAmbiguidade: number;
    completude: number;
    consistencia: number;
    testabilidade: number;
    mensurabilidade: number;
    qualidadeGeral: number;
}

export interface ErroResponseDto {
    valor: number;
    mensagem: string;
    detalhe?: string;
    data: string;
}