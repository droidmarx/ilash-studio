# ✨ I Lash Studio — Luxury Agenda System

> A arte de gerenciar olhares com a exclusividade que suas clientes merecem.

O **I Lash Studio** é um ecossistema de gestão premium desenvolvido especificamente para Lash Designers que buscam elevar o nível do seu atendimento. Combinando uma interface de luxo (Rose Gold & Anthracite) com automações inteligentes via Telegram, o sistema cuida da burocracia para que você foque no que faz de melhor: transformar olhares.

---

## 💎 Como o Aplicativo Funciona (Passo a Passo)

### 1. O Portal da Lash Designer (Admin)
Ao acessar o sistema com suas credenciais exclusivas, você entra em um centro de comando completo:
- **Calendário VIP:** Visualize sua ocupação mensal com marcadores coloridos por tipo de procedimento (Aplicação, Manutenção, Remoção).
- **Dashboard Financeiro:** Abaixo do calendário, o sistema calcula automaticamente seus ganhos por semana (domingo a sábado) e o faturamento total do mês.
- **Gestão de Clientes:** Uma base de dados completa onde você pode editar agendamentos, excluir registros e gerenciar fichas de saúde.

### 2. A Experiência da Cliente (Link de Agendamento)
Você pode disponibilizar um link exclusivo (ex: no seu Instagram) onde a cliente realiza o próprio agendamento:
1. **Identificação:** Nome e WhatsApp.
2. **Procedimento:** Escolha entre Aplicação, Manutenção ou Remoção (com média de valores).
3. **Técnica:** Seleção da técnica desejada (Brasileiro, Egípcio, etc).
4. **Data e Hora:** Calendário interativo com horários pré-definidos.
5. **Anamnese Digital:** Coleta de dados de saúde, autorização de imagem e **assinatura digital** na tela do celular.

### 3. O Robô Assistente (Telegram)
O sistema não dorme. Ele utiliza um Bot no Telegram para manter você sempre informada:
- **Notificações em Tempo Real:** Assim que uma cliente agenda, você recebe os detalhes instantaneamente.
- **Resumo da Manhã:** Todo dia às 08:00, o bot envia sua agenda completa do dia.
- **Lembrete de 2 Horas:** 2 horas antes de cada atendimento, o bot avisa: "Sua cliente chega em breve!".

---

## 🚀 Guia de Integrações

Para que o sistema funcione perfeitamente, você precisa configurar dois pilares: a base de dados (**MockAPI**) e a comunicação (**Telegram**).

### 1. Configurando o MockAPI (Seu Banco de Dados)
O sistema utiliza o MockAPI como um banco de dados ágil e gratuito.
1. Crie uma conta em [mockapi.io](https://mockapi.io/).
2. Crie um projeto chamado `I Lash Studio`.
3. Crie dois recursos (Resources):
   - `Clientes`: Adicione os campos necessários (nome, data, servico, valor, anamnese, etc).
   - `config`: Este recurso salvará suas chaves de API e configurações de admin.
4. No painel de **Configurações** do App, cole a URL gerada pelo MockAPI no campo "URL Base".

### 2. Configurando o Telegram (Seu Assistente)
#### Passo A: Criar o Bot
1. No Telegram, procure pelo `@BotFather`.
2. Digite `/newbot` e siga as instruções para dar um nome ao seu robô.
3. Copie o **HTTP API Token** gerado.

#### Passo B: Obter seu Chat ID
1. Procure pelo bot `@userinfobot` no Telegram.
2. Envie qualquer mensagem e ele responderá com o seu `Id` (um número). Este é o seu **Chat ID**.

#### Passo C: Ativar o Modo Interativo
1. Vá nas **Configurações** do I Lash Studio.
2. Cole o **Bot Token** e adicione você como **Destinatário** usando seu Chat ID.
3. Clique em **"Ativar Bot Interativo"**. 
4. Agora seu bot responderá a comandos como:
   - `/command1`: Agenda de Hoje.
   - `/command2`: Agenda do Mês.
   - `/command3`: Agenda da Semana (Dom a Sáb).

---

## ⏰ Automações de Lembretes (GitHub Actions)
Para que o sistema envie o resumo matinal e os alertas de 2 horas automaticamente, o arquivo `.github/workflows/reminders.yml` já está configurado.
- Ele "acorda" o servidor a cada 15 minutos para verificar se há clientes chegando ou se é hora do resumo das 08:00.

---

## 🎨 Identidade Visual
O sistema alterna entre dois temas luxuosos:
- **Tema Light (Off-White & Rose Gold):** Ideal para uso durante o dia, transmitindo limpeza e sofisticação.
- **Tema Dark (Anthracite & Gold):** Um visual "Luxury Night" para uma gestão de alto impacto.

---
*Desenvolvido para Lash Designers que não aceitam nada menos que a perfeição.*