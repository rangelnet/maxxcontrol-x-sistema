/**
 * MaxxFlow Local Knowledge Engine
 * Responsável por calcular a similaridade de texto e encontrar a melhor resposta
 * sem depender de APIs externas (100% Offline).
 */

function getSimilarity(s1, s2) {
  let longer = s1.toLowerCase();
  let shorter = s2.toLowerCase();
  if (s1.length < s2.length) {
    longer = s2.toLowerCase();
    shorter = s1.toLowerCase();
  }
  let longerLength = longer.length;
  if (longerLength === 0) return 1.0;
  return (longerLength - editDistance(longer, shorter)) / parseFloat(longerLength);
}

function editDistance(s1, s2) {
  let costs = [];
  for (let i = 0; i <= s1.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= s2.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (s1.charAt(i - 1) !== s2.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[s2.length] = lastValue;
  }
  return costs[s2.length];
}

/**
 * Encontra a melhor combinação entre a mensagem do usuário e um conjunto de gatilhos (triggers).
 * @param {string} input - Mensagem do usuário.
 * @param {Array} triggers - Lista de strings ou objetos com gatilhos.
 * @param {number} threshold - Nível mínimo de confiança (default 0.6).
 */
function findBestMatch(input, triggers, threshold = 0.6) {
  let bestMatch = { index: -1, score: 0, text: '' };

  triggers.forEach((trigger, idx) => {
    const triggerText = typeof trigger === 'string' ? trigger : (trigger.text || '');
    const score = getSimilarity(input, triggerText);
    
    if (score > bestMatch.score) {
      bestMatch = { index: idx, score, text: triggerText };
    }
  });

  return bestMatch.score >= threshold ? bestMatch : null;
}

module.exports = { getSimilarity, findBestMatch };
