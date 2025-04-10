# Peacemaker Bot

> A GitHub bot to analyze, moderate, and improve comments, fostering a positive and inclusive environment.

## Tecnologias Utilizadas

- **Linguagem:** TypeScript
- **Framework:** [Probot](https://probot.github.io/)
- **Banco de Dados:** MongoDB
- **ORM:** Mongoose
- **Ambiente:** Node.js

---

## Funcionalidades

### Webhook Listener

- [ ] **Recepção de Eventos do GitHub:**

  - O bot deve ser capaz de receber webhooks enviados pelo GitHub, por exemplo, quando um comentário for criado.

- [ ] **Validação da Assinatura:**

  - Validar o header `X-Hub-Signature` para assegurar que o payload é legítimo e originário do GitHub.

- [ ] **Extração dos Dados Essenciais:**

  - Extrair informações como:
    - Tipo do evento (ex.: `issue_comment`, `pull_request_review_comment`)
    - ID e nome do repositório
    - ID do comentário
    - Dados do usuário (id e login)
    - Corpo do comentário
    - Timestamp de criação

- [ ] **Persistência em MongoDB:**

  - Armazenar o evento na coleção apropriada do MongoDB utilizando Mongoose.

- [ ] **Logs e Tratamento de Erros:**
  - Registrar logs de recepção e processamento dos eventos.
  - Tratar e logar erros durante a validação ou persistência do evento.

## 4. Fluxo do Processamento

1. **Recepção do Webhook:**

   - O GitHub envia um webhook para o bot com o payload do evento.

2. **Extração dos Dados:**

   - O payload é processado para extrair os dados essenciais (detalhados na seção de modelagem).

3. **Persistência no MongoDB:**

   - Os dados extraídos são salvos em uma coleção utilizando o modelo Mongoose.

4. **Registro e Logs:**
   - Logs são registrados para cada evento processado e, em caso de erro, o mesmo deve ser logado com detalhes para facilitar a depuração.

## 7. Critérios de Aceitação

- O bot deve iniciar e estar preparado para receber webhooks do GitHub.
- Ao receber um webhook, o bot valida a assinatura e extrai os dados essenciais.
- Os dados extraídos devem ser persistidos corretamente no MongoDB, conforme o modelo definido.
- Logs devem ser gerados para cada evento processado, e erros devem ser tratados de maneira apropriada.
