/** Remove acentos e caixa para buscas tolerantes ("acessibilidade" encontra "Acessibilidade"). */
export const normalize = (x: string) => x.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
