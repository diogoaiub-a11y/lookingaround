const messages = document.querySelector("#messages");
const form = document.querySelector("#chat-form");
const input = document.querySelector("#user-input");
const resetButton = document.querySelector("#reset-chat");
const quickPrompts = document.querySelector(".quick-prompts");

const crisisWords = [
  "suicidio",
  "suicídio",
  "se matar",
  "morrer",
  "sumir pra sempre",
  "acabar com tudo",
  "não aguento mais",
  "nao aguento mais",
  "despedida",
  "carta",
  "arma",
  "remedio",
  "remédio",
  "ponte",
];

const topicRules = [
  {
    name: "isolamento",
    words: ["isolado", "isolando", "sumiu", "quieto", "não sai", "nao sai", "afastou", "sozinho"],
    advice: [
      "Chame em particular, sem plateia e sem tom de cobrança.",
      "Use observação concreta: “percebi que você sumiu e fiquei preocupado”.",
      "Ofereça uma ação pequena: comer algo, caminhar 10 minutos ou ficar junto em silêncio.",
    ],
  },
  {
    name: "irritação",
    words: ["irritado", "raiva", "explodindo", "grosso", "agressivo", "bravo", "estourando"],
    advice: [
      "Não entre em disputa de força. Fale baixo e mantenha distância segura.",
      "Depois que a tensão baixar, nomeie o cuidado: “não quero brigar, quero entender o que está pesando”.",
      "Se houver ameaça ou violência, priorize segurança e peça ajuda externa.",
    ],
  },
  {
    name: "trabalho/pressão",
    words: ["trabalho", "emprego", "dinheiro", "fracasso", "pressão", "pressao", "cobrança", "cobranca"],
    advice: [
      "Homens às vezes traduzem dor como sensação de falha. Evite começar com “você precisa melhorar”.",
      "Pergunte sobre peso, não sobre desempenho: “o que está ficando pesado demais?”.",
      "Ajude a transformar caos em uma próxima ação: descanso, conta urgente, conversa, médico, terapia ou rede de apoio.",
    ],
  },
  {
    name: "relacionamento",
    words: ["namorado", "marido", "pai", "irmão", "irmao", "amigo", "filho"],
    advice: [
      "Você pode se importar sem virar terapeuta da pessoa.",
      "Diga com clareza que ele não precisa explicar tudo para merecer companhia.",
      "Combine um check-in simples: “posso te mandar mensagem hoje à noite?”.",
    ],
  },
  {
    name: "álcool/substâncias",
    words: ["bebendo", "alcool", "álcool", "droga", "chapado", "bêbado", "bebado"],
    advice: [
      "Não tente uma conversa profunda se ele estiver alterado.",
      "Reduza risco imediato: água, comida, tirar de volante/objetos perigosos e chamar alguém confiável.",
      "No dia seguinte, fale sobre o padrão sem humilhar: “isso está aparecendo quando você piora”.",
    ],
  },
];

startChat();

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const text = input.value.trim();
  if (!text) return;
  addMessage(text, "user");
  input.value = "";
  window.setTimeout(() => addMessage(buildReply(text), "bot"), 260);
});

resetButton.addEventListener("click", startChat);

quickPrompts.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-prompt]");
  if (!button) return;
  input.value = button.dataset.prompt;
  input.focus();
});

function startChat() {
  messages.innerHTML = "";
  addMessage(
    `Eu posso te ajudar a pensar no que fazer, mas não substituo psicólogo, médico ou emergência. Me conte a situação: quem é a pessoa, o que mudou no comportamento e se existe algum risco imediato.`,
    "bot",
  );
}

function buildReply(text) {
  const normalized = normalize(text);

  if (crisisWords.some((word) => normalized.includes(normalize(word)))) {
    return `
      <strong>Isso pode ser risco imediato. A prioridade agora é segurança, não convencer a pessoa.</strong>
      <ul>
        <li>Não deixe a pessoa sozinha se houver risco de se machucar.</li>
        <li>Afaste remédios, armas, objetos cortantes, carro/chaves e outros meios perigosos, se for seguro fazer isso.</li>
        <li>Chame alguém de confiança para ficar junto com você.</li>
        <li>No Brasil, ligue CVV 188 para apoio emocional 24h. Em emergência, SAMU 192 ou emergência local.</li>
        <li>Fale de forma simples: “eu não vou te julgar, mas eu preciso te manter seguro agora”.</li>
      </ul>
    `;
  }

  const matched = topicRules.filter((rule) => rule.words.some((word) => normalized.includes(normalize(word))));
  const advice = matched.flatMap((rule) => rule.advice).slice(0, 6);
  const baseAdvice = advice.length
    ? advice
    : [
        "Comece perguntando de forma direta e calma: “você está carregando isso sozinho?”",
        "Não force confissão. Ofereça presença: “você não precisa falar tudo agora, mas eu posso ficar”.",
        "Observe padrão: sono, isolamento, irritação, perda de interesse, álcool, frases de desesperança.",
        "Se isso durar dias/semanas ou piorar, incentive ajuda profissional e ofereça companhia para marcar/ir.",
      ];

  return `
    <strong>O melhor primeiro passo é diminuir a vergonha e aumentar a segurança.</strong>
    <ul>
      ${baseAdvice.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
    </ul>
    <br />
    Uma frase boa para usar: <strong>“Eu não preciso que você seja forte comigo. Só preciso saber como ficar do seu lado hoje.”</strong>
    <br /><br />
    Se quiser, me diga: ele falou algo sobre morrer/sumir, ou é mais isolamento e mudança de comportamento?
  `;
}

function addMessage(content, type) {
  const bubble = document.createElement("article");
  bubble.className = `message ${type}`;
  bubble.innerHTML = type === "bot" ? content : escapeHtml(content);
  messages.appendChild(bubble);
  messages.scrollTop = messages.scrollHeight;
}

function normalize(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
