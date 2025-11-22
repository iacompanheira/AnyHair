// utils/rounding.ts

/**
 * Aplica uma regra de arredondamento comercial para cima, fazendo o preço terminar em 5,90 ou 9,90.
 * @param price O preço base calculado.
 * @returns O preço final arredondado.
 */
export const applyCustomRounding = (price: number): number => {
  if (price <= 0) return 5.90;

  // 1. Arredonda o preço para cima para o próximo inteiro.
  // Ex: 84.69 -> 85; 273.64 -> 274; 65.27 -> 66; 80.00 -> 80
  const baseInteger = Math.ceil(price);

  // 2. Determina o alvo (5 ou 9) com base no último dígito.
  const lastDigit = baseInteger % 10;
  let targetInteger;

  if (lastDigit > 5) {
    // Se o último dígito for 6, 7, 8, 9, o alvo é o próximo 9.
    // Ex: 66 -> 69
    targetInteger = Math.floor(baseInteger / 10) * 10 + 9;
  } else {
    // Se o último dígito for 0, 1, 2, 3, 4, 5, o alvo é o próximo 5.
    // Ex: 85 -> 85; 274 -> 275; 80 -> 85
    targetInteger = Math.floor(baseInteger / 10) * 10 + 5;
     if (baseInteger > targetInteger) {
        // Caso especial para números como 85.01, que viram 86 e cairiam aqui.
        // O alvo seria 85, mas como 86 > 85, precisa ir pro próximo 9.
        targetInteger = Math.floor(baseInteger / 10) * 10 + 9;
     }
  }
  
  // 3. Retorna o inteiro alvo + 0.90
  return targetInteger + 0.90;
};