# :checkered_flag: THE PEACEMAKER BOT

## :technologist: Membros da equipe e Orientador

-   538897 - Antonio Lucas Melo de Sousa.
-   539355 - José Eric Mesquita Coelho.
-   540910 - Matheus Feitosa de Oliveira Rabelo.
-   XXXXXX - Carlos Jefté Bastos de Mesquita Freire.
-   XXXXXX - Emanuel Ávila Cruz Pires.
-   XXXXXX - Anderson Gonçalves Uchôa.

## :people_holding_hands: Papéis ou tipos de usuário da aplicação

> Contribuidor: Seus comentários em um repositório com o Peacemaker Bot instalado irão ser analisados e salvos no banco de dados. Os casos de comentários incivilizados serão notificados a ele pelo site ou aplicativo do bot, que terá a opção de corrigí-los com a LLM, por conta própria ou negar a correção.
> Admin de Repositório: Tem a mesma funcionalidade do desenvolvedor (afinal, ele também pode comentar nos repositórios), porém, ele tem acesso ao dashboard onde estatísticas sobre as incivilidades em um repositório específico, no qual ele tem privilégios de administração, podem ser visualizadas.

## :spiral_calendar: Entidades ou tabelas do sistema

Liste as principais entidades do sistema.

-   Usuário
    -   Contribuidor
    -   Admin de Repositório
-   Comentários
-   Repositorios

## :triangular_flag_on_post: Principais funcionalidades da aplicação por usuário

> Contribuidor:

-   Login Social com GitHub
-   Visualizar Notificações de Comentários Incívilizados feitos por ele
-   Corrigir ou contestar a notificação do Comentário Incívilizado

> Amdmin (Uma extensão do Contribuidor, com mais privilégios):

-   Acesso ao dashboard de repositórios no qual é admin
-   Visualização de estatíscas de tipos de incivilidades

---

## :scroll: Descrição Geral do Sistema

### Visão Geral

O Peacemaker Bot é um sistema projetado para monitorar e analisar os comentários feitos em repositórios de código no GitHub, com foco em identificar e mitigar a incivilidade e toxicidade nas interações entre contribuidores. O sistema não apenas detecta comentários incivilizados, mas também fornece recomendações para suavizar a linguagem, promovendo um ambiente mais saudável e colaborativo.

O bot atua de forma não intrusiva, sugerindo correções para os comentários detectados como tóxicos, sem forçar os usuários a aceitarem as alterações. Além disso, o sistema oferece um dashboard para os administradores de repositórios, onde podem visualizar estatísticas sobre a incivilidade dos comentários em seus projetos, permitindo um maior controle sobre a saúde do ambiente de trabalho.

Tanto o Dashboard quanto as recomendações estão localizados no site do bot, onde os usuários podem acessar com seu perfil do GitHub.

### Objetivos do Sistema

-   **Monitorar índices de incivilidade/toxicidade de repositórios de código e comunidades de software**: Identificar e avaliar o nível de civilidade nos comentários feitos em issues e pull requests.
-   **Fornecer feedback aos desenvolvedores sobre a civilidade de seus comentários**: Alertar os desenvolvedores sobre comentários que possam ser considerados incivilizados e sugerir melhorias. Estas notificações estão no mesmo menu que as recomendações, que são entregues junto desses alertas.
-   **Fornecer recomendações para suavizar a incivilidade/toxicidade de comentários**: Oferecer sugestões de correção que os desenvolvedores podem adotar para melhorar a linguagem utilizada em seus comentários.
-   **Fornecer a administradores de repositórios indicadores de civilidade da comunidade e do projeto (project health)**: Proporcionar uma visão clara da civilidade nas interações dentro do repositório, permitindo que os gerentes de projeto acompanhem e tomem decisões informadas.

### A Necessidade

A análise de comentários no GitHub, especificamente em issues e pull requests, é essencial para a criação de um ambiente mais civilizado. Comentários tóxicos ou incivilizados podem prejudicar a colaboração e o progresso do projeto, criando um ambiente no qual pessoas tem receio de contribuir. O Peacemaker Bot visa endereçar essa necessidade ao analisar e moderar comentários, visando não ser intrusivo, para manter mais civilizado sem que os usuários se sentirem obrigados a aceitar as condições de moderação.

### Afeta

O Peacemaker Bot impacta diretamente a comunidade do GitHub, fornecendo um meio automatizado para moderar comentários e monitorar conversas em repositórios. Além disso, os administradores de repositórios terão uma ferramenta poderosa para acompanhar o comportamento de seus desenvolvedores e manter um ambiente de trabalho saudável.

### Impacto

O impacto da solução é significativo, pois automatiza a moderação de comentários nas discussões dos repositórios no GitHub, oferecendo maior controle para os donos dos repositórios sobre o ambiente nas issues e pull requests. Isso contribui para um ambiente de trabalho mais civilizado, onde a colaboração pode prosperar sem as barreiras causadas por interações negativas.

### Benefícios da Solução

-   **Ambiente mais saudável e civilizado em Pull Requests e Issues**: Redução da toxicidade nos comentários, promovendo uma cultura de respeito e colaboração.
-   **Maior controle pelo líder da equipe**: Os administradores podem monitorar e gerenciar a saúde do ambiente de trabalho de forma mais eficaz.
-   **Correção de comentários tóxicos ou incivilizados**: Os desenvolvedores têm a oportunidade de melhorar a qualidade de seus comentários, com sugestões claras e não intrusivas.
-   **Dashboard para visualização de dados**: Uma interface intuitiva que permite aos administradores acompanhar as estatísticas de incivilidade e tomar decisões informadas para melhorar a saúde do projeto.

---

## :pencil: Requisitos do Sistema

Esta seção do documento descreve os requisitos funcionais e não funcionais do Peacemaker Bot, um sistema projetado para monitorar e mitigar a incivilidade em repositórios de código no GitHub.

### Escopo

O sistema faz a análise de comentários no GitHub, identificando comportamentos incivilizados e oferecendo sugestões de correção não instrutivas, com elas sendo mostradas no site do bot. Neste mesmo site, os administradores podem visualizar estatísticas de incivilidade que envolvem um repositório no qual o GithubApp foi instalado.

### Definições, Acrônimos e Abreviações

-   **Contribuidor**: Usuário que comenta em repositórios no GitHub.
-   **Admin de Repositório**: Administrador de um repositório no GitHub com acesso ao dashboard do Peacemaker Bot.
-   **Incivilidade**: Comentários que são considerados inapropriados, ofensivos ou tóxicos.

### Requisitos Funcionais

#### Requisito Funcional 1: Instalação do GithubApp via Marketplace do GitHub

-   **Descrição**: Permitir que os usuários façam a instalação do ThePeacemakerBot(GithubApp) via Marketplace do GitHub.
-   **Critérios de Aceitação**: O GithubApp deve estar disponível no Marketplace do GitHub e sua instalação deve ser possível em qualquer repositório que o usuário tenha permissão de administrador.
-   **Regras de Negócio**: Somente usuários com permissão de administrador em um repositório podem instalar o GithubApp (Este requisito já é de certa forma aplicado pelo próprio GithubApp).

#### Requisito Funcional 2: Login Social com GitHub

-   **Descrição**: Permitir que os usuários façam login no sistema usando sua conta do GitHub.
-   **Critérios de Aceitação**: O sistema deve autenticar os usuários com sucesso utilizando OAuth ou GithubApp Auth com GitHub.
-   **Regras de Negócio**: Somente usuários autenticados podem acessar o dashboard ou receber notificações.

#### Requisito Funcional 3: Análise de Comentários

-   **Descrição**: Analisar automaticamente os comentários feitos em issues e pull requests para identificar incivilidade.
-   **Critérios de Aceitação**: O sistema deve ser capaz de classificar um comentário como incivilizado salvando sua classificação em um banco de dados.
-   **Regras de Negócio**: Apenas comentários que ultrapassem uma classificação mínima de 50% de incivilidade devem gerar notificações para os usuários. Apenas comentários de repositórios com o GithubApp instalado conseguem ser analisados.

#### Requisito Funcional 4: Notificações de Comentários Incivilizados

-   **Descrição**: Notificar os usuários sobre comentários que foram detectados como incivilizados, com a opção de corrigir ou contestar a notificação.
-   **Critérios de Aceitação**: O sistema deve notificar o usuário através de um dos seguintes canais (podendo ser mais de um): e-mail, interface web ou notificação push (PC ou mobile).
-   **Regras de Negócio**: O usuário deve ter a opção de corrigir a Incivilidade ou contestar/desncosiderar a notificação, essa opção deve ser exibida junto da mensagem de notificação.

#### Requisito Funcional 5: Dashboard de Estatísticas de Incivilidade

-   **Descrição**: Fornecer aos administradores um dashboard onde possam visualizar estatísticas de incivilidade nos repositórios que administram.
-   **Critérios de Aceitação**: O dashboard deve exibir tanto gráficos e registros abstraídos quanto detalhados sobre a incidência de incivilidade.
-   **Regras de Negócio**: Apenas repositórios com o GithubApp instalado podem ter dados analisados e exibidos no dashboard e apenas usuários com privilégios de administrador no repositório devem ter acesso ao dashboard.

### Requisitos Não Funcionais

#### Desempenho

-   O sistema deve processar e classificar os comentários em no máximo 1 minuto após serem postados.
-   O dashboard deve carregar em menos de 30 segundos com até 1000 registros de comentários.

#### Segurança

-   O sistema deve garantir que todos os dados de autenticação sejam transmitidos de forma segura usando HTTPS.
-   Os dados sensíveis, como tokens de acesso, devem ser armazenados utilizando criptografia.

#### Usabilidade

-   A interface do usuário deve ser intuitiva, com navegação clara e fácil acesso às funcionalidades principais.

#### Confiabilidade

-   O sistema deve ter uma disponibilidade de 99,9%.
-   Os dados de comentários e análises devem ser persistidos de forma a evitar perda em caso de falha do sistema.

#### Manutenibilidade

-   O sistema deve ser modular, permitindo atualizações e substituições de componentes sem impacto no sistema como um todo.

#### Portabilidade

-   O sistema deve ser executável em diferentes ambientes de nuvem (AWS, Azure, Google Cloud).
-   O sistema deve multiplataforma, utilizando as práticas recomendadas para garantir a compatibilidade com diferentes plataformas (Web e Mobile) e navegadores diferentes.

---

## :desktop_computer: Tecnologias e frameworks utilizados

**Frontend:**

-   React
-   Tailwindcss
-   Next.js

**Backend:**

-   MongoDB e Mongoose
-   Fastify
-   Node.js

**GitHub App:**

-   Probot
-   GitHub API
-   Octokit
-   Node.js

## :shipit: Operações implementadas para cada entidade da aplicação

| Entidade     | Criação | Leitura | Atualização | Remoção |
| ------------ | ------- | ------- | ----------- | ------- |
| Usuário      | X       | X       | X           | X       |
| Comentários  | X       | X       | X           |         |
| Repositórios |         | X       | X           |         |

## :neckbeard: Lógica para cada uma das rotas da API por entidade

| Entidade     | O que ela deve fazer                                      |
| ------------ | --------------------------------------------------------- |
| Usuário      | Buscar todos os usuários no BD                            |
| Usuário      | Buscar usuário em especifico                              |
| Usuário      | Login social com GitHub                                   |
| Usuário      | Callback de login social com GitHub                       |
| Repositórios | Buscar todos os repositórios de um Usuário                |
| Repositórios | Buscar um repositório em específico                       |
| Comentários  | Buscar todos os comentários em um repositório             |
| Comentários  | Buscas todos os comentários relacionados a um Usuário     |
| Comentários  | Buscar todos os comentários relacionados a um Repositório |
| Comentários  | Salvar comentário que o GitHubApp identificou             |
| Comentários  | Editar comentário de um usuário usando seu token          |
| Comentários  | Atualizar estado de um comentário (solved or contested)   |

## Documentação e Anexos

-   [Documento de visão do projeto](https://docs.google.com/document/d/198r8KQUQ68oPoADd7dPa0y0c1vGzDT9p/edit?usp=sharing&ouid=105636334481493340185&rtpof=true&sd=true)
-   [Rotas de API detalhadas](https://docs.google.com/document/d/1D2EbKLtLXlEqnuOkQhv_AIOQJUqwo0KYdYJHh9FEevE/edit?usp=drive_link)

### Referências

-   [GitHub API Documentation](https://docs.github.com/en/rest)
-   [Next.js Documentation](https://nextjs.org/docs)
-   [MongoDB Documentation](https://docs.mongodb.com/)
-   [Fastify Documentation](https://fastify.dev/docs/latest/)
-   [Probot Documentation](https://probot.github.io/docs/)
