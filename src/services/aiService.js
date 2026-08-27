export async function getBestModel(apiKey) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Falha ao listar modelos');
    }
    
    const data = await response.json();
    
    const validModels = data.models.filter(m => 
      m.supportedGenerationMethods && m.supportedGenerationMethods.includes('generateContent')
    );

    if (validModels.length === 0) {
      throw new Error('Nenhum modelo de geração de texto disponível para esta chave.');
    }

    const flashModel = validModels.find(m => m.name.includes('flash'));
    if (flashModel) return flashModel.name;

    const proModel = validModels.find(m => m.name.includes('pro'));
    if (proModel) return proModel.name;

    return validModels[0].name;
  } catch (error) {
    console.error("Erro ao buscar modelos disponíveis:", error);
    throw error;
  }
}

export async function suggestLearningPoints(eventoData, apiKey) {
  const modelName = await getBestModel(apiKey);
  
  const prompt = `
O usuário está criando um webinário ou aula gratuita com o título: "${eventoData.titulo}".
Por favor, sugira 3 a 5 pontos altamente persuasivos do que a pessoa aprenderá nessa aula. 
Escreva no formato de bullet points diretos (ex: "Como fazer X sem precisar de Y").

Retorne APENAS um objeto JSON no formato:
{ "pontos": "1. Ponto um\\n2. Ponto dois\\n3. Ponto três" }
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro HTTP ' + response.status);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text).pontos;
  } catch (error) {
    console.error("Erro no aiService (suggestLearningPoints):", error);
    throw new Error("Erro da API: " + error.message);
  }
}

export async function generateStrategy(minimalBriefing, apiKey) {
  const modelName = await getBestModel(apiKey);
  
  const prompt = `
Você é um Copywriter de Elite (nível Russell Brunson e Erico Rocha).
Sua missão é pegar um Briefing Mínimo fornecido pelo usuário e expandi-lo em uma Estratégia de Vendas Completa e Altamente Persuasiva.

DADOS FORNECIDOS PELO USUÁRIO:
--- PRODUTO ---
Nome: ${minimalBriefing.produto.nome}
Tipo: ${minimalBriefing.produto.tipo}
Descrição: ${minimalBriefing.produto.descricao}
Módulos: ${minimalBriefing.produto.modulos}
Preço: ${minimalBriefing.produto.preco}

--- EVENTO/AULA ---
Título: ${minimalBriefing.evento.titulo}
O que aprenderá: ${minimalBriefing.evento.aprendizado}

--- EXPERT ---
Nome: ${minimalBriefing.expert.nome}
Nicho: ${minimalBriefing.expert.nicho}
Credencial: ${minimalBriefing.expert.credencial}
Resultado: ${minimalBriefing.expert.resultado}

--- HISTÓRIA ---
Vida antes: ${minimalBriefing.historia.vidaAntes}
Fundo do poço: ${minimalBriefing.historia.crise}
A virada: ${minimalBriefing.historia.virada}
Vida hoje: ${minimalBriefing.historia.vidaHoje}

TAREFA:
Com base nesses dados, crie os pilares estratégicos da oferta.
Retorne EXCLUSIVAMENTE um objeto JSON válido. Use APENAS strings textuais para os valores (se houver listas, use quebras de linha com traços/números dentro da própria string).

O JSON deve ter EXATAMENTE estas chaves:
{
  "metodo": "Crie um nome atraente para o Método Único/Mecanismo Único do expert.",
  "icp": "Defina o Perfil de Cliente Ideal Detalhado (Dores, Desejos, Medos).",
  "linguagem": "Qual o tom de voz e palavras-chave que devem ser usadas para conectar com esse público?",
  "transformacao": "A Grande Promessa ou Transformação final do produto.",
  "dores": "As 3 Maiores Dores do público (escreva em formato de tópicos 1, 2 e 3).",
  "vilao": "O Vilão do Mercado (O inimigo comum ou a crença falsa que prende o cliente).",
  "solucoesFalhas": "O que eles já tentaram fazer antes que deu errado (e por que deu errado).",
  "cases": "Como posicionar os resultados do expert e de alunos como Casos Práticos de sucesso.",
  "garantia": "Sugestão de Garantia Inresistível e Ancoragem de Preço (comparando o preço com o valor).",
  "transicao": "O Gatilho de Transição (A frase ou argumento que faz a ponte entre o conteúdo gratuito e a venda).",
  "objecoes": "As 3 principais objeções que o público terá e como quebrá-las."
}
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro HTTP ' + response.status);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Erro no aiService (generateStrategy):", error);
    throw new Error("Erro da API: " + error.message);
  }
}

export async function generatePresentation(projectData, apiKey) {
  const modelName = await getBestModel(apiKey);

  const prompt = `
Você é um mestre em criação de webinários e pitchs de vendas estruturados.
Com base no briefing completo e na estratégia, crie o roteiro slide por slide.

DADOS DA ESTRATÉGIA:
Produto: ${projectData.minimalBriefing.produto.nome} (${projectData.minimalBriefing.produto.preco})
Promessa: ${projectData.completeBriefing.transformacao}
Dores: ${projectData.completeBriefing.dores}
Vilão: ${projectData.completeBriefing.vilao}
Método: ${projectData.completeBriefing.metodo}
Transição: ${projectData.completeBriefing.transicao}
Garantia: ${projectData.completeBriefing.garantia}

Você deve dividir a apresentação em 4 BLOCOS NARRATIVOS (usados como colunas num quadro Kanban).
Os blocos são:
1. "intro" (Introdução & Atenção) - Capa, grande promessa, prender a atenção.
2. "historia" (História & Conexão) - A jornada do herói, o vilão, a descoberta do método.
3. "conteudo" (O Método & Conteúdo) - O que é o método, como funciona, prova social/cases.
4. "pitch" (A Oferta & Pitch) - A transição, o empilhamento da oferta, preço, garantia, quebra de objeções.

TAREFA:
Retorne EXCLUSIVAMENTE um objeto JSON válido, contendo um array de objetos chamado "slides".
Não use markdown. Retorne apenas o texto puro do JSON.

Formato esperado:
{
  "slides": [
    {
      "columnId": "intro",
      "type": "Capa",
      "content": "Texto persuasivo que vai dentro deste slide..."
    },
    {
      "columnId": "historia",
      "type": "O Fundo do Poço",
      "content": "Texto do slide..."
    }
  ]
}

- Crie em média de 10 a 15 slides no total, bem distribuídos entre os 4 blocos.
- Os textos devem ser práticos, direto ao ponto e prontos para irem para a tela.
`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/${modelName}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Erro HTTP ' + response.status);
    }

    const data = await response.json();
    const text = data.candidates[0].content.parts[0].text;
    const parsedData = JSON.parse(text);
    
    // Ensure all items have an id
    return parsedData.slides.map((s, i) => ({
      ...s,
      id: s.id || `slide_ai_${Date.now()}_${i}`
    }));

  } catch (error) {
    console.error("Erro no aiService (generatePresentation):", error);
    throw new Error("Erro da API: " + error.message);
  }
}
