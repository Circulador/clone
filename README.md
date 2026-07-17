# 🇮🇹 Consultor de Fila Consular — Cidadania Italiana (RJ e ES)

Painel **comunitário, interativo e colaborativo** para acompanhamento da fila de reconhecimento da cidadania italiana (*Jure Sanguinis*) junto ao Consulado Geral da Itália no Rio de Janeiro.

> ⚠️ **FERRAMENTA NÃO OFICIAL** — Desenvolvida voluntariamente pela comunidade. Não possui vínculo com o Consulado Geral da Itália, com o Governo Italiano ou com o Governo Brasileiro. Somente o Consulado possui acesso aos dados oficiais dos processos.

---

## 🔎 O que a ferramenta faz

### 📍 Acompanhamento individual

- Busca do processo por **sigla, nome ou data de entrega**.
- Cálculo da **posição estimada na fila**.
- Indicadores de progresso e tempo de espera.
- Acompanhamento do **prazo legal máximo de 730 dias** com barra de progresso.
- Projeção de convocação em três cenários:
  - 🚀 **Otimista**
  - 🎯 **Realista**
  - 🕐 **Conservador**
- Exibição de **janela provável de convocação**.
- Índice de **confiabilidade da estimativa**.
- Análise do movimento da fila, mostrando:
  - quantos processos à frente já foram atendidos;
  - quantos ainda aguardam;
  - quantos processos posteriores já foram concluídos.

### 📊 Visão da comunidade

- Painel geral da comunidade.
- Total de processos cadastrados na base.
- Quantidade de processos concluídos e aguardando.
- Estatísticas dos tempos de espera.
- Histograma de distribuição dos prazos.
- Percentis e mediana.
- Ranking mensal de velocidade das convocações.
- Tabela geral pesquisável, filtrável e ordenável.

### ⭐ Recursos pessoais

- Sistema de **favoritos** para acompanhar processos específicos.
- Compartilhamento de processos por link.
- Tema claro e escuro.
- Exportação/impressão em PDF.
- Layout responsivo para celular, tablet e computador.
- Instalação como aplicativo (**PWA**).
- Salvamento local das preferências do usuário.

### 🗺️ Minha jornada

A ferramenta permite acompanhar as **16 etapas** do processo de cidadania:

1. Agendamento no Consulado
2. Entrega da documentação
3. E-mail de deferimento ou pendência
4. Conclusão da etapa consular via PEC
5. Envio da documentação ao Comune
6. Transcrição no Registro Civil Italiano
7. Inscrição no AIRE e cadastro no ANPR
8. Inclusão na lista eleitoral
9. Comunicação do Comune ao Consulado
10. Atualização dos sistemas consulares e Fast It
11. Solicitação do passaporte italiano
12. Emissão e recebimento do passaporte
13. Solicitação da CIE
14. Emissão e recebimento da CIE
15. Habilitação dos serviços ao cidadão
16. Jornada concluída

Também inclui:

- Contador automático dos **180 dias** para solicitação do passaporte.
- Registro de datas importantes.
- Barra de progresso da jornada.
- Radar visual dos estágios do processo.
- Exportação da jornada para PDF.

---

## 🌐 Acesso

👉 **Acesso ao painel:** [Consultor de Fila Consular](https://circulador.github.io/consulado/)

Repositório: [github.com/Circulador/consulado](https://github.com/Circulador/consulado)

---

## 📊 Fonte dos dados

As estatísticas são baseadas em planilhas **voluntárias e colaborativas** mantidas pela comunidade:

### 📊 B — Balcão

Fila após a entrega dos documentos até o recebimento do e-mail **"Já Sou Italiano"** ou de eventual pendência.

### 🇮🇹 JSI — Já Sou Italiano

Período posterior ao reconhecimento, acompanhando a espera pelo e-mail PEC de conclusão da etapa consular.

### 📎 P — Pendências

Tempo de resolução de pendências documentais enviadas ao Consulado via SEDEX.

---

## 🔄 Atualização dos dados

A plataforma suporta diferentes formas de atualização da base:

### ✅ Atualização por `dados.json`

O site pode carregar automaticamente um arquivo `dados.json`, gerado a partir dos dados consolidados do projeto.

Esse formato é o mais indicado para uso com **GitHub Pages** e automação via **GitHub Actions**.

### ✅ Upload manual da planilha

Também é possível carregar manualmente arquivos:

- `.xlsx`
- `.xls`
- `.csv`

Após o carregamento, a ferramenta reprocessa os dados automaticamente no navegador, sem necessidade de alteração no código.

---

## 📱 Aplicativo (PWA)

O site pode ser instalado diretamente no dispositivo como aplicativo:

- Android
- iPhone / iPad
- Windows
- macOS

Quando instalado, pode ser aberto de forma semelhante a um aplicativo independente.

---

## 🔒 Privacidade

Os dados pessoais de uso da ferramenta ficam armazenados apenas no navegador do usuário, por meio de `localStorage`.

Ficam salvos localmente:

- favoritos;
- progresso da jornada;
- datas registradas;
- preferência de tema;
- configurações visuais.

Essas informações **não são enviadas para servidores externos** pela aplicação.

---

## ⚠️ Aviso importante

As informações apresentadas neste painel são **colaborativas** e baseadas em dados compartilhados voluntariamente pelos participantes da comunidade.

Por esse motivo, podem existir:

- processos não cadastrados;
- informações desatualizadas;
- processos já concluídos sem atualização;
- divergências em relação aos registros oficiais;
- diferenças entre a fila comunitária e a fila real do Consulado.

Os indicadores, gráficos e projeções possuem **caráter exclusivamente informativo e estimativo**. Eles não representam prazo oficial, garantia de atendimento ou compromisso institucional.

**Somente o Consulado Geral da Itália possui acesso aos registros oficiais dos processos e permanece como a única fonte oficial para consulta de status, prazos e informações. Este painel não substitui os canais oficiais de comunicação do Consulado.**

---

## 🛠️ Tecnologias utilizadas

- HTML5
- CSS3
- JavaScript ES6+
- Chart.js
- Progressive Web App (PWA)
- GitHub Pages
- GitHub Actions
- JSON Dataset (`dados.json`)
- LocalStorage

---

## 📁 Estrutura sugerida do projeto

```text
consulado/
├── index.html
├── dados.json
├── manifest.json
├── sw.js
├── icon-192.png
├── icon-512.png
└── README.md
```

---

## 💙 Sobre o projeto

Este projeto nasceu inicialmente como uma ferramenta pessoal para acompanhar o processo de cidadania dos meus irmãos e reduzir a ansiedade natural da longa espera consular.

Com o tempo, a ferramenta evoluiu e passou a ser compartilhada com a comunidade, transformando-se em um painel colaborativo de acompanhamento estatístico. A ideia é ajudar outras pessoas a terem uma visão mais clara da evolução da fila, sempre com transparência sobre as limitações de uma base comunitária e não oficial.

Feedbacks, sugestões, correções e contribuições são sempre bem-vindos.

Juntos, tornamos a informação mais acessível, organizada e útil para toda a comunidade.

---

## 🤝 Contribuições

Sugestões de melhorias, correções de bugs e novas funcionalidades podem ser discutidas diretamente no grupo da comunidade ou por meio deste repositório.

Caso identifique algum dado incorreto ou desatualizado, informe a comunidade para que a base possa ser ajustada.

---

*Feito com ❤️ pela comunidade, para a comunidade.*

**In bocca al lupo a tutti! 🇮🇹🍀**
