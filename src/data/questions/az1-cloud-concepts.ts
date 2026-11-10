import type { SeedQuestion } from "./types";

/**
 * AZ-900 — Área 1: Conceitos de nuvem — 85 questões (AZ1-001..AZ1-085).
 * Grupos: G1 Descrever computação em nuvem (AZ1-001..AZ1-035); G2 Descrever benefícios da nuvem (AZ1-036..AZ1-060); G3 Descrever tipos de serviço de nuvem (AZ1-061..AZ1-085).
 * Autoria, revisão editorial (4 passadas) e Red Team: 2026-11-10. Detalhes em AUDITORIA-QUESTOES.csv.
 * domainCode PROVISÓRIO (1) — pendente de registro da certificação AZ-900 no app pelo integrador.
 */
export const az1Questions: SeedQuestion[] = [
  {
    key: "AZ1-001",
    domainCode: 1,
    stem: `An IT director at a logistics company is preparing the team's first Azure project. During the kickoff meeting, a project manager asks for a plain-language definition of cloud computing.

Which statement should the IT director give?`,
    options: [
      "A model in which you buy physical servers up front and house them in the company's own datacenter",
      "The delivery of computing services over the internet, including virtual machines, storage, databases, and networking",
      "A way of delivering computing services over the company's private internal network, with no external provider involved",
      "An arrangement where a vendor builds and operates a datacenter on the company's premises and bills a fixed annual fee",
    ],
    correctIndex: 1,
    explanationEn: `Cloud computing is the delivery of computing services over the internet. Those services include common IT infrastructure — virtual machines, storage, databases, and networking — and extend to newer offerings such as IoT, machine learning, and AI. Because the services are delivered over the internet, you are not constrained by physical infrastructure the way a traditional datacenter is, so you can expand your IT footprint rapidly.

Buying servers up front and housing them yourself describes traditional on-premises IT; delivering over a private internal network with no provider is not what defines cloud computing; and a vendor-run datacenter on your premises with a fixed annual fee describes a managed datacenter arrangement, not cloud computing.`,
    explanationPt: `A computação em nuvem é a entrega de serviços de computação pela internet. Esses serviços incluem a infraestrutura de TI comum — máquinas virtuais, armazenamento, bancos de dados e rede — e se estendem a ofertas mais recentes, como IoT, machine learning e IA. Como a entrega é pela internet, você não fica restringido pela infraestrutura física como num datacenter tradicional; é possível expandir o footprint de TI rapidamente.

Comprar servidores antecipadamente e mantê-los nas suas instalações descreve a TI on-premises tradicional; entregar por uma rede interna privada sem provedor não é o que define computação em nuvem; e um datacenter operado por um fornecedor nas suas instalações, com fatura anual fixa, descreve um arranjo de datacenter gerenciado — não computação em nuvem.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute/",
    referenceTitle: "What is cloud computing — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-002",
    domainCode: 1,
    stem: `A training nonprofit is onboarding a new cloud analyst. As a first exercise, the analyst lists what counts as a cloud computing service.

Which list is accurate?`,
    options: [
      "Virtual machines, storage, databases, and networking, plus newer offerings such as Internet of Things, machine learning, and AI",
      "Only the physical hardware layer: the compute racks, power, and cooling that providers operate in their regions",
      "Only ready-to-use business applications, such as email and customer relationship management tools",
      "Only hosting plans for public websites, of the kind providers resell to small businesses",
    ],
    correctIndex: 0,
    explanationEn: `Cloud computing services include common IT infrastructure — virtual machines, storage, databases, and networking — and cloud services also expand the traditional IT offerings to include things like Internet of Things (IoT), machine learning (ML), and artificial intelligence (AI).

The hardware-only list confuses cloud computing with the physical layer the provider operates underneath; the business-applications-only list reduces cloud computing to software as a service; and the website-hosting-only list reflects the old idea that the cloud is just hosting. Cloud computing spans infrastructure, platforms, and applications delivered over the internet.`,
    explanationPt: `Os serviços de computação em nuvem incluem a infraestrutura de TI comum — máquinas virtuais, armazenamento, bancos de dados e rede — e os serviços de nuvem também expandem as ofertas tradicionais de TI com coisas como Internet of Things (IoT), machine learning (ML) e inteligência artificial (AI).

A lista só-hardware confunde computação em nuvem com a camada física que o provedor opera por baixo; a lista só-aplicativos de negócio reduz a nuvem a software as a service; e a lista só-hospedagem de sites reflete a velha ideia de que a nuvem é apenas hosting. A computação em nuvem abrange infraestrutura, plataformas e aplicações entregues pela internet.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute/",
    referenceTitle: "What is cloud computing — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-003",
    domainCode: 1,
    stem: `A streaming service is producing an interactive live event that will multiply its normal traffic for a few days; after the event, demand returns to its usual level. The team wants extra capacity for those days without waiting to build new datacenter capacity.

Which statement describes how cloud computing supports this?`,
    options: [
      "The team must buy enough hardware up front to cover the event's peak and keep it available for the rest of the year",
      "The team uses the cloud to rapidly expand its IT footprint for the event and scale back down afterward, without building a new datacenter",
      "The team's IT footprint stays constrained by the physical infrastructure of its own datacenter",
      "The team rents a dedicated datacenter for a full year even though the extra capacity is needed for only a few days",
    ],
    correctIndex: 1,
    explanationEn: `Because cloud computing is delivered over the internet, it is not constrained by physical infrastructure the way a traditional datacenter is. If you need to increase your IT infrastructure rapidly, you do not have to wait to build a new datacenter — you use the cloud to rapidly expand your IT footprint, and you scale back down when demand returns to normal.

Buying hardware up front or renting a datacenter for a year both plan capacity around a short peak; and staying constrained by your own datacenter is exactly the limitation cloud computing removes.`,
    explanationPt: `Como a computação em nuvem é entregue pela internet, ela não fica restringida pela infraestrutura física como um datacenter tradicional. Se você precisa aumentar sua infraestrutura de TI rapidamente, não precisa esperar a construção de um novo datacenter — usa-se a nuvem para expandir rapidamente o footprint de TI e reduzir depois, quando a demanda volta ao normal.

Comprar hardware antecipadamente ou alugar um datacenter por um ano inteiro planejam a capacidade em torno de um pico curto; e permanecer restrito ao próprio datacenter é exatamente a limitação que a computação em nuvem elimina.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute/",
    referenceTitle: "What is cloud computing — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-004",
    domainCode: 1,
    stem: `A flower delivery company sees orders multiply around Valentine's Day and Mother's Day. In past years, preparing for those peaks meant long procurement cycles for servers, and much of that equipment sat idle between peaks.

At a fundamentals level, how does cloud computing change this planning?`,
    options: [
      "Planning still starts with long procurement cycles, but the provider finances the hardware purchases for the company",
      "Planning is handled by the provider, which forecasts the company's demand and provisions capacity on its behalf",
      "Planning becomes a single up-front decision: buy capacity for the highest expected peak and keep it running year-round",
      "Planning shifts from long procurement cycles to on-demand provisioning: capacity is added for the peak and released afterward",
    ],
    correctIndex: 3,
    explanationEn: `At a fundamentals level, cloud computing changes infrastructure planning from long procurement cycles to on-demand provisioning. Teams deploy additional compute capacity for the peak period and scale down afterward, which improves agility and aligns spending with actual demand; capacity adapts as requirements change.

The provider financing the hardware purchases keeps the up-front purchase model, only moved to a lender; demand forecasting remains the consumer's job — the provider supplies resources, it does not plan your workload; and sizing for the highest peak and keeping it running year-round is the traditional over-provisioning pattern.`,
    explanationPt: `No nível fundamentals, a computação em nuvem muda o planejamento de infraestrutura de longos ciclos de aquisição para o provisionamento sob demanda. Os times implantam capacidade de computação adicional para o período de pico e reduzem depois, o que melhora a agilidade e alinha o gasto à demanda real; a capacidade se adapta conforme os requisitos mudam.

O provedor financiando a compra de hardware mantém o modelo de compra antecipada, só transferido para um financiador; prever a demanda segue sendo tarefa do consumidor — o provedor fornece recursos, não planeja seu workload; e dimensionar para o maior pico e manter rodando o ano inteiro é o padrão tradicional de superprovisionamento.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/3-what-cloud-compute/",
    referenceTitle: "What is cloud computing — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-005",
    domainCode: 1,
    stem: `A hospital network is moving its workloads to the cloud. A compliance officer asks which responsibilities always remain with the cloud provider, regardless of the service type the hospital uses.

Which statement is accurate?`,
    options: [
      "The information and data stored in the cloud, and the accounts that use the services",
      "The physical datacenter, the physical network, the physical hosts, and the underlying infrastructure",
      "The operating systems and the network controls, whichever service type is used",
      "The applications and the devices allowed to connect to the cloud",
    ],
    correctIndex: 1,
    explanationEn: `Under the shared responsibility model, the cloud provider is always responsible for the physical datacenter, the physical network, the physical hosts, and the underlying infrastructure.

The information and data stored in the cloud, the accounts and identities in the environment, and the devices allowed to connect always remain with the consumer. Operating systems, network controls, and applications sit in the depends-on-the-service-type band: they stay with the consumer in IaaS and shift toward the provider as you move through PaaS to SaaS.`,
    explanationPt: `No modelo de responsabilidade compartilhada, o provedor de nuvem é sempre responsável pelo datacenter físico, pela rede física, pelos hosts físicos e pela infraestrutura subjacente.

As informações e os dados armazenados na nuvem, as contas e identidades do ambiente e os dispositivos autorizados a se conectar permanecem sempre com o consumidor. Sistemas operacionais, controles de rede e aplicações ficam na faixa "depende do tipo de serviço": permanecem com o consumidor no IaaS e migram para o provedor à medida que se avança do PaaS ao SaaS.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model/",
    referenceTitle: "Describe the shared responsibility model — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-006",
    domainCode: 1,
    stem: `A retailer has adopted a public cloud. A newly hired security engineer is reviewing what the company must keep doing itself, no matter which cloud service type it adopts.

Which responsibilities always stay with the retailer?`,
    options: [
      "The physical hosts, the physical network, and the underlying infrastructure that run its workloads in the provider's datacenter",
      "The operating systems, the network controls, and the applications, whichever service type the retailer adopts",
      "The power, the cooling, and the physical security of the datacenter where its workloads run",
      "The data in the cloud, the devices allowed to connect, and the accounts and identities in the environment",
    ],
    correctIndex: 3,
    explanationEn: `When using a cloud provider, you are always responsible for the information and data stored in the cloud, the devices allowed to connect to your cloud, and the accounts and identities of the people, services, and devices in your environment.

The physical hosts, the physical network, power, cooling, and physical security always belong to the provider — the consumer is not collocated with the datacenter. Operating systems and network controls fall in the depends-on-the-service-type band, so they cannot be listed as always yours.`,
    explanationPt: `Ao usar um provedor de nuvem, você é sempre responsável pelas informações e dados armazenados na nuvem, pelos dispositivos autorizados a se conectar à sua nuvem e pelas contas e identidades das pessoas, serviços e dispositivos do seu ambiente.

Hosts físicos, rede física, energia, refrigeração e segurança física pertencem sempre ao provedor — o consumidor não está colocalizado com o datacenter. Sistemas operacionais e controles de rede ficam na faixa "depende do tipo de serviço"; portanto, não podem ser listados como sempre seus.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model/",
    referenceTitle: "Describe the shared responsibility model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-007",
    domainCode: 1,
    stem: `An external auditor is comparing the company's former on-premises datacenter with its current public cloud setup, and asks how responsibilities shifted when the workloads moved.

Which statement is accurate?`,
    options: [
      "On-premises, the company handled everything; in the cloud, physical security, power, cooling, and connectivity moved to the provider",
      "On-premises, the provider handled physical security; in the cloud, the company became responsible for everything",
      "Moving to the cloud transferred responsibility for the stored data and for access security over to the provider",
      "Moving to the cloud made the provider responsible for patching the company's applications in every service type",
    ],
    correctIndex: 0,
    explanationEn: `With an on-premises datacenter, your team is responsible for everything: maintaining the physical space, ensuring security, and maintaining or replacing servers. With the shared responsibility model, physical security, power, cooling, and network connectivity move to the cloud provider, because the consumer is not collocated with the datacenter.

What does not move is the consumer's own layer: the data and information stored in the cloud and access security — granting access only to those who need it — stay with the company. Application patching depends on the service type, so it is not the provider's in every case.`,
    explanationPt: `Num datacenter on-premises, seu time é responsável por tudo: manter o espaço físico, garantir a segurança e manter ou substituir servidores. No modelo de responsabilidade compartilhada, segurança física, energia, refrigeração e conectividade de rede passam para o provedor de nuvem, já que o consumidor não está colocalizado com o datacenter.

O que não se transfere é a camada do próprio consumidor: os dados e as informações armazenados na nuvem e a segurança de acesso — conceder acesso apenas a quem precisa — permanecem com a empresa. O patching de aplicações depende do tipo de serviço; logo, não é do provedor em todos os casos.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model/",
    referenceTitle: "Describe the shared responsibility model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-008",
    domainCode: 1,
    stem: `A manufacturing company's cloud architect is briefing the infrastructure team on how the shared responsibility model behaves across service types, ahead of the team's first migration wave.

Which statement is accurate?`,
    options: [
      "SaaS places the most responsibility on the consumer, while IaaS shifts nearly everything to the cloud provider",
      "All three service types split responsibilities identically between the provider and the consumer, whatever the workload demands",
      "IaaS places the most responsibility on the consumer, SaaS on the provider, and PaaS splits responsibility between the two",
      "The service type has no bearing on who maintains the operating systems and the applications running in the cloud",
    ],
    correctIndex: 2,
    explanationEn: `The shared responsibility model is heavily tied into the cloud service types. IaaS places the most responsibility on the consumer, with the cloud provider responsible for the basics of physical security, power, and connectivity. SaaS, at the other end of the spectrum, places most of the responsibility with the cloud provider. PaaS, being a middle ground, rests somewhere in the middle and distributes responsibility between provider and consumer.

That is why operating systems, network controls, and applications form the depends-on-the-service-type band: identical splitting and service-type independence both contradict how responsibility actually scales across IaaS, PaaS, and SaaS.`,
    explanationPt: `O modelo de responsabilidade compartilhada está fortemente ligado aos tipos de serviço de nuvem. O IaaS coloca a maior parte da responsabilidade no consumidor, ficando o provedor responsável pelo básico: segurança física, energia e conectividade. O SaaS, no outro extremo do espectro, coloca a maior parte da responsabilidade no provedor. O PaaS, sendo um meio-termo, fica no meio e distribui a responsabilidade entre provedor e consumidor.

É por isso que sistemas operacionais, controles de rede e aplicações formam a faixa "depende do tipo de serviço": tanto um rateio idêntico quanto a independência do tipo de serviço contradizem a forma como a responsabilidade de fato se distribui entre IaaS, PaaS e SaaS.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model/",
    referenceTitle: "Describe the shared responsibility model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-009",
    domainCode: 1,
    stem: `A fintech runs two database workloads in the cloud. One is a SQL database that the team installed on its own virtual machines and patches itself. The other is a managed cloud SQL database service. Under the shared responsibility model, who maintains each database engine?`,
    options: [
      "The provider maintains both engines, because all database software running in the cloud is managed by the provider",
      "The fintech maintains the engine on its virtual machines; the provider maintains the managed cloud SQL database",
      "The fintech maintains both engines, because anything database-related always stays with the consumer",
      "The provider maintains both engines, though the fintech stays responsible for the data in each case",
    ],
    correctIndex: 1,
    explanationEn: `For the managed cloud SQL database, the cloud provider is responsible for maintaining the actual database. For the SQL database the fintech deployed on its own virtual machines, the team is responsible for database patches and updates. In both cases, the data that gets ingested stays with the consumer.

Engine maintenance follows the service model, not the datacenter location: a database engine on a self-managed VM is your layer, while a managed database service is the provider's. Two of the statements erase that depends-on-the-service-type distinction from opposite sides, and the remaining one keeps data responsibility correctly but wrongly extends engine maintenance to the self-managed case.`,
    explanationPt: `No banco SQL gerenciado na nuvem, o provedor é responsável por manter o banco de dados de fato. No SQL que o fintech implantou nas próprias máquinas virtuais, o time é responsável por patches e atualizações do banco. Em ambos os casos, os dados ingeridos permanecem com o consumidor.

A manutenção do engine segue o modelo de serviço, não a localização do datacenter: um engine em VM auto-gerenciada é sua camada; um serviço de banco gerenciado é do provedor. Duas das afirmações apagam essa distinção "depende do tipo de serviço" por lados opostos, e a restante mantém corretamente a responsabilidade pelos dados, mas estende de forma errada a manutenção do engine ao caso auto-gerenciado.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/4-describe-shared-responsibility-model/",
    referenceTitle: "Describe the shared responsibility model — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-010",
    domainCode: 1,
    stem: `A university is evaluating its first cloud deployment, and a lecturer on the evaluation committee asks what a public cloud is.

Which statement is accurate?`,
    options: [
      "A cloud used by a single entity, with resources dedicated to one organization and no other tenants sharing them",
      "A cloud that combines the university's on-premises datacenter with a provider's cloud in an interconnected environment",
      "A cloud operated jointly by two providers, in which workloads can move freely between the providers' platforms",
      "A cloud built, controlled, and maintained by a third-party provider, where anyone can purchase cloud services and use them",
    ],
    correctIndex: 3,
    explanationEn: `A public cloud is built, controlled, and maintained by a third-party cloud provider. With a public cloud, anyone who wants to purchase cloud services can access and use resources — that general public availability is a key difference between public and private clouds.

Resources dedicated to a single entity describe a private cloud; an interconnected on-premises and provider environment is a hybrid cloud; and two providers operating one environment is a multicloud scenario, not a definition of public cloud.`,
    explanationPt: `A nuvem pública é construída, controlada e mantida por um provedor terceirizado. Com a nuvem pública, qualquer pessoa que queira comprar serviços de nuvem pode acessar e usar os recursos — essa disponibilidade ao público em geral é a principal diferença entre nuvens pública e privada.

Recursos dedicados a uma única entidade descrevem a nuvem privada; um ambiente interconectado entre on-premises e provedor é a nuvem híbrida; e dois provedores operando um ambiente é um cenário de multicloud, não a definição de nuvem pública.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-011",
    domainCode: 1,
    stem: `A pharmaceutical company wants cloud technology, but its resources must be dedicated to the organization alone. A team member asks what a private cloud is.

Which statement is accurate?`,
    options: [
      "A cloud environment used by a single entity, hosted on-site or in a dedicated offsite datacenter, even a third-party one",
      "A cloud where anyone can purchase access and where resources are shared with other tenants in the provider's own datacenter",
      "A temporary public deployment used to handle surges in demand on top of the organization's own datacenter",
      "A cloud model in which two public providers jointly run the environment as if it were a single cloud",
    ],
    correctIndex: 0,
    explanationEn: `A private cloud is a cloud environment used by a single entity. It evolved naturally from the traditional datacenter model, delivering IT services while keeping resources dedicated to one organization. It may be hosted from your on-site datacenter, or in a dedicated datacenter offsite, potentially even operated by a third party.

Shared multi-tenant access describes a public cloud; a temporary public deployment for surges describes the burst idea behind hybrid clouds; and two public providers running one environment is a multicloud scenario. A private cloud provides greater control for the IT team, at greater cost and with fewer of the benefits of a public cloud deployment.`,
    explanationPt: `A nuvem privada é um ambiente de nuvem usado por uma única entidade. Ela evoluiu naturalmente do modelo tradicional de datacenter, entregando serviços de TI com recursos dedicados a uma organização. Pode ser hospedada no datacenter próprio ou num datacenter dedicado externo, potencialmente até operado por um terceiro.

Acesso multitenant compartilhado descreve a nuvem pública; uma implantação pública temporária para picos descreve a ideia de burst por trás da nuvem híbrida; e dois provedores públicos rodando um ambiente é um cenário de multicloud. A nuvem privada dá maior controle ao time de TI, com maior custo e menos benefícios que uma implantação em nuvem pública.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-012",
    domainCode: 1,
    stem: `An insurance company keeps a private cloud in its own datacenter and connects it to a public cloud so it can absorb temporary demand spikes without changing its steady-state setup.

Which statement about this environment is accurate?`,
    options: [
      "It is two public clouds, from different providers, operated as one interconnected environment, with the private datacenter retired",
      "It is a public cloud in which the provider dedicates hardware to a single tenant inside its own datacenter",
      "It is a private cloud whose spare resources are shared with other tenants during peak periods to absorb the demand spikes",
      "It is a hybrid cloud: interconnected public and private clouds, where the private side surges for temporary demand using public resources",
    ],
    correctIndex: 3,
    explanationEn: `A hybrid cloud is a computing environment that uses both public and private clouds in an interconnected environment. A common use is letting the private cloud surge for increased, temporary demand by deploying public cloud resources; hybrid can also provide an extra layer of security, since you flexibly choose which services to keep in the public cloud and which to deploy to your private infrastructure.

Two public providers together is multicloud; dedicated single-tenant hardware inside a provider's cloud reflects the private-cloud idea; and sharing private resources with other tenants during peaks contradicts the definition of private.`,
    explanationPt: `A nuvem híbrida é um ambiente de computação que usa nuvens pública e privada de forma interconectada. Um uso comum é permitir que a nuvem privada atenda a demandas temporárias elevadas mediante implantação de recursos da nuvem pública; a híbrida também pode trazer uma camada extra de segurança, já que você escolhe com flexibilidade quais serviços manter na nuvem pública e quais implantar na infraestrutura privada.

Dois provedores públicos juntos é multicloud; hardware dedicado a um único tenant dentro da nuvem do provedor reflete a ideia da nuvem privada; e compartilhar recursos privados com outros tenants durante picos contraria a definição de privada.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-013",
    domainCode: 1,
    stem: `A gaming studio uses one public provider for its development platform and is moving part of its workloads to a second public provider to use features the first one lacks, while the migration is still in progress.

Which statement describes this environment accurately?`,
    options: [
      "It is a hybrid cloud scenario, because the studio is combining two different cloud models into one",
      "It is a multicloud scenario: the studio uses two public cloud providers and manages resources and security in both environments",
      "It is a private cloud scenario, because each provider dedicates its environment to the studio alone",
      "It is still a single public cloud scenario, because using several public providers at once does not change the model",
    ],
    correctIndex: 1,
    explanationEn: `In a multicloud scenario, you use multiple public cloud providers — maybe you use different features from different providers, or maybe you started your cloud journey with one provider and are migrating to another. In a multicloud environment you deal with two (or more) public cloud providers and manage resources and security in both environments.

A hybrid cloud combines a public and a private cloud in an interconnected environment, which is not what two public providers create; dedicated single-tenant environments describe private clouds; and several public providers do not collapse into one cloud — the management burden across both environments is exactly what makes multicloud distinctive.`,
    explanationPt: `Num cenário de multicloud, você usa múltiplos provedores públicos — talvez porque usa recursos diferentes de provedores diferentes, ou talvez porque começou sua jornada na nuvem com um provedor e está migrando para outro. Nesse ambiente, você lida com dois (ou mais) provedores públicos e gerencia recursos e segurança em ambos.

A nuvem híbrida combina nuvem pública e privada num ambiente interconectado, o que não é o que dois provedores públicos criam; ambientes dedicados a um único tenant descrevem a nuvem privada; e vários provedores públicos não se fundem em uma única nuvem — a carga de gerenciar ambos os ambientes é justamente o que caracteriza o multicloud.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-014",
    domainCode: 1,
    stem: `A solutions architect is preparing a briefing that compares cloud models for a client's board. One slide pairs characteristics with the models, and the architect checks it before the meeting.

Which pairing is accurate?`,
    options: [
      "Private cloud: no capital expenditures to scale up, because the provider pays for the hardware",
      "Hybrid cloud: you have complete control over resources and security at all times",
      "Public cloud: no capital expenditures to scale up — you pay only for what you use",
      "Public cloud: your data isn't collocated with other tenants' data",
    ],
    correctIndex: 2,
    explanationEn: `In the comparison of cloud models, the public cloud is characterized by no capital expenditures to scale up, applications that can be quickly provisioned and deprovisioned, and paying only for what you use.

"Your data isn't collocated with other tenants' data" is the private cloud's characteristic; "hardware must be purchased for startup and maintenance" also belongs to the private cloud, so the first pairing inverts it; and "you have complete control over resources and security" is a private-cloud trait — for the hybrid cloud, the comparison notes you don't have complete control, but you do determine where to run your applications and you control security, compliance, or legal requirements.`,
    explanationPt: `Na comparação entre modelos de nuvem, a nuvem pública se caracteriza por não exigir despesas de capital para escalar, por aplicações que podem ser provisionadas e desprovisionadas rapidamente e por pagar apenas pelo que se usa.

"Seus dados não são colocalizados com os de outros tenants" é característica da nuvem privada; "o hardware precisa ser comprado para início e manutenção" também é da nuvem privada — logo o primeiro pareamento a inverte; e "controle completo sobre recursos e segurança" é um traço da nuvem privada — para a híbrida, a comparação registra que você não tem controle completo, mas determina onde rodar as aplicações e controla segurança, conformidade e requisitos legais.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-015",
    domainCode: 1,
    stem: `During a proposal review, a client asks the architect to confirm which statement about cloud models is accurate before it goes into the final deck.

Which statement is it?`,
    options: [
      "In a private cloud, hardware must be purchased for startup and maintenance, and the organization maintains and updates it",
      "In a public cloud, the consumer purchases and maintains the hardware that runs the services in the provider's datacenter",
      "In a hybrid cloud, the provider decides where each application runs, based on cost optimization",
      "In a multicloud environment, the security policies of one provider automatically govern the other provider's resources",
    ],
    correctIndex: 0,
    explanationEn: `In the cloud models comparison, a private cloud requires hardware to be purchased for startup and maintenance, and the organization is responsible for hardware maintenance and updates — the price of keeping resources dedicated to one entity.

In a public cloud, the provider builds and maintains the hardware; the consumer never purchases it. In a hybrid cloud, you determine where your applications run, choosing per workload between public and private. And in a multicloud environment, you manage resources and security in both providers — one provider's policies do not automatically govern the other's.`,
    explanationPt: `Na comparação de modelos de nuvem, a nuvem privada exige que o hardware seja comprado para início e manutenção, e a organização é responsável pela manutenção e atualização desse hardware — o preço de manter recursos dedicados a uma única entidade.

Na nuvem pública, o provedor constrói e mantém o hardware; o consumidor jamais o compra. Na nuvem híbrida, você determina onde suas aplicações rodam, escolhendo por workload entre público e privado. E num ambiente multicloud, você gerencia recursos e segurança nos dois provedores — as políticas de um provedor não governam automaticamente as do outro.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-016",
    domainCode: 1,
    stem: `A defense contractor must run all of its workloads on dedicated infrastructure that the organization controls. Its data cannot be collocated with other tenants' data, and it will not use any public cloud resources for these workloads.

Which cloud model fits these requirements?`,
    options: [
      "Public cloud, because dedicated hardware can be reserved in public regions for use by a single tenant",
      "Hybrid cloud, because the sensitive workloads stay on the private side of the environment",
      "Private cloud, because resources are dedicated to one entity and data isn't collocated with other tenants' data",
      "Multicloud, because spreading the workloads across two public providers isolates them from other tenants",
    ],
    correctIndex: 2,
    explanationEn: `A private cloud keeps resources dedicated to one organization, which is exactly what "data not collocated with other tenants' data" and complete control over resources and security require.

Reserving capacity in public regions does not turn a public cloud into single-tenant infrastructure — reservations are a billing construct, not dedicated hardware. Hybrid is excluded because the contractor will not use any public cloud resources; and multicloud means several public providers, which is the opposite of isolation from other tenants. The trade-off the contractor accepts: greater control, at greater cost and with fewer public-cloud benefits.`,
    explanationPt: `A nuvem privada mantém recursos dedicados a uma única organização — exatamente o que exigem "dados não colocalizados com outros tenants" e controle total sobre recursos e segurança.

Reservar capacidade em regiões públicas não transforma a nuvem pública em infraestrutura single-tenant: reservas são um mecanismo de cobrança, não hardware dedicado. A híbrida fica excluída porque o contratante não usará nenhum recurso de nuvem pública; e multicloud significa vários provedores públicos — o oposto de isolamento de outros tenants. O trade-off assumido: maior controle, com maior custo e menos benefícios da nuvem pública.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-017",
    domainCode: 1,
    stem: `Two founders are building a mobile app with no capital to buy servers. Usage is expected to grow unpredictably if the app takes off. They want to pay only for what they use, provision and deprovision applications quickly, and avoid managing resources in multiple environments.

Which cloud model fits best?`,
    options: [
      "Public cloud: no capital expenditures to scale up, quick provisioning, and you pay only for what you use",
      "Private cloud: hardware purchased up front for startup and maintenance, in exchange for complete control over resources and security",
      "Hybrid cloud: start in a connected on-premises datacenter and add public capacity later when demand grows",
      "Multicloud: split the app across two public providers from day one, to spread the load",
    ],
    correctIndex: 0,
    explanationEn: `The public cloud's comparative characteristics answer each requirement: no capital expenditures to scale up, applications quickly provisioned and deprovisioned, and paying only for what you use.

A private cloud requires hardware purchases for startup and maintenance — the opposite of no capital. A hybrid setup assumes an existing private environment to connect, which the founders do not have. And splitting across two providers from day one adds the burden of managing resources and security in multiple environments, which they explicitly want to avoid.`,
    explanationPt: `As características comparativas da nuvem pública respondem a cada requisito: sem despesas de capital para escalar, aplicações provisionadas e desprovisionadas rapidamente e pagamento apenas pelo que se usa.

A nuvem privada exige compra de hardware para início e manutenção — o oposto de "sem capital". A híbrida pressupõe um ambiente privado existente para conectar, o que os fundadores não têm. E dividir entre dois provedores desde o primeiro dia acrescenta a carga de gerenciar recursos e segurança em múltiplos ambientes — exatamente o que eles querem evitar.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-018",
    domainCode: 1,
    stem: `A tax-preparation firm runs a private cloud that carries a steady load for most of the year. During filing season, demand rises sharply for a few weeks. The firm wants to keep its steady-state workloads where they are and temporarily deploy extra capacity from a public cloud, connected to its own environment.

Which approach does this describe?`,
    options: [
      "Public cloud: migrating the whole private environment to the provider for the season and keeping it there",
      "Private cloud: buying additional hardware for the peak and keeping it available for the rest of the year",
      "Multicloud: renting extra capacity from a second public provider during the season, alongside the first",
      "Hybrid cloud: letting the private cloud surge for increased, temporary demand by deploying public cloud resources",
    ],
    correctIndex: 3,
    explanationEn: `This is the canonical hybrid-cloud use case: a computing environment that uses both public and private clouds in an interconnected way, letting the private cloud surge for increased, temporary demand by deploying public cloud resources.

Migrating the whole environment to a provider abandons the private setup the firm wants to keep; buying hardware for the peak is private-cloud over-provisioning that sits idle the rest of the year; and renting from a second public provider is multicloud — public-to-public — not public connected to private.`,
    explanationPt: `Este é o caso de uso canônico da nuvem híbrida: um ambiente de computação que usa nuvens pública e privada de forma interconectada, permitindo que a nuvem privada atenda a demandas temporárias elevadas mediante implantação de recursos da nuvem pública.

Migrar todo o ambiente para o provedor abre mão da estrutura privada que a firma quer manter; comprar hardware para o pico é superprovisionamento de nuvem privada que fica ocioso o resto do ano; e alugar de um segundo provedor público é multicloud — público com público — e não público conectado a privado.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-019",
    domainCode: 1,
    stem: `An energy utility uses one public provider for its customer portal and a second public provider for analytics, because each offers features the other lacks; the migration between them is still in progress.

Beyond naming the model, what does operating this environment require?`,
    options: [
      "Extending one provider's security policies automatically across the other provider's resources",
      "Managing resources and security in both public cloud environments",
      "Consolidating both providers into a single public cloud before management becomes possible",
      "Managing only the environment that hosts the newest workloads",
    ],
    correctIndex: 1,
    explanationEn: `This is a multicloud scenario, and in a multicloud environment you deal with two (or more) public cloud providers and manage resources and security in both environments — that management burden is the defining operational consequence of the model.

Neither provider's policies extend automatically into the other; consolidation is not a prerequisite, since the scenario exists precisely while both providers are in use; and managing only the newest workloads leaves the other environment ungoverned. Azure Arc is Microsoft's set of technologies for managing such public, private, hybrid, and multicloud environments consistently.`,
    explanationPt: `Este é um cenário de multicloud e, num ambiente multicloud, você lida com dois (ou mais) provedores públicos e gerencia recursos e segurança em ambos os ambientes — essa carga de gerenciamento é a consequência operacional que define o modelo.

As políticas de um provedor não se estendem automaticamente ao outro; a consolidação não é pré-requisito, já que o cenário existe justamente enquanto ambos os provedores estão em uso; e gerenciar apenas os workloads mais novos deixa o outro ambiente sem governança. O Azure Arc é o conjunto de tecnologias da Microsoft para gerenciar ambientes públicos, privados, híbridos e multicloud de forma consistente.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-020",
    domainCode: 1,
    stem: `A national research lab must keep its most sensitive workloads on infrastructure it controls, but it also wants public cloud capacity for temporary surges and for collaboration tools. It needs to decide, per workload, where each application runs, and it must retain control over security, compliance, and legal requirements.

Which cloud model supports all of these requirements?`,
    options: [
      "Public cloud, with the provider deciding where each workload runs in order to optimize costs",
      "Private cloud, which offers complete control but no way to add public capacity for temporary surges",
      "Hybrid cloud, which provides the most flexibility: you determine where applications run and control security and compliance",
      "Multicloud, which keeps the sensitive workloads isolated by running them across two public providers",
    ],
    correctIndex: 2,
    explanationEn: `The hybrid cloud provides the most flexibility of the three main models: you determine where your applications run, you control security, compliance, or legal requirements, and the private side can surge for increased, temporary demand by deploying public cloud resources.

The public cloud leaves resource and security control within the provider's shared environment and does not give you per-workload placement in this sense; a private-only answer forfeits the public capacity for surges that the lab explicitly wants; and multicloud means two public providers — it does not isolate workloads from other tenants, and it does not add a private environment.`,
    explanationPt: `A nuvem híbrida oferece a maior flexibilidade entre os três modelos principais: você determina onde suas aplicações rodam, controla segurança, conformidade e requisitos legais, e o lado privado pode atender a demandas temporárias elevadas mediante implantação de recursos da nuvem pública.

A nuvem pública deixa o controle de recursos e segurança dentro do ambiente compartilhado do provedor e não dá alocação por workload nesse sentido; a resposta só-privada abre mão da capacidade pública para picos que o laboratório explicitamente quer; e multicloud significa dois provedores públicos — não isola workloads de outros tenants nem acrescenta um ambiente privado.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/5-define-cloud-models/",
    referenceTitle: "Define cloud models — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-021",
    domainCode: 1,
    stem: `The CFO of a mid-sized company asks the cloud team to explain the consumption-based model in one sentence, so that she can repeat it to the board without notes.

Which statement is accurate?`,
    options: [
      "You pay for the IT resources you use and nothing more, renting compute and storage and releasing them when done",
      "You pay a fixed annual fee that covers unlimited use of all the resources you request",
      "You buy the hardware up front and then pay only for the electricity it consumes in the company's own datacenter",
      "You pay in advance for the capacity you expect to consume over the coming three years",
    ],
    correctIndex: 0,
    explanationEn: `In the consumption-based model, you pay for the IT resources you use, and nothing more. Instead of buying and maintaining your own datacenter infrastructure, you rent compute power and storage and release those resources when you're done.

A fixed annual fee for unlimited use, hardware purchased up front with electricity on top, and paying in advance for expected capacity all describe other arrangements — flat-fee billing, traditional ownership, and pre-purchased capacity — none of which is paying for what you actually consume.`,
    explanationPt: `No modelo baseado em consumo, você paga pelos recursos de TI que usa, e nada mais. Em vez de comprar e manter sua própria infraestrutura de datacenter, você aluga poder de computação e armazenamento e libera esses recursos quando termina.

Uma taxa anual fixa por uso ilimitado, hardware comprado antecipadamente com eletricidade por cima e pagamento adiantado pela capacidade esperada descrevem outros arranjos — cobrança flat, propriedade tradicional e capacidade pré-comprada — nenhum deles é pagar pelo que você de fato consome.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-022",
    domainCode: 1,
    stem: `An accountant is classifying the company's IT spending after its move to the cloud, using the CapEx/OpEx distinction from cloud budgeting.

How is spending on cloud services classified, and why?`,
    options: [
      "As capital expenditure, because cloud capacity is purchased up front like datacenter hardware",
      "As capital expenditure, because the provider buys the hardware and passes the cost on in monthly bills",
      "As operational expenditure, because you pay for cloud services as you consume them over time",
      "As operational expenditure, because you buy the servers and pay for them in monthly installments",
    ],
    correctIndex: 2,
    explanationEn: `CapEx refers to up-front spending on physical infrastructure like servers, network hardware, and datacenter space. OpEx refers to ongoing spending on services over time. Because you pay for cloud services as you consume them, cloud computing is classified as an operational expense.

The provider's own hardware purchases are the provider's capital costs, not yours; and buying servers in monthly installments is still acquiring an asset — financing a purchase does not turn it into a service bill.`,
    explanationPt: `CapEx refere-se ao gasto antecipado em infraestrutura física, como servidores, hardware de rede e espaço de datacenter. OpEx refere-se ao gasto contínuo com serviços ao longo do tempo. Como você paga pelos serviços de nuvem à medida que os consome, a computação em nuvem é classificada como despesa operacional.

As compras de hardware do próprio provedor são custos de capital dele, não seus; e comprar servidores em parcelas mensais continua sendo aquisição de um ativo — financiar uma compra não a transforma em fatura de serviço.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-023",
    domainCode: 1,
    stem: `The head of IT planning at a manufacturer is explaining to the board why traditional datacenter capacity planning is hard.

Which pair of outcomes describes the risks of estimating resource needs in advance in a traditional datacenter?`,
    options: [
      "Overestimate and applications suffer degraded performance; underestimate and you overspend on idle infrastructure",
      "Overestimate and you overspend on idle infrastructure; underestimate and the provider ships additional hardware overnight",
      "Overestimate and you overspend on infrastructure that sits idle; underestimate and your applications suffer degraded performance",
      "Overestimate and you still pay only for what you use; underestimate and performance is unaffected",
    ],
    correctIndex: 2,
    explanationEn: `With a traditional datacenter, you estimate future resource needs in advance. Overestimate, and you overspend on infrastructure that sits idle. Underestimate, and your applications suffer degraded performance — and fixing the problem means ordering, installing, and provisioning additional hardware, power, and cooling, which is nothing like an overnight shipment.

In a cloud-based model you adjust resources to match actual demand, so "you still pay only for what you use" belongs to the consumption-based column of this comparison, not to traditional capacity planning.`,
    explanationPt: `Num datacenter tradicional, você estima as necessidades futuras de recursos com antecedência. Superestimar: gasta-se demais com infraestrutura que fica ociosa. Subestimar: as aplicações sofrem degradação de desempenho — e corrigir o problema significa encomendar, instalar e provisionar hardware, energia e refrigeração adicionais, o que não se parece em nada com uma entrega noturna.

No modelo de nuvem, você ajusta os recursos à demanda real; logo, "pagar apenas pelo que usa" pertence à coluna do consumo nesta comparação, não ao planejamento tradicional de capacidade.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-024",
    domainCode: 1,
    stem: `A nonprofit runs donation drives whose traffic is hard to predict, and its budget is tight. The cloud team lists the benefits of the consumption-based model for the board.

Which list is accurate?`,
    options: [
      "Up-front hardware purchases and fixed capacity, with spending that stays stable regardless of how demand moves",
      "The provider absorbs the full cost of any cloud capacity that you reserve in advance but then leave sitting idle",
      "The ability to add resources when demand increases, though releasing them later takes weeks of manual processing",
      "No upfront costs, no capacity purchased ahead of need, and the ability to add and release resources as demand changes",
    ],
    correctIndex: 3,
    explanationEn: `The consumption-based model offers key benefits: no upfront costs for hardware or datacenter infrastructure; no need to purchase and manage capacity that may go underutilized; the ability to add resources when demand increases; and the ability to release resources when demand decreases.

Idle reserved capacity is the customer's cost — that is precisely why the model discourages buying capacity ahead of need; and releasing resources is as immediate as adding them, not a weeks-long process. Up-front purchases with fixed capacity describe the traditional model the nonprofit is moving away from.`,
    explanationPt: `O modelo baseado em consumo oferece benefícios-chave: sem custos antecipados de hardware ou infraestrutura de datacenter; sem necessidade de comprar e gerenciar capacidade que pode ficar subutilizada; a possibilidade de adicionar recursos quando a demanda aumenta; e de liberar recursos quando ela diminui.

A capacidade reservada e ociosa é um custo do cliente — é justamente por isso que o modelo desestimula comprar capacidade além da necessidade; e liberar recursos é tão imediato quanto adicioná-los, não um processo manual de semanas. Compras antecipadas com capacidade fixa descrevem o modelo tradicional de que a ONG está se afastando.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-025",
    domainCode: 1,
    stem: `A company is closing its aging datacenter and moving entirely to the cloud. Its finance lead must classify each cost as CapEx or OpEx, using the definitions from cloud budgeting.

Which classification is accurate?`,
    options: [
      "Buying servers, network hardware, and datacenter space is CapEx; the monthly bills for cloud services consumed are OpEx",
      "Buying servers, network hardware, and datacenter space is OpEx; renting cloud capacity is CapEx",
      "Both the hardware purchases and the cloud bills are CapEx, since both are IT costs",
      "Both the hardware purchases and the cloud bills are OpEx, since both are paid over time",
    ],
    correctIndex: 0,
    explanationEn: `CapEx refers to up-front spending on physical infrastructure like servers, network hardware, and datacenter space — exactly what the old datacenter required. OpEx refers to ongoing spending on services over time — exactly what consumption-based cloud bills are.

The classification follows the nature of the spending, not the department that pays it: "both are IT costs" erases the distinction the finance lead is applying, and "both are paid over time" misreads the hardware purchase, which happens up front even when the closing costs settle later.`,
    explanationPt: `CapEx refere-se ao gasto antecipado em infraestrutura física, como servidores, hardware de rede e espaço de datacenter — exatamente o que o antigo datacenter exigia. OpEx refere-se ao gasto contínuo com serviços ao longo do tempo — exatamente o que são as faturas de nuvem no modelo de consumo.

A classificação segue a natureza do gasto, não o departamento que paga: "ambos são custos de TI" apaga a distinção que o responsável financeiro está aplicando, e "ambos são pagos ao longo do tempo" lê mal a compra de hardware, que ocorre antecipadamente ainda que os custos do encerramento sejam liquidados depois.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-026",
    domainCode: 1,
    stem: `A small design agency wants cloud services with no upfront commitment. Its workload is unpredictable, so the team wants to pay only for what it uses, to be able to cancel anytime, and to keep the services running for exactly as long as the team itself chooses.

Which pricing approach matches these requirements?`,
    options: [
      "Reserved instances: a one- or three-year commitment in exchange for a discount",
      "Spot capacity: unused capacity at a discount, which Azure reclaims whenever it needs the capacity back",
      "Pay-as-you-go: you pay only for the services you consume, with no upfront commitment",
      "A fixed monthly fee that covers unlimited use of the services",
    ],
    correctIndex: 2,
    explanationEn: `Pay-as-you-go means you pay only for the services you consume, with no upfront commitment — you can cancel anytime, and the services keep running for exactly as long as you choose to keep them.

Spot capacity fails the requirement that the team decides when the services stop: Azure reclaims the capacity whenever it needs it back, so the provider's needs can end them against the team's plans. Reserved instances suit steady, predictable workloads whose owner can commit for one or three years — the opposite of no upfront commitment. And a fixed monthly fee for unlimited use decouples billing from actual consumption, so it cannot match paying only for what is used.`,
    explanationPt: `Pay-as-you-go significa pagar apenas pelos serviços que você consome, sem compromisso antecipado — dá para cancelar a qualquer momento, e os serviços ficam no ar exatamente pelo tempo que você decidir mantê-los.

A capacidade spot não atende ao requisito de que a própria equipe decida quando os serviços param: o Azure retoma a capacidade sempre que precisa dela de volta, de modo que a necessidade do provedor pode encerrá-los contra os planos da equipe. Instâncias reservadas servem a workloads estáveis e previsíveis, cujo dono consegue se comprometer por um ou três anos — o oposto de "sem compromisso antecipado". E uma mensalidade fixa por uso ilimitado desacopla a cobrança do consumo real, não correspondendo a pagar só pelo que se usa.`,
    referenceUrl: "https://azure.microsoft.com/en-us/pricing/purchase-options/pay-as-you-go/",
    referenceTitle: "Pay as you go — Microsoft Azure",
    difficulty: "EASY",
  },
  {
    key: "AZ1-027",
    domainCode: 1,
    stem: `A logistics company runs a shipment-tracking system that uses roughly the same amount of compute around the clock, every day, for the foreseeable future. The cloud bill for that system is the team's largest cost line.

Which pricing approach is most likely to reduce these costs, and why?`,
    options: [
      "Pay-as-you-go, because its per-hour rates are the lowest for workloads that run all day and night",
      "Azure Reservations, because a one-year or three-year commitment earns a discount on the matching resources",
      "Spot capacity, because it offers the deepest discounts and steady workloads are never evicted",
      "A reservation purchased in a different region, because reservation discounts apply across regions automatically",
    ],
    correctIndex: 1,
    explanationEn: `Azure Reservations help you save money by committing to one-year or three-year plans; the commitment earns a discount on the resources you use, significantly reducing costs compared with pay-as-you-go prices. The savings apply automatically to matching resources within the reservation's scope — a reservation scoped to a different region does not match these resources, so its discount does not apply here.

Pay-as-you-go rates are the baseline that reservations discount from, not the cheapest option for always-on workloads; and spot capacity can be evicted when Azure needs it back, with no SLA — the wrong fit for a tracking system that must stay up.`,
    explanationPt: `O Azure Reservations ajuda a economizar mediante compromisso de um ou três anos; o compromisso rende desconto sobre os recursos usados, reduzindo significativamente os custos em relação aos preços pay-as-you-go. A economia é aplicada automaticamente aos recursos correspondentes dentro do escopo da reserva — uma reserva com escopo em outra região não corresponde a estes recursos, portanto seu desconto não se aplica aqui.

As tarifas pay-as-you-go são a linha de base da qual as reservas descontam, não a opção mais barata para workloads sempre ativos; e a capacidade spot pode ser despejada quando o Azure precisa dela de volta, sem SLA — encaixe errado para um sistema de rastreamento que precisa ficar no ar.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations",
    referenceTitle: "What are Azure Reservations? — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-028",
    domainCode: 1,
    stem: `A film studio runs nightly rendering jobs that can be restarted if they are interrupted, and it keeps a few dev and test environments that tolerate downtime. It wants the lowest possible compute prices.

Which pricing approach fits, and what is the trade-off?`,
    options: [
      "Azure Reservations, because rendering jobs qualify for the deepest discounts without any commitment",
      "Pay-as-you-go, because it guarantees capacity is available whenever demand rises and prices stay flat",
      "A free monthly allowance, because compute used for rendering is always free up to a monthly cap",
      "Spot capacity: unused capacity at significant savings, accepting that Azure can evict the workloads when it needs them back",
    ],
    correctIndex: 3,
    explanationEn: `Azure Spot Virtual Machines let you take advantage of unused capacity at a significant cost saving; when Azure needs the capacity back, the infrastructure evicts the VMs. That makes spot a fit for workloads that can handle interruptions — batch processing jobs, dev/test environments, and large compute workloads like rendering.

Reservations require a one- or three-year commitment, so the deepest discounts without any commitment mixes models; pay-as-you-go bills standard rates and does not guarantee capacity; and rendering compute is not an always-free category.`,
    explanationPt: `As Azure Spot Virtual Machines permitem aproveitar capacidade não utilizada com economia significativa; quando o Azure precisa da capacidade de volta, a infraestrutura despeja as VMs. Isso faz do spot um encaixe para workloads que toleram interrupções — jobs de processamento em lote, ambientes de dev/test e grandes cargas de computação como rendering.

Reservas exigem compromisso de um ou três anos, então "maiores descontos sem compromisso" mistura os modelos; pay-as-you-go cobra tarifas padrão e não garante capacidade; e computação para rendering não é uma categoria always-free.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/virtual-machines/spot-vms",
    referenceTitle: "Azure Spot Virtual Machines — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-029",
    domainCode: 1,
    stem: `A cloud architect is briefing a client that has heard of three ways to pay for compute: committing for a discount, buying unused capacity, and paying for what is used.

Which statement correctly distinguishes the three pricing models?`,
    options: [
      "Reservations trade a long-term commitment for lower prices; spot trades tolerance for interruptions for significant savings; pay-as-you-go charges only for what you consume",
      "Reservations trade tolerance for interruptions for lower prices; spot trades a long commitment for the deepest savings; pay-as-you-go bills a fixed annual fee",
      "Reservations offer the lowest prices with no commitment; spot offers reserved capacity at fixed prices; pay-as-you-go bills monthly for unlimited use",
      "Reservations apply only to storage charges; spot applies only to database workloads; pay-as-you-go applies only to networking costs",
    ],
    correctIndex: 0,
    explanationEn: `Azure Reservations commit you for one or three years in exchange for a discount on the resources you use. Spot lets you use unused capacity at significant savings, and Azure evicts it when the capacity is needed back — so the trade-off is interruption tolerance. Pay-as-you-go charges only for the services you consume, with no commitment.

The other statements scramble the trade-offs: they attach commitment, interruption, and billing shapes to the wrong models, or carve the models up by service type, which the pricing models are not.`,
    explanationPt: `O Azure Reservations compromete você por um ou três anos em troca de desconto sobre os recursos usados. O spot permite usar capacidade não utilizada com economia significativa, e o Azure a despeja quando precisa dela de volta — o trade-off é a tolerância a interrupções. Pay-as-you-go cobra apenas pelos serviços consumidos, sem compromisso.

As demais afirmações embaralham os trade-offs: atribuem compromisso, interrupção e formatos de cobrança aos modelos errados, ou dividem os modelos por tipo de serviço — o que os modelos de precificação não são.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/cost-management-billing/reservations/save-compute-costs-reservations",
    referenceTitle: "What are Azure Reservations? — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-030",
    domainCode: 1,
    stem: `An online magazine's traffic spikes unpredictably when stories go viral. The publishing system cannot tolerate interruptions, and the team wants to avoid long-term commitments while demand is still uncertain.

Which pricing approach fits best?`,
    options: [
      "Spot capacity, because evictions only occur when traffic is low anyway",
      "Pay-as-you-go: you pay only for what you consume, and costs scale as workload needs change",
      "Azure Reservations, because a three-year commitment is best while demand is still uncertain",
      "A single annual bill that averages out the viral peaks across the whole year",
    ],
    correctIndex: 1,
    explanationEn: `With pay-as-you-go, you typically pay only for the services you consume, which helps you plan and manage operating costs, run infrastructure more efficiently, and scale as workload needs change — the right fit for unpredictable demand with no commitment.

Spot evictions depend on Azure needing the capacity back, not on the customer's traffic, and they carry no service-level agreement — unacceptable for a system that cannot tolerate interruptions. Reservations are the opposite of avoiding long-term commitments; and an annual bill is an invoicing arrangement, not a way to match cost to usage.`,
    explanationPt: `Com pay-as-you-go, você paga tipicamente apenas pelos serviços que consome, o que ajuda a planejar e gerenciar custos operacionais, rodar a infraestrutura com mais eficiência e escalar conforme as necessidades do workload mudam — o encaixe certo para demanda imprevisível sem compromisso.

Despejos de spot dependem de o Azure precisar da capacidade de volta, não do tráfego do cliente, e não têm SLA — inaceitável para um sistema que não tolera interrupções. Reservas são o oposto de "evitar compromissos de longo prazo"; e uma fatura anual é um arranjo de faturamento, não uma forma de casar custo com uso.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-compute/6-describe-consumption-based-model/",
    referenceTitle: "Describe the consumption-based model — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-031",
    domainCode: 1,
    stem: `A junior developer on the team asks what "serverless" actually means in Azure, after hearing the term in a design review.

Which statement is accurate?`,
    options: [
      "It means there are no servers involved anywhere in the process of building and running your code",
      "It means your code runs only on your own on-premises hardware, inside the company's own datacenter",
      "It's a solution like Azure Functions: you write the code, and the cloud provides the resources to keep it running",
      "It means servers are rented by the hour and must be kept running between requests, even when idle or unused",
    ],
    correctIndex: 2,
    explanationEn: `Serverless doesn't mean the absence of servers — it means you don't deploy or maintain them. Azure Functions is a serverless solution that lets you build robust apps using less code, with less infrastructure and lower costs: instead of worrying about deploying and maintaining servers, the cloud infrastructure provides all the up-to-date resources needed to keep your applications running, and you focus on the code that matters most.

Servers still exist — the provider operates them. On-premises-only is the opposite of cloud delivery; and keeping rented servers running between requests describes virtual machines, not serverless.`,
    explanationPt: `Serverless não significa ausência de servidores — significa que você não os implanta nem os mantém. O Azure Functions é uma solução serverless que permite construir aplicações robustas com menos código, menos infraestrutura e custos menores: em vez de se preocupar em implantar e manter servidores, a infraestrutura de nuvem fornece todos os recursos atualizados de que suas aplicações precisam para rodar, e você foca no código que mais importa.

Servidores continuam existindo — quem os opera é o provedor. Rodar só em hardware on-premises é o oposto da entrega pela nuvem; e manter servidores alugados rodando entre requisições descreve máquinas virtuais, não serverless.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview",
    referenceTitle: "Azure Functions overview — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-032",
    domainCode: 1,
    stem: `A photo-sharing app wants to generate thumbnails automatically whenever a user uploads a picture to blob storage — with no polling loop and no always-on server.

Which Azure Functions capability supports this?`,
    options: [
      "Event-driven triggers and bindings that connect the function to other services without extra code",
      "Scheduled timers that fire at fixed nightly intervals, whether or not uploads happened",
      "A manually started console that an operator opens whenever new uploads arrive",
      "A dedicated virtual machine that listens continuously for new uploads to process",
    ],
    correctIndex: 0,
    explanationEn: `Azure Functions provides a comprehensive set of event-driven triggers and bindings that connect your functions to other services without having to write extra code. Processing file uploads is a canonical scenario: run code when a file is uploaded or changed in blob storage.

Scheduled timers exist in Functions, but they answer the run-at-fixed-intervals need, not the run-on-each-upload need; a manually started console contradicts automatic execution; and a dedicated VM listening continuously is the polling pattern that serverless replaces.`,
    explanationPt: `O Azure Functions oferece um conjunto abrangente de triggers e bindings orientados a eventos, que conectam suas funções a outros serviços sem escrever código extra. Processar uploads de arquivos é um cenário canônico: executar código quando um arquivo é carregado ou alterado no blob storage.

Timers agendados existem no Functions, mas atendem à necessidade de "rodar em intervalos fixos", não à de "rodar a cada upload"; um console iniciado manualmente contraria a execução automática; e uma VM dedicada escutando continuamente é o padrão de polling que o serverless substitui.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview",
    referenceTitle: "Azure Functions overview — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-033",
    domainCode: 1,
    stem: `A small product team wants to add a nightly data-cleanup job to its service, but it has no one available to deploy, patch, or maintain servers for it.

Which statement describes how serverless computing helps in this situation?`,
    options: [
      "The team ships the code together with a server image that it keeps patched and updated itself",
      "The team writes the code, and an external contractor deploys and maintains all the underlying servers for it",
      "The code runs whenever a team member logs in and starts the nightly job by hand",
      "The team provides the code, and the cloud provides the resources — no servers to deploy or maintain",
    ],
    correctIndex: 3,
    explanationEn: `Azure Functions is a serverless solution for exactly this shape of work: run code on predefined timed intervals — like a nightly cleanup — while the cloud infrastructure provides all the up-to-date resources needed to keep the application running. The team focuses on the code; Azure handles the rest.

Shipping a patched server image is container or virtual machine operations; relying on an external contractor keeps the burden, just moved to another party; and manual starts defeat the purpose of scheduled automation.`,
    explanationPt: `O Azure Functions é uma solução serverless exatamente para esse formato de trabalho: executar código em intervalos predefinidos — como uma limpeza noturna — enquanto a infraestrutura de nuvem fornece todos os recursos atualizados necessários para manter a aplicação rodando. O time foca no código; o Azure cuida do resto.

Distribuir uma imagem de servidor com patches é operação de contêineres ou máquinas virtuais; depender de um contratado externo mantém a carga, só transferida para terceiros; e inícios manuais derrotam o propósito da automação agendada.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview",
    referenceTitle: "Azure Functions overview — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-034",
    domainCode: 1,
    stem: `A team is choosing between a classic always-on hosting plan and a serverless approach for a web API that mostly sits idle and wakes up for short bursts.

Which statement correctly distinguishes the serverless approach in this comparison?`,
    options: [
      "It requires at least one always-warm instance running at all times so that responses are never delayed by cold starts",
      "Functions are invoked by HTTP triggers, scale fast on events, and bill pay-as-you-go — not dedicated instances running around the clock",
      "Its functions must run continuously in the background, polling for incoming requests to react",
      "It always costs more than a dedicated plan, because idle time is billed at the full hourly rate",
    ],
    correctIndex: 1,
    explanationEn: `With Azure Functions, you can implement a set of REST endpoints for your web applications using HTTP triggers; the recommended hosting provides fast event-driven scaling with pay-as-you-go billing. An API that sits idle and wakes up for short bursts is the textbook fit.

Always-warm instances exist, but as an option for the fastest response times — not a requirement of serverless; continuous background running is the polling pattern functions replace; and the cost claim is inverted — serverless is positioned on less infrastructure and lower costs, with billing tied to consumption.`,
    explanationPt: `Com o Azure Functions, você implementa um conjunto de endpoints REST para suas aplicações web por meio de HTTP triggers; o hosting recomendado oferece escalonamento rápido orientado a eventos com cobrança pay-as-you-go. Uma API que fica ociosa e acorda em picos é o encaixe de livro-texto.

Instâncias always-warm existem, mas como opção para os tempos de resposta mais rápidos — não como requisito do serverless; rodar continuamente em background é o padrão de polling que as funções substituem; e a alegação de custo está invertida — o serverless é posicionado com menos infraestrutura e custos menores, com cobrança ligada ao consumo.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview",
    referenceTitle: "Azure Functions overview — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-035",
    domainCode: 1,
    stem: `An IoT startup needs to capture and transform data from device event streams on the way to storage, reacting to each event as it arrives, without managing any servers.

Which approach fits, and why?`,
    options: [
      "A fleet of virtual machines that polls the device queue on a fixed interval, day and night",
      "A nightly batch job that runs once a day, regardless of when the events actually arrive",
      "Azure Functions with event-driven triggers: code runs in response to events, and the cloud keeps it running",
      "A manually operated export tool that an engineer runs whenever the data is needed",
    ],
    correctIndex: 2,
    explanationEn: `Processing data in real time — capturing and transforming data from event and IoT source streams on the way to storage — is one of the integrated scenarios Azure Functions is built for. Event-driven triggers invoke code as events arrive; the cloud infrastructure provides the resources needed to keep the application running, so no servers are managed on the startup's side.

A polling VM fleet reintroduces server management and fixed-interval latency; a nightly batch loses the real-time requirement; and a manual export tool is neither automatic nor event-driven.`,
    explanationPt: `Processar dados em tempo real — capturar e transformar dados de fluxos de eventos e IoT a caminho do armazenamento — é um dos cenários integrados para os quais o Azure Functions foi construído. Triggers orientados a eventos invocam o código conforme os eventos chegam; a infraestrutura de nuvem fornece os recursos necessários para manter a aplicação rodando, então nenhum servidor é gerenciado pelo lado da startup.

Uma frota de VMs em polling reintroduz gerenciamento de servidores e latência de intervalo fixo; um job noturno em lote perde o requisito de tempo real; e uma ferramenta manual de exportação não é nem automática nem orientada a eventos.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/azure-functions/functions-overview",
    referenceTitle: "Azure Functions overview — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-036",
    domainCode: 1,
    stem: `A regional hospital network is moving its patient scheduling application to Azure. The CIO's top requirement is that the application stays accessible to clinicians whenever they need it, even when individual components or the underlying infrastructure experience disruptions. Which cloud benefit is the CIO describing?`,
    options: [
      "Scalability, because more resources can be added whenever the volume of user traffic increases",
      "High availability, which focuses on ensuring maximum availability regardless of disruptions or events",
      "Cost predictability, because resource usage can be tracked in real time",
      "Elasticity, because capacity automatically expands and contracts to match live demand",
    ],
    correctIndex: 1,
    explanationEn: `High availability focuses on ensuring maximum availability, regardless of disruptions or events that may occur. Azure is a highly available cloud environment, and its uptime guarantees for each service are expressed in the service-level agreements (SLAs). Scalability and elasticity are about adjusting capacity to meet demand, not about availability guarantees: scalability is the general ability to add or remove resources, and elasticity automatically matches supply to real-time demand. Cost predictability concerns forecasting cloud spending, which does not keep a service reachable during disruptions.`,
    explanationPt: `A alta disponibilidade (high availability) concentra-se em garantir a máxima disponibilidade, independentemente de interrupções ou eventos que possam ocorrer. O Azure é um ambiente de nuvem altamente disponível, e suas garantias de uptime por serviço são expressas nos service-level agreements (SLAs). Escalabilidade e elasticidade tratam de ajustar capacidade para atender à demanda, e não de garantias de disponibilidade: escalabilidade é a capacidade geral de adicionar ou remover recursos, e elasticidade ajusta automaticamente a oferta à demanda em tempo real. Previsibilidade de custo trata de prever gastos, o que não mantém um serviço acessível durante interrupções.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-037",
    domainCode: 1,
    stem: `An engineering consultancy runs its 3D rendering workload on a single Azure virtual machine. Render jobs are taking too long, so the team decides to add more CPUs and more RAM to that same virtual machine. In cloud terminology, what is the team doing?`,
    options: [
      "Scaling out horizontally by adding more virtual machines to share the rendering jobs",
      "Scaling in by removing rendering capacity until the next job arrives",
      "Relying on autoscaling, since the platform adjusts the machine size on its own",
      "Scaling up vertically by increasing the capabilities of an existing resource",
    ],
    correctIndex: 3,
    explanationEn: `Vertical scaling is focused on increasing or decreasing the capabilities of a resource — for example, adding more CPUs or RAM to a virtual machine. Moving up is called scaling up, and moving down is called scaling down. Horizontal scaling instead changes the number of resources, such as adding or removing virtual machines or containers (scaling out or in). Autoscaling describes the platform adjusting capacity automatically based on demand rather than an administrator resizing one machine, and scaling in removes instances instead of adding processing power.`,
    explanationPt: `A escala vertical consiste em aumentar ou diminuir as capacidades de um recurso — por exemplo, adicionar mais CPUs ou RAM a uma máquina virtual. Subir é chamado de scale up, e baixar, de scale down. Já a escala horizontal altera a quantidade de recursos, como adicionar ou remover máquinas virtuais ou contêineres (scale out ou scale in). Autoscaling descreve o ajuste automático de capacidade pela plataforma conforme a demanda, e não um administrador redimensionando uma única máquina; e scale in remove instâncias em vez de adicionar poder de processamento.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-038",
    domainCode: 1,
    stem: `A manufacturer's production planning application was not designed to run as multiple parallel instances; its architecture assumes one instance with shared in-process state. Month-end processing pushes that single instance to its limits for a few hours each month. Which approach should the cloud team take during that window?`,
    options: [
      "Vertically scale up the virtual machine during month-end processing, then scale it back down afterward",
      "Horizontally scale out by adding extra application instances behind a load balancer",
      "Redeploy the application across several regions so each region handles part of the workload",
      "Configure automatic scaling rules so the platform adds instances when CPU usage spikes",
    ],
    correctIndex: 0,
    explanationEn: `Because the application cannot run as multiple parallel instances, every approach that adds instances — scaling out behind a load balancer, spreading across regions, or automatic scale-out rules — is impossible without redesigning it. Vertical scaling solves the problem within the single-instance constraint: increase the capabilities of the one virtual machine (more CPUs or RAM) during the month-end window, then scale back down afterward. Because the cloud is consumption-based, the larger machine is paid for only while it is needed.`,
    explanationPt: `Como a aplicação não pode rodar em várias instâncias paralelas, qualquer abordagem que adicione instâncias — scale out atrás de um load balancer, distribuição por regiões ou regras de escala automática — é inviável sem redesenhar a aplicação. A escala vertical resolve o problema dentro da restrição de instância única: aumentam-se as capacidades da única máquina virtual (mais CPUs ou RAM) durante a janela de fechamento mensal e depois reduz-se novamente. Como a nuvem é baseada em consumo, a máquina maior é paga somente enquanto for necessária.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-039",
    domainCode: 1,
    stem: `An online retailer is preparing a 48-hour flash sale. To absorb the surge, the web operations team plans to add several virtual machine instances to the website tier for the weekend and remove the extra instances once the sale ends. Which scaling pattern does this plan describe?`,
    options: [
      "Vertical scaling up, because each virtual machine receives more CPUs and RAM",
      "Reliability, because the website quickly recovers from any component failures during the sale",
      "Horizontal scaling out and then in, because the number of instances follows demand",
      "Cost predictability, because the team forecasts the sale's cloud spending in advance",
    ],
    correctIndex: 2,
    explanationEn: `Horizontal scaling adds or subtracts the number of resources: deploying additional virtual machines or containers is scaling out, and removing them when demand drops is scaling in — either action can be manual or automatic. Vertical scaling is different because it increases or decreases the capabilities of an individual resource, such as adding CPUs or RAM to one machine. Reliability concerns recovering from failures and continuing to function, and cost predictability concerns forecasting spend; neither describes changing the instance count.`,
    explanationPt: `A escala horizontal adiciona ou subtrai a quantidade de recursos: implantar máquinas virtuais ou contêineres adicionais é scale out, e removê-los quando a demanda cai é scale in — manual ou automaticamente. A escala vertical é diferente, pois aumenta ou diminui as capacidades de um recurso individual, como adicionar CPUs ou RAM a uma única máquina. Confiabilidade (reliability) trata de recuperar-se de falhas e continuar funcionando, e previsibilidade de custo trata de prever gastos; nenhuma delas descreve mudar a quantidade de instâncias.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-040",
    domainCode: 1,
    stem: `An education technology platform serves steady traffic most of the year, with extreme spikes during course registration weeks. On-premises, the company had to buy hardware sized for the peak that then sat idle. After moving to Azure, which pairing of cloud benefits most directly resolves both the capacity spikes and the wasted idle capacity?`,
    options: [
      "Scalability with consumption-based billing: grow for peaks, shrink afterward, and pay only for what you use",
      "High availability with service-level agreements: the uptime guarantees keep the platform online during the registration peaks",
      "Reliability with a decentralized design: resources deployed in additional regions absorb the registration traffic",
      "Governance with cloud-based auditing: regular compliance checks verify that resources match demand patterns",
    ],
    correctIndex: 0,
    explanationEn: `Scalability is the ability to adjust resources to meet demand, and because the cloud is a consumption-based model, you only pay for what you use: if demand drops off, you can reduce your resources and thereby reduce your costs — eliminating hardware bought for a peak that sits idle. High availability and its service-level agreements address uptime, not capacity or cost per unit of use. Reliability through a decentralized design helps recover from regional failures, and governance and auditing enforce standards and compliance rather than sizing capacity.`,
    explanationPt: `Escalabilidade é a capacidade de ajustar recursos para atender à demanda e, como a nuvem segue o modelo baseado em consumo, você paga apenas pelo que usa: se a demanda cai, você reduz os recursos e, com isso, os custos — eliminando o hardware comprado para o pico que fica ocioso. Alta disponibilidade e seus SLAs tratam de uptime, não de capacidade nem de custo por uso. A confiabilidade via design descentralizado ajuda na recuperação de falhas regionais, e governança e auditoria reforçam padrões e conformidade, sem dimensionar capacidade.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-041",
    domainCode: 1,
    stem: `A ticketing platform sees demand explode within minutes when popular events go on sale, and collapse just as quickly afterward. Operations wants capacity to follow this demand automatically — growing and shrinking without anyone adding or removing servers manually — so that performance stays consistent and the company does not pay for idle capacity. Which concept does the operations team want?`,
    options: [
      "Vertical scaling, because upgrading the size of each server absorbs the higher load",
      "Horizontal scaling, because operations staff can add and remove virtual machines as traffic changes",
      "High availability, because service-level agreements keep the service online during spikes",
      "Elasticity, because resources automatically expand and contract to match real-time demand",
    ],
    correctIndex: 3,
    explanationEn: `Cloud elasticity is the ability of the infrastructure to automatically adjust computing resources based on real-time demand: when traffic increases, additional resources are provisioned; when demand drops, capacity scales back — all without manual intervention, keeping applications responsive while controlling cost. Horizontal scaling is the broader ability to change the number of resources, but when operations staff add and remove machines manually, that is exactly the effort the team wants to eliminate. Vertical scaling changes a single server's size and is typically a planned, manual change, and high availability concerns uptime guarantees rather than capacity that follows demand.`,
    explanationPt: `Elasticidade na nuvem é a capacidade da infraestrutura de ajustar automaticamente os recursos de computação com base na demanda em tempo real: quando o tráfego aumenta, recursos adicionais são provisionados; quando a demanda cai, a capacidade é reduzida — tudo sem intervenção manual, mantendo as aplicações responsivas e controlando o custo. A escala horizontal é a capacidade mais geral de alterar a quantidade de recursos, mas quando a equipe de operações adiciona e remove máquinas manualmente, isso é exatamente o esforço que se quer eliminar. A escala vertical muda o tamanho de um único servidor e costuma ser uma alteração planejada e manual; e a alta disponibilidade trata de garantias de uptime, não de capacidade que segue a demanda.`,
    referenceUrl: "https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-is-elastic-computing",
    referenceTitle: "What is elasticity in cloud computing? — Microsoft Azure",
    difficulty: "HARD",
  },
  {
    key: "AZ1-042",
    domainCode: 1,
    stem: `A logistics company is selecting Azure services for its shipment tracking platform. Before signing off, the legal team wants to review Microsoft's formal commitments about how much uptime each Azure service guarantees. Where should the cloud team point the legal team?`,
    options: [
      "The total cost of ownership (TCO) calculator, which compares on-premises and cloud operating costs",
      "The service-level agreements (SLAs), which state the uptime guarantees that depend on the service",
      "The Azure Well-Architected Framework, which provides design guidance for reliable workloads",
      "The Azure Pricing Calculator, which estimates the monthly cost of each service",
    ],
    correctIndex: 1,
    explanationEn: `Azure is a highly available cloud environment with uptime guarantees that depend on the service, and these guarantees are part of the service-level agreements (SLAs) — the documents the legal team should review. The TCO calculator and the Azure Pricing Calculator are cost tools: the first compares the total cost of owning infrastructure versus moving to the cloud, and the second estimates service prices. The Azure Well-Architected Framework offers architecture guidance (with reliability as one of its pillars), not contractual uptime commitments.`,
    explanationPt: `O Azure é um ambiente de nuvem altamente disponível, com garantias de uptime que dependem do serviço — e essas garantias fazem parte dos service-level agreements (SLAs), os documentos que o jurídico deve revisar. A calculadora de TCO e o Azure Pricing Calculator são ferramentas de custo: a primeira compara o custo total de possuir infraestrutura versus migrar para a nuvem; a segunda estima preços de serviços. O Azure Well-Architected Framework oferece orientação de arquitetura (com a confiabilidade como um de seus pilares), não compromissos contratuais de uptime.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/2-high-availability-scalability-cloud",
    referenceTitle: "Describe the benefits of high availability and scalability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-043",
    domainCode: 1,
    stem: `An insurance company is designing its claims processing platform on Azure. The lead architect summarizes one design goal this way: "If any component fails, the system must be able to recover from failures and continue to function." Which cloud benefit is the architect describing?`,
    options: [
      "High availability, which focuses on maximizing uptime regardless of disruptions or outages",
      "Scalability, which adjusts the amount of resources to meet demand",
      "Reliability, a system's ability to recover from failures and keep functioning",
      "Cost predictability, which forecasts future cloud spending from usage patterns",
    ],
    correctIndex: 2,
    explanationEn: `Reliability is the ability of a system to recover from failures and continue to function, and it is one of the pillars of the Microsoft Azure Well-Architected Framework; the cloud supports it through its decentralized design. High availability is related but distinct: it focuses on ensuring maximum availability regardless of disruptions or events. Scalability deals with adjusting resources to demand, and cost predictability deals with forecasting cloud spend — neither of them describes recovering from failures.`,
    explanationPt: `Confiabilidade (reliability) é a capacidade de um sistema de se recuperar de falhas e continuar funcionando, e é um dos pilares do Microsoft Azure Well-Architected Framework; a nuvem a sustenta por meio do design descentralizado. A alta disponibilidade é relacionada, mas distinta: foca em garantir a máxima disponibilidade independentemente de interrupções ou eventos. Escalabilidade trata de ajustar recursos à demanda, e previsibilidade de custo trata de prever gastos na nuvem — nenhuma delas descreve a recuperação de falhas.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud",
    referenceTitle: "Describe the benefits of reliability and predictability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-044",
    domainCode: 1,
    stem: `A multinational utility company runs a grid monitoring API that must keep serving requests even if a catastrophic event, such as a natural disaster, takes an entire Azure region offline. When the architect explains that users would be served from other regions, which characteristic of the cloud is the architect counting on?`,
    options: [
      "The decentralized design, which spreads resources across regions so others keep running when one fails",
      "The centralized design, which concentrates all resources in a single, highly secured datacenter",
      "The consumption-based model, which charges you only for the capacity actually used in each region",
      "Automatic patching, which keeps every regional deployment updated and consistent over time",
    ],
    correctIndex: 0,
    explanationEn: `The cloud, by virtue of its decentralized design, naturally supports a reliable and resilient infrastructure: resources can be deployed in regions around the world, so even if one region suffers a catastrophic event, other regions are still up and running, and applications can be designed to take advantage of this global scale — in some cases, the cloud environment itself shifts to a different region automatically. A centralized design in one datacenter is the opposite of this benefit. The consumption-based model concerns billing, and automatic patching concerns updates, not surviving a regional outage.`,
    explanationPt: `A nuvem, em virtude do design descentralizado, naturalmente dá suporte a uma infraestrutura confiável e resiliente: os recursos podem ser implantados em regiões ao redor do mundo, de modo que, mesmo que uma região sofra um evento catastrófico, as outras continuam operando — e as aplicações podem ser desenhadas para aproveitar essa escala global, sendo que, em alguns casos, o próprio ambiente de nuvem muda automaticamente para outra região. Um design centralizado em um único datacenter é o oposto desse benefício. O modelo baseado em consumo trata de cobrança, e o patching automático trata de atualizações, não de sobreviver à interrupção de uma região.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud",
    referenceTitle: "Describe the benefits of reliability and predictability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-045",
    domainCode: 1,
    stem: `A video streaming startup is planning its growth and wants playback quality and response times to stay consistent as viewer numbers fluctuate through the day. The product owner asks which cloud benefit focuses on predicting the resources needed to deliver that positive experience. What is the correct answer?`,
    options: [
      "Cost predictability, which forecasts cloud spending from usage data and trend analytics",
      "Performance predictability, which focuses on resources needed for a positive customer experience",
      "Reliability, which recovers the platform from failures and keeps it functioning",
      "Governance, which enforces corporate standards and requirements on deployed resources",
    ],
    correctIndex: 1,
    explanationEn: `Performance predictability focuses on predicting the resources needed to deliver a positive experience for customers. Cloud concepts that support it include autoscaling (which deploys additional resources to meet demand and scales back when it drops), load balancing (which redirects overload to less stressed areas), and high availability. Cost predictability instead focuses on predicting or forecasting cloud spend, reliability on recovering from failures, and governance on keeping resources compliant with standards and regulations.`,
    explanationPt: `A previsibilidade de performance concentra-se em prever os recursos necessários para entregar uma experiência positiva ao cliente. Entre os conceitos de nuvem que a sustentam estão o autoscaling (que implanta recursos adicionais para atender à demanda e reduz quando ela cai), o load balancing (que redireciona a sobrecarga para áreas menos exigidas) e a alta disponibilidade. Já a previsibilidade de custo foca em prever os gastos na nuvem, a confiabilidade em recuperar-se de falhas e a governança em manter os recursos em conformidade com padrões e regulamentos.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud",
    referenceTitle: "Describe the benefits of reliability and predictability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-046",
    domainCode: 1,
    stem: `A fintech's finance team must submit a quarterly cloud budget. They want to track resource usage in real time, apply data analytics to find spending patterns, and get an estimate of potential spend for a new service before it is deployed. Which benefit and tool pairing should the team use?`,
    options: [
      "Performance predictability with load balancing, which redirects traffic to less stressed areas",
      "Reliability with a decentralized design, which deploys workloads across multiple regions",
      "High availability with service-level agreements, which document each service's uptime guarantee",
      "Cost predictability with the Azure Pricing Calculator, which estimates potential cloud spend",
    ],
    correctIndex: 3,
    explanationEn: `Cost predictability is focused on predicting or forecasting the cost of the cloud spend: you can track resource use in real time, monitor resources to ensure you're using them efficiently, and apply data analytics to find patterns and trends that help plan deployments — and tools like the Azure Pricing Calculator provide estimates of potential spend before deployment. Performance predictability with load balancing addresses a consistent customer experience; reliability with a decentralized design addresses recovery from regional failures; and service-level agreements document uptime guarantees, not budgets.`,
    explanationPt: `A previsibilidade de custo concentra-se em prever ou fazer o forecast do gasto na nuvem: é possível acompanhar o uso de recursos em tempo real, monitorá-los quanto à eficiência e aplicar análises de dados para encontrar padrões e tendências que ajudem a planejar as implantações — e ferramentas como o Azure Pricing Calculator fornecem estimativas do gasto potencial antes da implantação. Previsibilidade de performance com load balancing trata da experiência consistente do cliente; confiabilidade com design descentralizado, da recuperação de falhas regionais; e os service-level agreements documentam garantias de uptime, não orçamentos.`,
    referenceUrl: "https://azure.microsoft.com/en-us/pricing/calculator/",
    referenceTitle: "Azure Pricing Calculator — Microsoft Azure",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-047",
    domainCode: 1,
    stem: `An online learning platform enrolls a wave of new students at the start of each semester. The operations team configures rules so that additional resources deploy automatically when demand rises and scale back automatically when it drops. How does autoscaling support the platform's performance predictability?`,
    options: [
      "It deploys additional resources when demand rises and scales back when the demand drops",
      "It redirects traffic from overloaded instances to less stressed areas of the deployment",
      "It guarantees a fixed monthly spend by keeping the resource count constant",
      "It raises each service's uptime guarantee during periods of peak demand",
    ],
    correctIndex: 0,
    explanationEn: `Autoscaling supports performance predictability: if you suddenly need more resources, autoscaling can deploy additional resources to meet the demand, and then scale back when the demand drops — helping predict the resources needed to deliver a positive customer experience. Redirecting traffic from overloaded instances to less stressed areas is load balancing, a different mechanism that supports the same goal but adds no capacity. Autoscaling does not fix monthly spend, since usage still varies, and scaling does not change a service's uptime guarantee, which is defined in its service-level agreement.`,
    explanationPt: `O autoscaling sustenta a previsibilidade de performance: quando mais recursos são repentinamente necessários, ele implanta recursos adicionais para atender à demanda e depois reduz quando ela cai — ajudando a prever os recursos necessários para uma experiência positiva ao cliente. Redirecionar o tráfego de instâncias sobrecarregadas para áreas menos exigidas é o load balancing, um mecanismo diferente que apoia o mesmo objetivo, mas sem adicionar capacidade. O autoscaling não fixa o gasto mensal, pois o uso continua variando, e escalar não altera a garantia de uptime de um serviço, que é definida em seu service-level agreement.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud",
    referenceTitle: "Describe the benefits of reliability and predictability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-048",
    domainCode: 1,
    stem: `During a cloud adoption workshop, the IT steering committee of a media company asks a solution architect to confirm several claims they have read about cloud reliability and predictability before approving the migration plan. Which claim is accurate?`,
    options: [
      "Reliability depends on a centralized design that concentrates workloads in a single primary datacenter.",
      "Cost predictability is achieved primarily by scaling out more virtual machines whenever demand spikes.",
      "Performance predictability focuses on predicting the resources needed to deliver a positive experience for customers.",
      "Service-level agreements are the primary tool for forecasting future spending on cloud services.",
    ],
    correctIndex: 2,
    explanationEn: `Performance predictability focuses on predicting the resources needed to deliver a positive experience for customers, supported by concepts such as autoscaling, load balancing, and high availability. Reliability comes from the cloud's decentralized design — resources deployed in regions worldwide — not from concentrating workloads in one datacenter. Cost predictability comes from tracking usage in real time, analytics on patterns and trends, and tools like the Azure Pricing Calculator; adding virtual machines during spikes is a scalability response, and service-level agreements document uptime guarantees, not budgets.`,
    explanationPt: `A previsibilidade de performance concentra-se em prever os recursos necessários para entregar uma experiência positiva ao cliente, com apoio de conceitos como autoscaling, load balancing e alta disponibilidade. A confiabilidade decorre do design descentralizado da nuvem — recursos implantados em regiões ao redor do mundo — e não da concentração de workloads em um único datacenter. A previsibilidade de custo vem do acompanhamento do uso em tempo real, de análises de padrões e tendências e de ferramentas como o Azure Pricing Calculator; adicionar máquinas virtuais em picos é uma resposta de escalabilidade, e os service-level agreements documentam garantias de uptime, não orçamentos.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/3-reliability-predictability-cloud",
    referenceTitle: "Describe the benefits of reliability and predictability in the cloud — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-049",
    domainCode: 1,
    stem: `A nonprofit with a two-person IT team is moving its donor management application to the cloud. The team wants the cloud provider to handle operating system patches and platform maintenance automatically so they can focus on the application itself. Which service model strategy meets this need?`,
    options: [
      "Infrastructure as a service, which keeps the team fully responsible for operating systems and patches",
      "Platform as a service or software as a service, where patches and maintenance may be applied automatically",
      "A hybrid cloud deployment, which preserves the team's current manual patching practices unchanged",
      "Infrastructure as a service with automated backups, because regular backups keep the operating system current",
    ],
    correctIndex: 1,
    explanationEn: `Whether patches and updates are applied automatically depends on the operating model: with platform as a service (PaaS) or software as a service (SaaS), patches and maintenance can be taken care of automatically, which helps both governance and security. Infrastructure as a service (IaaS) provides physical resources but leaves the operating systems, installed software, and patching to the customer — backups do not keep an operating system current or change that responsibility, and a hybrid deployment keeps the portion you run under your own patching practices.`,
    explanationPt: `Se patches e atualizações são aplicados automaticamente depende do modelo operacional: em platform as a service (PaaS) ou software as a service (SaaS), patches e manutenção podem ser cuidados automaticamente, o que ajuda tanto a governança quanto a segurança. Já o infrastructure as a service (IaaS) fornece os recursos físicos, mas deixa sistemas operacionais, software instalado e patching sob responsabilidade do cliente — backups não mantêm um sistema operacional atualizado nem mudam essa responsabilidade, e um modelo híbrido mantém a parte que você opera sob suas próprias práticas de patching.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-050",
    domainCode: 1,
    stem: `A pharmaceutical company's security policy requires its internal team to keep full control of the operating systems, installed software, and patch timing on every server that runs a laboratory reporting application. Which cloud service type should the team choose to preserve this level of control?`,
    options: [
      "Software as a service, which transfers all operating system responsibilities to the provider",
      "Infrastructure as a service, where the team manages the operating systems and installed software",
      "Platform as a service, where patches are applied automatically on the provider's own schedule",
      "Serverless computing, which runs code on demand without exposing any server-level configuration",
    ],
    correctIndex: 1,
    explanationEn: `If you want maximum control of security, infrastructure as a service (IaaS) provides physical resources but lets you manage the operating systems and installed software, including patches and maintenance — exactly the control the security policy demands. Platform as a service applies patches on the provider's schedule, software as a service removes operating system responsibility from the customer, and serverless abstracts servers away so there is no operating system to control. Each of those models reduces the team's control rather than preserving it.`,
    explanationPt: `Quando se quer controle máximo de segurança, o infrastructure as a service (IaaS) fornece os recursos físicos, mas deixa você gerenciar os sistemas operacionais e o software instalado, incluindo patches e manutenção — exatamente o controle que a política de segurança exige. O platform as a service aplica patches no cronograma do provedor, o software as a service retira do cliente a responsabilidade pelo sistema operacional e o serverless abstrai os servidores, sem sistema operacional a controlar. Cada um desses modelos reduz, em vez de preservar, o controle da equipe.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-051",
    domainCode: 1,
    stem: `A public sector agency learns that a new regulation requires a revised data retention configuration on every cloud resource it has deployed. The agency needs to roll the change out efficiently across all deployed resources, without administrators reconfiguring each one by hand. Which governance benefit of the cloud should the agency rely on?`,
    options: [
      "Vertical scaling, which increases the capabilities of each resource so changes apply faster",
      "Cloud-based auditing, which identifies resources that no longer comply with the new standard",
      "High availability, which keeps the agency's services online while the standard is applied",
      "The ability to update resources at scale as standards and requirements change",
    ],
    correctIndex: 3,
    explanationEn: `A core governance benefit in the cloud is that resources can be updated at scale as standards change: tools such as templates help ensure deployed resources meet your technical standards and regulatory requirements, and when those standards change, updates can be applied broadly instead of reconfiguring each resource manually. Cloud-based auditing is complementary but different: it flags resources that are out of compliance and provides mitigation strategies rather than applying the new configuration. Vertical scaling and high availability address capacity and uptime, not configuration compliance.`,
    explanationPt: `Um benefício central da governança na nuvem é a possibilidade de atualizar recursos em escala conforme os padrões mudam: ferramentas como templates ajudam a garantir que os recursos implantados atendam aos seus padrões técnicos e requisitos regulatórios e, quando esses padrões mudam, as atualizações podem ser aplicadas amplamente, em vez de reconfigurar cada recurso manualmente. A auditoria baseada em nuvem é complementar, mas diferente: ela sinaliza recursos fora de conformidade e fornece estratégias de mitigação, sem aplicar a nova configuração. Escala vertical e alta disponibilidade tratam de capacidade e uptime, não de conformidade de configuração.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-052",
    domainCode: 1,
    stem: `An online news publisher is a frequent target of distributed denial-of-service (DDoS) attacks that can overwhelm its on-premises web servers, especially on election nights. The publisher is evaluating a move to Azure. Which security benefit of the cloud directly addresses this specific threat?`,
    options: [
      "Automatic operating system patching, which closes the software vulnerabilities exploited by the attackers",
      "Deployment templates, which ensure that every server follows the same technical standards",
      "Cloud providers are typically well suited to handle DDoS attacks, making networks robust",
      "Consumption-based billing, which reduces the financial cost of absorbing the attack traffic",
    ],
    correctIndex: 2,
    explanationEn: `On the security side, cloud providers are typically well suited to handle distributed denial-of-service (DDoS) attacks, making your network more robust and secure — provider-scale infrastructure can absorb and filter attack traffic that would overwhelm on-premises servers. Automatic patching addresses software vulnerabilities, not traffic floods; deployment templates are a governance benefit that standardizes deployments; and consumption-based billing changes how usage is charged, but it does not filter attack traffic.`,
    explanationPt: `No campo da segurança, os provedores de nuvem costumam estar bem preparados para lidar com ataques de negação de serviço distribuída (DDoS), tornando sua rede mais robusta e segura — a infraestrutura em escala do provedor consegue absorver e filtrar o tráfego de ataque que sobrecarregaria servidores locais. O patching automático trata de vulnerabilidades de software, não de inundações de tráfego; templates de implantação são um benefício de governança que padroniza as implantações; e a cobrança por consumo muda como o uso é faturado, mas não filtra o tráfego de ataque.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-053",
    domainCode: 1,
    stem: `A retail chain's compliance officer wants to know whether any of the company's deployed cloud resources have drifted away from its corporate security baseline, and wants suggestions for fixing the problems. Which governance capability of the cloud provides this?`,
    options: [
      "Automatic patching, which applies the latest software updates to deployed resources",
      "Cloud-based auditing, which flags resources out of compliance and provides mitigation strategies",
      "Automatic alerts based on configured metrics, which report resource performance in real time",
      "Elasticity, which adjusts the number of deployed resources to match demand",
    ],
    correctIndex: 1,
    explanationEn: `Cloud-based auditing helps flag resources that are out of compliance with your baseline and provides mitigation strategies — a governance benefit that supports compliance monitoring at scale. Automatic patching applies updates but does not compare deployed resources against a baseline; automatic alerts on configured metrics are a manageability feature focused on real-time performance; and elasticity adjusts capacity to demand, which is a scalability concern rather than a compliance check.`,
    explanationPt: `A auditoria baseada em nuvem (cloud-based auditing) ajuda a sinalizar recursos que estão fora de conformidade com sua linha de base e fornece estratégias de mitigação — um benefício de governança que dá suporte ao monitoramento de conformidade em escala. O patching automático aplica atualizações, mas não compara os recursos implantados com uma baseline; os alertas automáticos baseados em métricas são um recurso de gerenciabilidade voltado à performance em tempo real; e a elasticidade ajusta a capacidade à demanda, o que é escalabilidade, e não verificação de conformidade.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-054",
    domainCode: 1,
    stem: `The IT steering committee of a manufacturing group is reviewing statements about security and governance in the cloud before approving a migration to Azure. Which statement should the solution architect confirm as accurate?`,
    options: [
      "Establishing a good governance footprint early keeps the group's cloud footprint updated, secure, and well managed.",
      "Cloud governance tools replace the need to define corporate standards and regulatory requirements.",
      "Governance features in the cloud apply only to platform as a service deployments.",
      "Security responsibilities are identical across infrastructure as a service, platform as a service, and software as a service.",
    ],
    correctIndex: 0,
    explanationEn: `An accurate statement from the module: by establishing a good governance footprint early, you can keep your cloud footprint updated, secure, and well managed — tools such as templates and cloud-based auditing then help ensure that deployed resources meet your technical standards and regulatory requirements as they change.

The other statements fail on content. Governance tools enforce and monitor the standards you define — they do not replace defining corporate and regulatory requirements; and cloud features support governance and compliance whether you deploy infrastructure as a service or software as a service, not only platform as a service. And security responsibilities are not identical across models: infrastructure as a service leaves operating systems and installed software to the customer, while platform and software as a service apply patches and maintenance automatically.`,
    explanationPt: `Uma afirmação exata do módulo: ao estabelecer cedo uma boa base de governança, você mantém sua presença em nuvem atualizada, segura e bem gerenciada — ferramentas como templates e a auditoria baseada em nuvem passam a ajudar a garantir que os recursos implantados atendam aos seus padrões técnicos e requisitos regulatórios conforme eles mudam.

As demais afirmações falham por conteúdo. Ferramentas de governança aplicam e monitoram os padrões que você define — não substituem a definição de requisitos corporativos e regulatórios; e os recursos de nuvem dão suporte a governança e conformidade tanto em implantações de infrastructure as a service quanto de software as a service, não apenas de platform as a service. E as responsabilidades de segurança não são idênticas entre os modelos: no infrastructure as a service, sistemas operacionais e software instalado ficam com o cliente, enquanto no platform e no software as a service patches e manutenção são aplicados automaticamente.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/4-security-governance-cloud",
    referenceTitle: "Describe the benefits of security and governance in the cloud — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-055",
    domainCode: 1,
    stem: `A newly hired cloud administrator at a university asks which interfaces are available for day-to-day management of the institution's cloud resources. Teammates prefer different tools: some like working in a browser, others automate everything from a shell. Which set of interfaces should the administrator mention?`,
    options: [
      "The cloud benefits of high availability, scalability, reliability, and elasticity",
      "The TCO calculator, the pricing calculator, and the service-level agreements",
      "Infrastructure as a service, platform as a service, and software as a service",
      "A web portal, a command-line interface, APIs, and PowerShell scripts",
    ],
    correctIndex: 3,
    explanationEn: `Management in the cloud is about how you're able to manage your cloud environment and resources, and you can do that through a web portal (the Azure portal), a command-line interface (the Azure CLI), APIs, and PowerShell — so both browser-oriented and script-oriented administrators are covered. The other choices describe different things: high availability, scalability, reliability, and elasticity are cloud benefits; the TCO calculator, the pricing calculator, and service-level agreements are cost and uptime artifacts; and infrastructure, platform, and software as a service are service types, not management interfaces.`,
    explanationPt: `O gerenciamento na nuvem (management in the cloud) diz respeito a como você gerencia seu ambiente e seus recursos de nuvem — e isso pode ser feito por um portal web (o portal do Azure), uma interface de linha de comando (a CLI do Azure), APIs e PowerShell, atendendo tanto administradores que preferem navegador quanto os que automatizam via shell. As demais opções descrevem outras coisas: alta disponibilidade, escalabilidade, confiabilidade e elasticidade são benefícios da nuvem; a calculadora de TCO, a calculadora de preços e os SLAs são artefatos de custo e uptime; e infrastructure, platform e software as a service são tipos de serviço, não interfaces de gerenciamento.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-056",
    domainCode: 1,
    stem: `A logistics company's small operations team wants the cloud to watch the health of its resources continuously and, when a resource starts failing, to replace it without anyone having to intervene. Which manageability capability of the cloud matches this requirement?`,
    options: [
      "Operators running PowerShell scripts to restart services by hand",
      "Deploying new resources quickly from a preconfigured template",
      "Monitoring the health of resources and automatically replacing failing ones",
      "Receiving automatic alerts based on configured performance metrics",
    ],
    correctIndex: 2,
    explanationEn: `Managing your cloud resources — management of the cloud — includes monitoring the health of resources and automatically replacing failing ones, which removes the human intervention the team wants to avoid. Deploying from preconfigured templates removes manual configuration at deployment time but does not detect or replace unhealthy resources; automatic alerts based on configured metrics keep you informed in real time but still require someone to act; and PowerShell scripts are a management interface operated by people, not an automated platform capability.`,
    explanationPt: `O gerenciamento dos seus recursos de nuvem (management of the cloud) inclui monitorar a saúde dos recursos e substituir automaticamente os que falham — eliminando a intervenção humana que a equipe quer evitar. Implantar a partir de templates preconfigurados remove a configuração manual no momento da implantação, mas não detecta nem substitui recursos não íntegros; os alertas automáticos baseados em métricas mantêm você informado em tempo real, mas ainda exigem alguém para agir; e scripts PowerShell são uma interface de gerenciamento operada por pessoas, não uma capacidade automática da plataforma.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-057",
    domainCode: 1,
    stem: `A food delivery platform's operations lead wants to hear about performance problems as they happen — for example, an automatic notification whenever a configured metric crosses a defined threshold. Which manageability capability of the cloud provides this?`,
    options: [
      "Receiving automatic alerts based on configured metrics, for real-time awareness",
      "Vertically scaling up the affected resource to add more capacity",
      "A service-level agreement with a higher uptime guarantee for the service",
      "A monthly cloud-based auditing report on resource compliance",
    ],
    correctIndex: 0,
    explanationEn: `Receiving automatic alerts based on configured metrics is a manageability benefit of the cloud: you're aware of performance in real time, so problems surface as they happen rather than after users complain. Vertical scaling adds capacity to a resource but does not notify anyone; a service-level agreement documents uptime guarantees rather than reporting live performance; and cloud-based auditing checks resources against compliance baselines — a governance capability — instead of monitoring live metrics.`,
    explanationPt: `Receber alertas automáticos com base em métricas configuradas é um benefício de gerenciabilidade da nuvem: você fica ciente da performance em tempo real, de modo que os problemas aparecem quando acontecem, e não depois das reclamações dos usuários. A escala vertical adiciona capacidade a um recurso, mas não notifica ninguém; um service-level agreement documenta garantias de uptime em vez de reportar performance ao vivo; e a auditoria baseada em nuvem verifica recursos contra baselines de conformidade — capacidade de governança — e não monitora métricas em tempo real.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-058",
    domainCode: 1,
    stem: `A nongovernmental organization runs its fundraising platform with a two-person IT team. They provision new environments from preconfigured templates, keep an eye on resource health in the web portal, and automate recurring cleanup tasks with a command-line script. Which cloud benefit does this working style illustrate?`,
    options: [
      "Manageability, because resources can be managed through the portal, CLI, and automation",
      "Scalability, because resources are automatically added or removed as the demand changes",
      "Reliability, because the workload recovers automatically from regional service failures",
      "Cost predictability, because future spending is forecast from historical usage patterns",
    ],
    correctIndex: 0,
    explanationEn: `Manageability in the cloud covers both how you manage your environment — through a web portal, the command line, APIs, or PowerShell — and what the cloud can manage for you, such as deploying from templates, monitoring health, and running automated processes. The scenario describes exactly that combination of tools and automation. Scalability would involve adding or removing resources with demand, reliability would involve recovering from failures, and cost predictability would involve forecasting spend — none of which the described workflow is about.`,
    explanationPt: `A gerenciabilidade na nuvem cobre tanto como você gerencia seu ambiente — por um portal web, linha de comando, APIs ou PowerShell — quanto o que a nuvem pode gerenciar por você, como implantar a partir de templates, monitorar a saúde e executar processos automatizados. O cenário descreve exatamente essa combinação de ferramentas e automação. Escalabilidade envolveria adicionar ou remover recursos conforme a demanda, confiabilidade envolveria recuperação de falhas e previsibilidade de custo envolveria estimar gastos — nada disso é o foco do fluxo de trabalho descrito.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-059",
    domainCode: 1,
    stem: `An airline's cloud engineering team is reviewing the two aspects of manageability described in Azure fundamentals training. The team lead asks each engineer to classify a capability as management of the cloud or management in the cloud. Which capability is correctly classified as management in the cloud?`,
    options: [
      "Automatically scaling resource deployment based on need",
      "Automatically replacing failing resources detected by health monitoring",
      "Managing the cloud environment and its resources by using PowerShell",
      "Receiving automatic alerts on resources based on configured metrics",
    ],
    correctIndex: 2,
    explanationEn: `Management in the cloud refers to how you're able to manage your cloud environment and resources: through a web portal, using a command-line interface, using APIs, or using PowerShell. Management of the cloud refers to managing your cloud resources themselves — capabilities such as automatically scaling resource deployment based on need, deploying resources from preconfigured templates, monitoring health and automatically replacing failing resources, and receiving automatic alerts based on configured metrics. Only managing the environment through PowerShell describes the interfaces you use, making it the management in the cloud capability.`,
    explanationPt: `O management in the cloud refere-se a como você gerencia seu ambiente e seus recursos de nuvem: por um portal web, usando uma interface de linha de comando, usando APIs ou usando PowerShell. Já o management of the cloud refere-se ao gerenciamento dos seus recursos de nuvem em si — capacidades como escalar automaticamente a implantação de recursos conforme a necessidade, implantar recursos a partir de templates preconfigurados, monitorar a saúde e substituir automaticamente recursos com falha, e receber alertas automáticos com base em métricas configuradas. Somente o gerenciamento do ambiente via PowerShell descreve as interfaces que você usa, sendo portanto a capacidade de management in the cloud.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-060",
    domainCode: 1,
    stem: `A health technology company's quality assurance team builds and tears down test environments every day. Engineers currently create each environment by clicking through portal settings, and the hand-built environments drift apart over time. The QA lead wants repeatable deployments with no manual configuration. Which manageability capability should the team use?`,
    options: [
      "Automatic alerts based on configured resource metrics",
      "Automatic replacement of resources that begin to fail",
      "Manual configuration through the web portal, performed by senior engineers",
      "Deploying resources from a preconfigured template, removing manual configuration",
    ],
    correctIndex: 3,
    explanationEn: `Management of the cloud includes deploying resources based on a preconfigured template, removing the need for manual configuration — templates make each environment identical and repeatable, which eliminates both the click-through effort and the drift between hand-built environments. Automatic alerts and automatic replacement of failing resources are monitoring and health capabilities, not deployment capabilities, and performing the same manual configuration more carefully is precisely the effort the team wants to remove.`,
    explanationPt: `O management of the cloud inclui a implantação de recursos com base em um template preconfigurado, removendo a necessidade de configuração manual — os templates tornam cada ambiente idêntico e repetível, eliminando tanto o esforço de cliques quanto a divergência entre ambientes montados à mão. Os alertas automáticos e a substituição automática de recursos com falha são capacidades de monitoramento e saúde, não de implantação; e executar a mesma configuração manual com mais cuidado é exatamente o esforço que a equipe quer eliminar.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-benefits-use-cloud-services/5-manageability-cloud",
    referenceTitle: "Describe the benefits of manageability in the cloud — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-061",
    domainCode: 1,
    stem: `A home-improvement retailer moves its inventory workloads to Azure on virtual machines. Its own IT staff installs and patches the guest operating systems, defines the virtual network layout, and configures the databases. The provider supplies the compute hardware, the connection to the internet, and the security of the physical facility.
  Which layers remain the cloud provider's responsibility in this arrangement?`,
    options: [
      "Installing, configuring, and patching the guest operating systems",
      "Designing the virtual network layout and configuring the databases",
      "The physical hardware, the internet connection, and physical security",
      "Licensing and patching the middleware and the development tools",
    ],
    correctIndex: 2,
    explanationEn: `In infrastructure as a service (IaaS), the provider maintains the hardware, the network connection to the internet, and physical security; the customer manages essentially everything above that. Installing, patching, and configuring operating systems, setting up the virtual networking, and configuring databases and storage all remain with the retailer's IT staff — with IaaS you are effectively renting hardware in a provider datacenter and deciding what to run on it.
  Middleware and development tools also sit on the customer's side in IaaS; they move to the provider only in platform as a service (PaaS).`,
    explanationPt: `No modelo de infraestrutura como serviço (IaaS), o provedor mantém o hardware, a conectividade com a internet e a segurança física; o cliente gerencia praticamente tudo que está acima disso. Instalar, corrigir e configurar sistemas operacionais, definir a rede virtual e configurar bancos de dados e armazenamento continuam sendo da equipe de TI do varejista — em IaaS você está essencialmente alugando hardware num datacenter do provedor e decidindo o que rodar nele.
  Middleware e ferramentas de desenvolvimento também ficam do lado do cliente em IaaS; eles passam para o provedor apenas no modelo de plataforma como serviço (PaaS).`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-062",
    domainCode: 1,
    stem: `A junior cloud analyst is writing study notes about the three cloud service models for her team's onboarding guide. She wants one sentence that correctly captures what infrastructure as a service (IaaS) offers.
  Which statement should she write?`,
    options: [
      "On-demand access to compute, storage, and networking, with the customer managing operating systems, applications, and data",
      "A fully developed application that the customer only configures and uses, while the provider runs everything else",
      "A managed platform where the provider handles operating systems and middleware so developers can focus on code",
      "On-demand access to compute, storage, and networking, with the provider managing operating systems and databases",
    ],
    correctIndex: 0,
    explanationEn: `IaaS is the most flexible category of cloud services: the provider supplies on-demand infrastructure — servers, storage, and networking — while the customer installs, configures, and maintains everything above the hardware, chiefly the operating systems, applications, and data. The pairing of on-demand infrastructure with customer-managed operating systems states exactly that division.
  A fully developed application that is only configured and used describes software as a service (SaaS); a managed platform where the provider handles operating systems and middleware describes platform as a service (PaaS); and pairing on-demand infrastructure with provider-managed operating systems mixes the IaaS offering with a PaaS-style responsibility split, which contradicts the IaaS model.`,
    explanationPt: `O IaaS é a categoria mais flexível de serviços de nuvem: o provedor fornece infraestrutura sob demanda — servidores, armazenamento e rede — enquanto o cliente instala, configura e mantém tudo que está acima do hardware, principalmente sistemas operacionais, aplicações e dados. A combinação de infraestrutura sob demanda com sistemas operacionais gerenciados pelo cliente enuncia exatamente essa divisão.
  Uma aplicação totalmente desenvolvida que apenas se configura e usa descreve o software como serviço (SaaS); uma plataforma gerenciada em que o provedor cuida de sistemas operacionais e middleware descreve a plataforma como serviço (PaaS); e combinar infraestrutura sob demanda com sistemas operacionais gerenciados pelo provedor mistura a oferta do IaaS com uma divisão de responsabilidades estilo PaaS, contradizendo o modelo IaaS.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-063",
    domainCode: 1,
    stem: `A regional hospital runs its patient-scheduling workloads on Azure virtual machines under the IaaS model. During a compliance review, the auditors want to confirm which security-related tasks stay with the hospital rather than with the cloud provider.
  Which set of tasks remains the hospital's responsibility?`,
    options: [
      "Patching guest operating systems, managing physical security at the datacenter, and configuring virtual networks",
      "Patching guest operating systems, configuring virtual networks, and hardening the scheduling applications",
      "Maintaining internet connectivity, patching guest operating systems, and managing storage hardware",
      "Patching guest operating systems, updating middleware, and managing the physical server hardware",
    ],
    correctIndex: 1,
    explanationEn: `Under IaaS, the provider's duties stop at the physical layer: hardware, network connectivity to the internet, and physical security. Everything above it is the customer's, so the hospital keeps patching the guest operating systems, configuring the virtual networks its virtual machines sit on, and hardening the scheduling applications it runs — the largest-operational-responsibility side of IaaS's flexibility.
  The other sets each smuggle in a provider duty: physical security at the datacenter, internet connectivity, storage hardware, and physical servers are maintained by the provider, so no set that includes one of them can be entirely the hospital's responsibility.`,
    explanationPt: `No IaaS, as obrigações do provedor param na camada física: hardware, conectividade com a internet e segurança física. Tudo que está acima é do cliente, de modo que o hospital continua corrigindo os sistemas operacionais, configurando as redes virtuais onde suas máquinas virtuais estão e protegendo as aplicações de agendamento que executa — o lado de maior responsabilidade operacional da flexibilidade do IaaS.
  Os demais conjuntos contrabandeiam uma obrigação do provedor: segurança física do datacenter, conectividade com a internet, hardware de armazenamento e servidores físicos são mantidos pelo provedor, portanto nenhum conjunto que os inclua pode ser integralmente responsabilidade do hospital.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-064",
    domainCode: 1,
    stem: `A freight company rehosted its route-planning application from its own datacenter onto Azure virtual machines. The operations director is drafting a memo about what this move to IaaS means for the team's day-to-day work.
  Which statement best describes the trade-off the team accepted?`,
    options: [
      "It gained the most control over the stack of any model, while offloading operating system patching to the provider",
      "It reduced operational work to the minimum possible, while still keeping control of the operating systems",
      "It transferred application maintenance to the provider, while keeping control of the physical hardware",
      "It gained the most control over the stack of any model, while taking on the largest share of operational work",
    ],
    correctIndex: 3,
    explanationEn: `IaaS provides the maximum amount of control over cloud resources of the three service models, and that control is paid for with the largest operational responsibility: the team still installs, patches, and configures the operating systems and everything above them. That pairing of maximum flexibility with maximum day-to-day work is the trade-off the memo should state.
  The other claims each break the model: operating system patching never moves to the provider in IaaS; reducing operational work to the minimum is the SaaS profile, which gives up exactly that control; and in every cloud model the physical hardware belongs to the provider, while in IaaS application maintenance stays with the customer.`,
    explanationPt: `O IaaS fornece a quantidade máxima de controle sobre os recursos de nuvem entre os três modelos de serviço, e esse controle é pago com a maior responsabilidade operacional: a equipe continua instalando, corrigindo e configurando os sistemas operacionais e tudo que está acima deles. Esse binômio de máxima flexibilidade com máximo trabalho diário é o trade-off que o memorando deve registrar.
  As demais afirmações violam o modelo: a correção de sistemas operacionais nunca passa para o provedor no IaaS; reduzir o trabalho operacional ao mínimo é o perfil do SaaS, que abre mão justamente desse controle; e em qualquer modelo de nuvem o hardware físico pertence ao provedor, enquanto no IaaS a manutenção da aplicação continua com o cliente.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-065",
    domainCode: 1,
    stem: `An architecture firm has always bought and housed its own rendering servers, which sit idle between project deadlines. The partners want to stop owning physical hardware altogether, but they insist on keeping every decision about what runs on it: which operating systems, drivers, and rendering software to use, and when to update them.
  What does the firm get under the infrastructure as a service (IaaS) model?`,
    options: [
      "The provider owns the render hardware and also installs, patches, and updates the operating systems and rendering software on the firm's behalf",
      "The firm keeps buying its render servers up front, and the provider merely houses and guards them between projects in its datacenter",
      "The provider owns and maintains the hardware; what the firm runs on it — operating systems, drivers, and software — is up to the firm",
      "The provider owns everything below the rendering application, and the firm only adjusts settings inside the application",
    ],
    correctIndex: 2,
    explanationEn: `Under IaaS, you're essentially renting the hardware in a cloud datacenter, but what you do with that hardware is up to you. The provider owns and maintains the hardware, network connectivity, and physical security; the firm keeps every decision above the hardware — which operating systems, drivers, and rendering software to run. No purchase, yet full say over the software stack.
  The other options break the split. Operating systems and rendering software installed and patched by the provider describe platform as a service; a provider that owns everything below the application leaves the firm only application settings. In IaaS, those layers stay with the customer. And continuing to buy servers up front, with the provider merely housing them, keeps the ownership and the idle capacity the firm wanted to shed.`,
    explanationPt: `No IaaS, você está essencialmente alugando o hardware num datacenter de nuvem, mas o que você faz com esse hardware é decisão sua. O provedor é dono do hardware e o mantém, junto com a conectividade e a segurança física; o escritório mantém toda decisão acima do hardware: quais sistemas operacionais, drivers e software de rendering rodar. Sem compra, com palavra final sobre a pilha de software.
  As demais opções quebram a divisão. Sistemas operacionais e software de rendering instalados e corrigidos pelo provedor descrevem o platform as a service; um provedor dono de tudo abaixo da aplicação deixa ao escritório só as configurações da aplicação. No IaaS, essas camadas ficam com o cliente. E continuar comprando servidores antecipadamente, com o provedor apenas os abrigando, mantém a propriedade e a capacidade ociosa que o escritório queria eliminar.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-066",
    domainCode: 1,
    stem: `An agritech startup is choosing how to host its new field-analytics web application. The option it prefers bundles the operating system, middleware, and development tools, all maintained by the provider; the startup would supply only its application code, data, and access configuration.
  Which service model does this option represent?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Platform as a service (PaaS)",
      "Software as a service (SaaS)",
      "A hybrid cloud deployment",
    ],
    correctIndex: 1,
    explanationEn: `The offering described is a managed platform: the provider maintains the physical infrastructure plus the operating systems, middleware, and development tools, while the customer brings the application code, data, and access controls. That is the definition of platform as a service (PaaS) — a middle ground between renting raw infrastructure (IaaS) and using a complete, ready-made application (SaaS).
  It is not IaaS, because in IaaS the startup would patch the operating systems itself; it is not SaaS, because the startup still develops and deploys its own application; and a hybrid cloud is a deployment model that mixes public and private environments, not a category of service model.`,
    explanationPt: `A opção descrita é uma plataforma gerenciada: o provedor mantém a infraestrutura física mais os sistemas operacionais, o middleware e as ferramentas de desenvolvimento, enquanto o cliente traz o código da aplicação, os dados e o controle de acesso. Essa é a definição de plataforma como serviço (PaaS) — um meio-termo entre alugar infraestrutura bruta (IaaS) e usar uma aplicação completa e pronta (SaaS).
  Não é IaaS, porque no IaaS a startup corrigiria os próprios sistemas operacionais; não é SaaS, porque a startup ainda desenvolve e implanta a própria aplicação; e nuvem híbrida é um modelo de implantação que mistura ambientes públicos e privados, não uma categoria de modelo de serviço.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-067",
    domainCode: 1,
    stem: `A smart-home device maker runs its product-portal application in a PaaS environment. A newly hired engineer asks who takes care of operating system and database patching now that the company no longer manages any servers.
  What is the correct answer?`,
    options: [
      "The company patches them, because every layer above the hypervisor belongs to the customer",
      "The provider patches the databases, while the company patches the operating systems",
      "There is no operating system to patch; PaaS runs the application directly on the provider's hardware",
      "The provider handles licensing and patching for operating systems and databases as part of the platform",
    ],
    correctIndex: 3,
    explanationEn: `In a PaaS scenario, you don't have to worry about the licensing or patching for operating systems and databases: the provider maintains the platform — physical infrastructure, operating systems, middleware, and managed runtimes — and the customer focuses on application code, data, and access controls.
  The claim that patching reverts to the customer misstates the model; that happens in IaaS, where the customer owns everything above the hypervisor. There is also no split in which the provider patches only the databases — the provider handles both layers. And a PaaS offering still runs on real operating systems that the provider keeps updated; they do not vanish just because the customer never sees them.`,
    explanationPt: `Num cenário de PaaS, você não precisa se preocupar com licenciamento nem correção (patching) de sistemas operacionais e bancos de dados: o provedor mantém a plataforma — infraestrutura física, sistemas operacionais, middleware e runtimes gerenciados — e o cliente se concentra no código da aplicação, nos dados e no controle de acesso.
  Dizer que o patching volta para o cliente deturpa o modelo; isso acontece no IaaS, onde o cliente é dono de tudo acima do hipervisor. Também não há divisão em que o provedor corrige só os bancos de dados — o provedor cuida das duas camadas. E uma oferta de PaaS ainda roda sobre sistemas operacionais reais que o provedor mantém atualizados; eles não desaparecem só porque o cliente nunca os vê.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-068",
    domainCode: 1,
    stem: `A streaming-media company builds its internal analytics dashboard on a PaaS platform. The engineering manager is writing role descriptions and wants to state what the team must concentrate on, as opposed to what the provider handles.
  Which set of activities represents the customer's primary focus in PaaS?`,
    options: [
      "Writing application code, governing data, and managing access controls",
      "Patching operating systems, maintaining middleware, and updating managed runtimes",
      "Running the physical infrastructure, the internet connectivity, and the physical security",
      "Writing application code, patching operating systems, and running the physical infrastructure",
    ],
    correctIndex: 0,
    explanationEn: `In PaaS, the provider manages the physical infrastructure and the platform components — operating systems, middleware, and managed runtimes — so the customer's effort concentrates on the application itself: writing and updating the code, governing the data it produces, and controlling who can access it. Depending on the service configuration, some networking and application security settings are shared between the parties.
  A set built on patching operating systems, maintaining middleware, or running physical infrastructure describes the provider's side of the split; and a set that pairs application code with operating system patching and physical infrastructure blends the customer's real focus with layers that belong to the provider in PaaS.`,
    explanationPt: `No PaaS, o provedor gerencia a infraestrutura física e os componentes de plataforma — sistemas operacionais, middleware e runtimes gerenciados — de modo que o esforço do cliente se concentra na própria aplicação: escrever e atualizar o código, governar os dados que ela produz e controlar quem pode acessá-la. Dependendo da configuração do serviço, algumas definições de rede e de segurança da aplicação são compartilhadas entre as partes.
  Um conjunto construído sobre correção de sistemas operacionais, manutenção de middleware ou operação da infraestrutura física descreve o lado do provedor na divisão; e um conjunto que combina código da aplicação com correção de sistema operacional e infraestrutura física mistura o foco real do cliente com camadas que pertencem ao provedor no PaaS.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-069",
    domainCode: 1,
    stem: `A software house is under pressure to shorten delivery time for a new customer portal. Its lead developer notes that on the PaaS platform under evaluation, scalability, high availability, and multitenant capability are provided as built-in features of the platform.
  What does this mean for the development team's work?`,
    options: [
      "Developers write no application code at all; they only assemble built-in components into a product",
      "Developers must still build scalability, high availability, and multitenancy into the application themselves",
      "Developers write less code to deliver those capabilities, because the platform already supplies them",
      "Developers must move the application onto virtual machines that they patch and maintain themselves",
    ],
    correctIndex: 2,
    explanationEn: `PaaS is well suited to providing a complete development environment without the headache of maintaining all the development infrastructure. Because the platform already includes features such as scalability, high availability, and multitenant capability, the amount of coding the developers must do shrinks: they consume those capabilities from the platform instead of implementing them.
  The team still writes real application code — built-in components reduce the work, they do not eliminate it — so claiming that developers write nothing and merely assemble components overstates the model. Saying they must build those features into the application themselves inverts the benefit; and moving the application onto self-patched virtual machines describes IaaS, where the team would indeed maintain its own machines.`,
    explanationPt: `O PaaS é adequado para fornecer um ambiente de desenvolvimento completo sem a dor de cabeça de manter toda a infraestrutura de desenvolvimento. Como a plataforma já inclui recursos como escalabilidade, alta disponibilidade e multitenancy, a quantidade de código que os desenvolvedores precisam escrever diminui: eles consomem essas capacidades da plataforma em vez de implementá-las.
  A equipe ainda escreve código de aplicação de verdade — componentes integrados reduzem o trabalho, não o eliminam — portanto dizer que os desenvolvedores não escrevem nada e apenas montam componentes exagera o modelo. Afirmar que eles precisariam construir esses recursos na própria aplicação inverte o benefício; e mover a aplicação para máquinas virtuais corrigidas por eles mesmos descreve o IaaS, onde a equipe de fato manteria as próprias máquinas.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-070",
    domainCode: 1,
    stem: `An online marketplace currently hosts its storefront on Azure virtual machines, and its own staff patches the operating systems and maintains the runtime. The CTO plans to rehost the storefront on a PaaS offering instead, without changing the application itself.
  Which responsibility moves to the provider as a result of this change?`,
    options: [
      "Protecting the application's data and managing access to it",
      "Patching operating systems and maintaining the middleware and runtime",
      "Writing, testing, and updating the application code",
      "Paying for the resources that the workload consumes",
    ],
    correctIndex: 1,
    explanationEn: `Moving from IaaS to PaaS shifts the platform boundary upward: in PaaS the provider maintains the operating systems, middleware, and managed runtimes — including their licensing and patching — so those tasks stop being the staff's work. In a PaaS scenario you don't have to worry about the licensing or patching for operating systems and databases.
  What does not shift: the marketplace keeps writing, testing, and updating its application code, keeps protecting its data and the access to it, and keeps paying for the resources the workload consumes. Those duties belong to the customer in every service model; only the platform layers move to the provider.`,
    explanationPt: `Migrar de IaaS para PaaS desloca a fronteira da plataforma para cima: no PaaS o provedor mantém sistemas operacionais, middleware e runtimes gerenciados — inclusive o licenciamento e a correção — então essas tarefas deixam de ser trabalho da equipe. Num cenário de PaaS você não precisa se preocupar com licenciamento ou correção de sistemas operacionais e bancos de dados.
  O que não muda: o marketplace continua escrevendo, testando e atualizando o código da aplicação, continua protegendo seus dados e o acesso a eles e continua pagando pelos recursos que a carga consome. Essas obrigações são do cliente em qualquer modelo de serviço; apenas as camadas de plataforma passam para o provedor.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-071",
    domainCode: 1,
    stem: `A dental clinic with no technical staff needs appointment-scheduling and patient-communication software. A vendor offers a complete application delivered over the internet: the clinic just creates user accounts, adjusts settings, and starts using it, while the vendor runs everything else.
  Which service model is the clinic adopting?`,
    options: [
      "Software as a service (SaaS)",
      "Infrastructure as a service (IaaS)",
      "Platform as a service (PaaS)",
      "Serverless computing (event-driven execution)",
    ],
    correctIndex: 0,
    explanationEn: `The clinic is using a fully developed application that the vendor hosts, updates, and makes available over the internet; the customer only configures it and manages accounts and data. That is software as a service (SaaS) — the most complete cloud service model from a product perspective, the easiest to get up and running, and the one that requires the least technical knowledge to fully employ.
  It is not IaaS, which would leave the clinic configuring rented infrastructure; it is not PaaS, because the clinic develops nothing on a platform; and serverless computing is a way of running code fragments triggered by events, not a ready-made business application for end users.`,
    explanationPt: `A clínica está usando uma aplicação totalmente desenvolvida que o fornecedor hospeda, atualiza e disponibiliza pela internet; o cliente apenas a configura e gerencia contas e dados. Isso é software como serviço (SaaS) — o modelo de serviço de nuvem mais completo na perspectiva de produto, o mais fácil de colocar em funcionamento e o que exige menos conhecimento técnico para usar plenamente.
  Não é IaaS, que deixaria a clínica configurando infraestrutura alugada; não é PaaS, porque a clínica não desenvolve nada sobre uma plataforma; e a computação sem servidor é uma forma de executar fragmentos de código disparados por eventos, não uma aplicação de negócio pronta para usuários finais.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-072",
    domainCode: 1,
    stem: `A small law office must deploy a client-document management tool quickly. It has no IT staff, and the partners have agreed to work with the vendor's standard feature set rather than request changes to the product.
  Which statement about the software as a service (SaaS) model matches this situation?`,
    options: [
      "SaaS is the most flexible of the three models, so the office can modify the underlying platform",
      "SaaS demands the most technical expertise of the three models to operate",
      "SaaS is the least flexible model, but it is the easiest to get up and running",
      "SaaS requires the customer to develop the application on a provider-managed framework",
    ],
    correctIndex: 2,
    explanationEn: `The SaaS model may be the least flexible of the three service models, but it is also the easiest to get up and running, and it requires the least amount of technical knowledge to fully employ. That is exactly what an office with no IT staff and no appetite for customization needs: it accepts the vendor's standard features in exchange for near-zero operational work.
  Claims that SaaS offers maximum flexibility or demands the most technical expertise invert the model's real profile — maximum flexibility belongs to IaaS, and heavy technical demand is not a SaaS trait. And developing an application on a provider-managed framework describes platform as a service (PaaS), not SaaS.`,
    explanationPt: `O modelo SaaS pode ser o menos flexível dos três modelos de serviço, mas também é o mais fácil de colocar em funcionamento e o que exige menos conhecimento técnico para usar plenamente. Isso é exatamente o que um escritório sem equipe de TI e sem vontade de personalizar precisa: aceita os recursos padrão do fornecedor em troca de trabalho operacional quase zero.
  Afirmar que o SaaS oferece flexibilidade máxima ou exige a maior perícia técnica inverte o perfil real do modelo — flexibilidade máxima é do IaaS, e exigência técnica pesada não é característica do SaaS. E desenvolver uma aplicação sobre uma estrutura gerenciada pelo provedor descreve a plataforma como serviço (PaaS), não o SaaS.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-073",
    domainCode: 1,
    stem: `A university has adopted a SaaS collaboration platform for its administrative departments. The IT director is updating the operating handbook and wants to list what the university still needs to manage now that the platform is run by the vendor.
  Which tasks remain primarily with the university?`,
    options: [
      "Infrastructure patching, application updates, and overall service availability",
      "Data governance, identity and access settings, and device posture",
      "Operating system licensing, database patching, and ongoing server maintenance",
      "Data governance, operating system patching, and physical infrastructure",
    ],
    correctIndex: 1,
    explanationEn: `In SaaS, the provider manages almost the entire application stack — infrastructure, platform, and application maintenance — so the customer's remaining scope is narrow and specific: primarily its data, its identity and access settings, and the posture of the devices that reach the service. A team using a SaaS collaboration platform focuses on user onboarding, access controls, and data governance, while the provider handles infrastructure patching, application updates, and availability.
  Infrastructure patching, updates, and availability are provider duties in SaaS, as are operating system licensing and database patching; and a set that mixes data governance with operating system patching and physical infrastructure pairs the one genuinely retained duty with layers that belong to the provider.`,
    explanationPt: `No SaaS, o provedor gerencia quase toda a pilha da aplicação — infraestrutura, plataforma e manutenção da aplicação — de modo que o escopo restante do cliente é estreito: basicamente seus dados, suas definições de identidade e acesso e a postura dos dispositivos que acessam o serviço. Uma equipe que usa uma plataforma de colaboração SaaS se ocupa do onboarding, dos controles de acesso e da governança de dados, enquanto o provedor cuida de correções, atualizações e disponibilidade.
  Correção de infraestrutura, atualizações e disponibilidade são obrigações do provedor no SaaS, assim como licenciamento de sistema operacional e correção de banco de dados; e o conjunto que mistura governança de dados com correção de SO e infraestrutura física combina a única obrigação retida com camadas do provedor.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-074",
    domainCode: 1,
    stem: `A hotel group is evaluating a SaaS property-management application. During the demo, the operations manager notices that the product supports only limited configuration options and cannot be reshaped around the group's older internal processes.
  Which trade-off should the manager weigh before adopting it?`,
    options: [
      "The most management effort of the three models, in exchange for the most control over the platform",
      "The most flexibility of the three models, in exchange for the customer patching the operating systems",
      "No management effort at all, since even data protection passes to the provider",
      "The least management effort of the three models, in exchange for the least flexibility among them",
    ],
    correctIndex: 3,
    explanationEn: `SaaS has the lowest operational overhead for customers: the provider runs the application, keeps it updated, and keeps it available. Its price is flexibility — SaaS is the least flexible of the three models, because the customer uses the product as the vendor ships it, with configuration limited to what the product exposes. That is precisely the trade-off the manager is observing in the demo.
  Profiles built on maximum management effort or maximum flexibility describe IaaS, not SaaS. And "no management effort at all" overstates the model: under shared responsibility, the customer keeps protecting its own data and managing identities and access, so that level of delegation is never part of the deal.`,
    explanationPt: `O SaaS tem a menor sobrecarga operacional para os clientes: o provedor executa a aplicação, mantém-na atualizada e a mantém disponível. Seu preço é a flexibilidade — o SaaS é o menos flexível dos três modelos, porque o cliente usa o produto como o fornecedor o entrega, com configuração limitada ao que o produto expõe. Esse é exatamente o trade-off que o gerente observa na demonstração.
  Perfis construídos sobre máximo esforço de gerenciamento ou máxima flexibilidade descrevem o IaaS, não o SaaS. E "nenhum esforço de gerenciamento" exagera o modelo: sob responsabilidade compartilhada, o cliente continua protegendo os próprios dados e gerenciando identidades e acesso, portanto esse nível de delegação nunca faz parte do acordo.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-075",
    domainCode: 1,
    stem: `A municipal government is rolling out a SaaS records-management application across its departments. The records director asks how the application will be kept current once it is live, given that no one at the city installs or maintains any software.
  What is accurate about how the application is kept current?`,
    options: [
      "The vendor keeps it current: feature updates and security improvements are applied automatically, and departments always use the latest version",
      "The city's records team must schedule and install each feature update and every security fix during its own maintenance windows",
      "The vendor maintains the infrastructure underneath, while the city's records team updates the application's features itself",
      "The application stays at the version first deployed, so later security fixes become the city's own projects",
    ],
    correctIndex: 0,
    explanationEn: `In SaaS, the provider manages the application stack, including application updates: the product is kept current by the vendor, with feature updates and security improvements applied automatically, so the customer always uses the latest version without installing or maintaining anything.
  The other options misstate the model. Scheduling and installing updates in the city's own maintenance windows is customer-managed software — the profile of infrastructure as a service. A split in which the vendor handles only the infrastructure, while the city's team updates the application's features, leaves the product's evolution with the customer; in SaaS the provider handles the application's updates. And a version frozen at deployment contradicts the arrangement outright: security improvements arrive automatically, not as city projects.`,
    explanationPt: `No SaaS, o provedor gerencia a pilha da aplicação, incluindo as atualizações da aplicação: o produto é mantido atual pelo fornecedor, com atualizações de recursos e melhorias de segurança aplicadas automaticamente, de modo que o cliente usa sempre a versão mais recente sem instalar ou manter nada.
  As demais opções deturpam o modelo. Agendar e instalar atualizações em janelas de manutenção próprias é software gerenciado pelo cliente — o perfil do infrastructure as a service. Uma divisão em que o fornecedor cuida só da infraestrutura, enquanto a equipe da cidade atualiza os recursos da aplicação, deixa a evolução do produto com o cliente; no SaaS o provedor cuida das atualizações da aplicação. E uma versão congelada na implantação contradiz o arranjo de frente: melhorias de segurança chegam automaticamente, não como projetos da cidade.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "HARD",
  },
  {
    key: "AZ1-076",
    domainCode: 1,
    stem: `A furniture manufacturer wants to move its legacy production-planning application to Azure. The application must run unchanged, on the same operating-system configuration it uses today, and the infrastructure team needs to keep managing everything from the operating system upward.
  Which cloud service type should the manufacturer choose?`,
    options: [
      "Platform as a service (PaaS)",
      "Software as a service (SaaS)",
      "Serverless computing (event-driven execution)",
      "Infrastructure as a service (IaaS)",
    ],
    correctIndex: 3,
    explanationEn: `This is the classic lift-and-shift migration: you set up cloud resources similar to your on-premises datacenter and then move your workloads onto the IaaS infrastructure. IaaS lets the team replicate the current operating-system configuration and keep complete control from the operating system upward, which is exactly what an unchanged legacy application requires.
  PaaS would remove the team's control of the operating system, which the requirement explicitly keeps; SaaS would mean replacing the application with a ready-made product rather than moving it; and serverless computing runs event-triggered code fragments on the provider's runtime, leaving no place for a custom operating-system configuration.`,
    explanationPt: `Este é o clássico caso de migração lift-and-shift: você monta recursos em nuvem semelhantes ao seu datacenter local e depois move as cargas para a infraestrutura de IaaS. O IaaS permite à equipe replicar a configuração atual de sistema operacional e manter controle total do SO para cima — exatamente o que uma aplicação legada inalterada exige.
  O PaaS removeria o controle da equipe sobre o sistema operacional, que o requisito mantém explicitamente; o SaaS significaria substituir a aplicação por um produto pronto, em vez de movê-la; e a computação sem servidor executa fragmentos de código disparados por eventos no runtime do provedor, sem espaço para uma configuração de SO personalizada.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-077",
    domainCode: 1,
    stem: `A fintech startup is building a new public web application. Its four-person engineering team wants a complete development environment in the cloud: they deploy their code and data while the provider maintains the operating systems, middleware, and development tools. No one can be spared for infrastructure work.
  Which cloud service type fits this requirement?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "A hybrid cloud deployment",
      "Software as a service (SaaS)",
      "Platform as a service (PaaS)",
    ],
    correctIndex: 3,
    explanationEn: `PaaS is well suited to providing a complete development environment without the headache of maintaining all the development infrastructure: the provider keeps the operating systems, middleware, and development tools current, and the team focuses on code, data, and access controls — a match for a startup with no infrastructure staff.
  IaaS would hand the four engineers the job of patching operating systems and running the platform themselves; SaaS would give them a finished application rather than a place to build their own; and a hybrid cloud is a deployment model that mixes public and private environments — a different axis from the service-type question being asked.`,
    explanationPt: `O PaaS é adequado para fornecer um ambiente de desenvolvimento completo sem a dor de cabeça de manter toda a infraestrutura de desenvolvimento: o provedor mantém sistemas operacionais, middleware e ferramentas de desenvolvimento atualizados, e a equipe se concentra em código, dados e controles de acesso — combinação adequada a uma startup sem pessoal de infraestrutura.
  O IaaS entregaria aos quatro engenheiros o trabalho de corrigir sistemas operacionais e operar a plataforma por conta própria; o SaaS lhes daria uma aplicação pronta, e não um lugar para construir a sua; e a nuvem híbrida é um modelo de implantação que mistura ambientes públicos e privados — um eixo diferente da pergunta sobre tipo de serviço.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-078",
    domainCode: 1,
    stem: `A 40-person insurance brokerage wants corporate email, calendars, and file sharing for everyone. It has no developers and no infrastructure team; the office manager just wants to create user accounts, set sharing policies, and have the service working the same week.
  Which cloud service type fits best?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Platform as a service (PaaS)",
      "Software as a service (SaaS)",
      "A private cloud deployment",
    ],
    correctIndex: 2,
    explanationEn: `Email and messaging, along with productivity applications, are textbook SaaS scenarios: the vendor runs the complete application, and the customer only configures it, creates accounts, and sets policies. SaaS is the easiest model to get up and running and requires the least technical knowledge, which matches a brokerage with no technical staff.
  IaaS would mean renting servers and running a mail system on them — work the brokerage cannot perform; PaaS would mean building an application on a managed platform, which nobody there is planning; and a private cloud is a deployment pattern for dedicated infrastructure, not a ready-made business service.`,
    explanationPt: `E-mail e mensageria, junto com aplicações de produtividade, são cenários clássicos de SaaS: o fornecedor executa a aplicação completa e o cliente apenas a configura, cria contas e define políticas. O SaaS é o modelo mais fácil de colocar em funcionamento e exige o menor conhecimento técnico — o que combina com uma corretora sem equipe técnica.
  O IaaS significaria alugar servidores e rodar um sistema de e-mail sobre eles — trabalho que a corretora não consegue executar; o PaaS significaria construir uma aplicação sobre uma plataforma gerenciada, o que ninguém lá planeja; e a nuvem privada é um padrão de implantação para infraestrutura dedicada, não um serviço de negócio pronto.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "EASY",
  },
  {
    key: "AZ1-079",
    domainCode: 1,
    stem: `A game studio needs short-lived test environments that exactly replicate an established production configuration: a specific operating-system image, custom drivers, and pinned software versions. Environments are created and torn down on demand, and the QA team requires complete control over what runs inside them.
  Which cloud service type meets this requirement?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Platform as a service (PaaS)",
      "Software as a service (SaaS)",
      "Serverless computing (event-driven execution)",
    ],
    correctIndex: 0,
    explanationEn: `Testing and development is a documented IaaS scenario when the requirement is to rapidly replicate established configurations while maintaining complete control: with IaaS the studio can start up or shut down environments on demand and still own the operating-system image, the drivers, and everything above the hardware.
  PaaS cannot replicate a custom operating-system image with specific drivers, because the platform manages the operating system; SaaS offers no environment to configure at all, only finished products; and serverless computing executes provider-managed code in response to events, leaving no room for pinned versions or operating-system-level control.`,
    explanationPt: `Teste e desenvolvimento é um cenário documentado de IaaS quando o requisito é replicar rapidamente configurações estabelecidas mantendo controle total: com IaaS o estúdio pode subir e desmontar ambientes sob demanda e ainda ser dono da imagem de sistema operacional, dos drivers e de tudo que está acima do hardware.
  O PaaS não consegue replicar uma imagem de SO personalizada com drivers específicos, porque a plataforma gerencia o sistema operacional; o SaaS não oferece ambiente algum para configurar, apenas produtos prontos; e a computação sem servidor executa código gerenciado pelo provedor a partir de eventos, sem espaço para versões fixadas ou controle em nível de sistema operacional.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-080",
    domainCode: 1,
    stem: `A utility company's data team wants to analyze and mine its operational data, find patterns, and predict demand to improve planning. Rather than building and maintaining the underlying infrastructure, the team wants to develop its analysis solutions on a managed platform that already provides analytics services and tools.
  Which cloud service type fits this scenario?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Software as a service (SaaS)",
      "A hybrid cloud deployment",
      "Platform as a service (PaaS)",
    ],
    correctIndex: 3,
    explanationEn: `Analytics or business intelligence is a documented PaaS scenario: tools provided as a service let teams analyze and mine data, find insights and patterns, and predict outcomes, while the provider maintains the platform those tools run on. The team builds its own analysis solutions but not the infrastructure beneath them — which is what developing on a managed platform means.
  IaaS would leave the team installing and patching the platform itself; SaaS would supply a finished application with no room to develop custom analysis; and a hybrid cloud is a deployment model that mixes public and private environments, not a service type for hosting the team's work.`,
    explanationPt: `Analytics ou business intelligence é um cenário documentado de PaaS: ferramentas fornecidas como serviço permitem às equipes analisar e minerar dados, descobrir padrões e prever resultados, enquanto o provedor mantém a plataforma em que essas ferramentas rodam. A equipe constrói suas próprias soluções de análise, mas não a infraestrutura por baixo delas — o que significa desenvolver sobre uma plataforma gerenciada.
  O IaaS deixaria a equipe instalando e corrigindo a própria plataforma; o SaaS forneceria uma aplicação pronta, sem espaço para desenvolver análises personalizadas; e a nuvem híbrida é um modelo de implantação que mistura ambientes públicos e privados, não um tipo de serviço para hospedar o trabalho da equipe.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/3-describe-platform-service/",
    referenceTitle: "Describe platform as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-081",
    domainCode: 1,
    stem: `A bank must host a proprietary risk engine whose vendor certifies it for exactly one legacy operating-system version, tuned with particular kernel settings. The certification was issued after an audit of that configuration, and it remains valid only while the bank's own platform team installs, configures, and tunes that operating system — if the provider managed it, the certified setup would be invalidated. The engine must keep running in Azure without being rewritten.
  Which cloud service type can meet this requirement?`,
    options: [
      "Platform as a service (PaaS)",
      "Infrastructure as a service (IaaS)",
      "Software as a service (SaaS)",
      "A hybrid cloud deployment",
    ],
    correctIndex: 1,
    explanationEn: `Only IaaS hands the operating system to the customer: the provider maintains the hardware, network connectivity, and physical security, and the bank's platform team installs, configures, and tunes the certified legacy operating system and its kernel settings itself — keeping the audited, certified configuration in the bank's own hands. IaaS provides the maximum amount of control over cloud resources, which is what a certified, operating-system-dependent workload demands.
  PaaS cannot host it: there the provider manages the operating system, so the certified setup could not be preserved under the vendor's rules. SaaS supplies finished applications, not an environment for the bank's own risk engine. And a hybrid cloud deployment is a deployment model that mixes public and private environments — it describes where workloads run, not who manages the operating system.`,
    explanationPt: `Só o IaaS entrega o sistema operacional ao cliente: o provedor mantém o hardware, a conectividade com a internet e a segurança física, e a própria equipe de plataforma do banco instala, configura e afina o sistema operacional legado certificado e suas definições de kernel — mantendo a configuração auditada e certificada nas mãos do banco. O IaaS fornece a quantidade máxima de controle sobre os recursos de nuvem, o que uma carga certificada e dependente de sistema operacional exige.
  O PaaS não consegue hospedá-la: ali o provedor gerencia o sistema operacional, de modo que a configuração certificada não poderia ser preservada sob as regras do fornecedor. O SaaS fornece aplicações prontas, não um ambiente para o risk engine do banco. E a nuvem híbrida é um modelo de implantação que mistura ambientes públicos e privados — descreve onde as cargas rodam, não quem gerencia o sistema operacional.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/2-describe-infrastructure-service/",
    referenceTitle: "Describe infrastructure as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-082",
    domainCode: 1,
    stem: `A news media company is launching a mobile app whose back end is a set of REST APIs. The engineering team wants to spend its time on the API code while the provider handles operating system and runtime management, including patching.
  Which cloud service type fits this requirement?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Software as a service (SaaS)",
      "Platform as a service (PaaS)",
      "A private cloud deployment",
    ],
    correctIndex: 2,
    explanationEn: `Hosting web applications, mobile back ends, and RESTful APIs without worrying about the underlying infrastructure is what a PaaS offering such as Azure App Service does: the provider runs the platform with automatic operating system and runtime management and patching, and the team ships code.
  IaaS would give the team virtual machines to patch and maintain, which it explicitly wants to avoid; SaaS would supply a finished application, not a place to develop the company's own APIs; and a private cloud is a deployment approach with dedicated infrastructure, not a service type that removes platform management.`,
    explanationPt: `Hospedar aplicações web, back ends móveis e APIs RESTful sem se preocupar com a infraestrutura subjacente é o que uma oferta de PaaS como o Azure App Service faz: o provedor opera a plataforma com gerenciamento e correção automáticos de sistema operacional e runtime, e a equipe entrega código.
  O IaaS daria à equipe máquinas virtuais para corrigir e manter, o que ela explicitamente quer evitar; o SaaS forneceria uma aplicação pronta, e não um lugar para desenvolver as APIs da empresa; e a nuvem privada é uma abordagem de implantação com infraestrutura dedicada, não um tipo de serviço que remove o gerenciamento de plataforma.`,
    referenceUrl: "https://learn.microsoft.com/en-us/azure/app-service/overview",
    referenceTitle: "App Service overview — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-083",
    domainCode: 1,
    stem: `A construction firm's finance department wants expense tracking and invoice approval for its site managers. Its processes follow standard accounting practices, no one on staff writes code, and the department wants a working product after only configuring categories and approval rules.
  Which cloud service type fits best?`,
    options: [
      "Software as a service (SaaS)",
      "Platform as a service (PaaS)",
      "Infrastructure as a service (IaaS)",
      "Serverless computing (event-driven execution)",
    ],
    correctIndex: 0,
    explanationEn: `Finance and expense tracking is a documented SaaS scenario: the department adopts a ready-made application, configures categories and approval rules, and uses it — no development, no infrastructure. SaaS fits standard processes that need no custom software, which is exactly the situation described.
  PaaS would require building an application on a managed platform, and no one there writes code; IaaS would mean renting servers and assembling the whole stack, far beyond the department's intent; and serverless computing is for running event-triggered code, not for adopting a finished business application.`,
    explanationPt: `Finanças e controle de despesas é um cenário documentado de SaaS: o departamento adota uma aplicação pronta, configura categorias e regras de aprovação e passa a usá-la — sem desenvolvimento e sem infraestrutura. O SaaS serve para processos padronizados que não exigem software sob medida, exatamente a situação descrita.
  O PaaS exigiria construir uma aplicação sobre uma plataforma gerenciada, e ninguém ali escreve código; o IaaS significaria alugar servidores e montar toda a pilha, muito além da intenção do departamento; e a computação sem servidor serve para executar código disparado por eventos, não para adotar uma aplicação de negócio pronta.`,
    referenceUrl: "https://learn.microsoft.com/en-us/training/modules/describe-cloud-service-types/4-describe-software-service/",
    referenceTitle: "Describe software as a service — Microsoft Learn",
    difficulty: "MEDIUM",
  },
  {
    key: "AZ1-084",
    domainCode: 1,
    stem: `A real-estate network has run its customer-relationship management (CRM) suite in its own datacenter for years; its small IT team spends much of each month patching the application, its databases, and the servers underneath. The board has approved replacing the suite with a vendor-delivered product: the vendor will host, run, update, and secure the application and everything beneath it, and the network's staff will only configure the product, manage user accounts, and govern its customer data. No one at the company will build or maintain any software for it.
  Which cloud service type should the network adopt for the CRM workload?`,
    options: [
      "Infrastructure as a service (IaaS)",
      "Software as a service (SaaS)",
      "A hybrid cloud deployment",
      "Platform as a service (PaaS)",
    ],
    correctIndex: 1,
    explanationEn: `A vendor-delivered product that the vendor hosts, runs, and updates — with the staff only configuring it, managing accounts, and governing its data — is the software as a service pattern: the provider manages the application stack, including infrastructure, platform, and application maintenance. Managing customer relationships with cloud-based CRM software is a documented SaaS use case.
  What the staff keeps is compatible with SaaS: customers keep their data and identities under shared responsibility, with no software to run. Infrastructure as a service would hand the network the servers, operating systems, and patching work it is shedding; platform as a service is for building custom applications; and a hybrid cloud is a deployment model mixing public and private environments — a different axis from adopting a ready-made product.`,
    explanationPt: `Um produto entregue pelo fornecedor, que o hospeda, executa e atualiza — com a equipe apenas configurando, gerenciando contas e governando os dados — é o padrão do software as a service: o provedor gerencia a pilha da aplicação, incluindo infraestrutura, plataforma e manutenção da aplicação. Gerenciar relacionamentos com clientes por meio de software de CRM na nuvem é um caso de uso documentado de SaaS.
  O que a equipe mantém é compatível com o SaaS: sob responsabilidade compartilhada, o cliente mantém seus dados e identidades, sem nenhum software para operar. O infrastructure as a service entregaria à rede os servidores, os sistemas operacionais e o trabalho de correção que ela está descartando; o platform as a service serve para construir aplicações personalizadas; e a nuvem híbrida é um modelo de implantação que mistura ambientes públicos e privados — um eixo diferente do de adotar um produto pronto.`,
    referenceUrl: "https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-are-iaas-paas-and-saas",
    referenceTitle: "What are IaaS, PaaS, and SaaS? — Microsoft Azure",
    difficulty: "HARD",
  },
  {
    key: "AZ1-085",
    domainCode: 1,
    stem: `A grocery chain's cloud architect presents a migration plan: rehost the legacy warehouse system unchanged, with the team keeping control of its operating system; build the new customer portal so developers deliver code while the provider maintains the platform; and give HR a ready-made payroll and expense product.
  Which assignment of cloud service types matches this plan?`,
    options: [
      "Warehouse: SaaS; portal: IaaS; HR: PaaS",
      "Warehouse: IaaS; portal: PaaS; HR: SaaS",
      "Warehouse: PaaS; portal: SaaS; HR: IaaS",
      "Warehouse: IaaS; portal: SaaS; HR: PaaS",
    ],
    correctIndex: 1,
    explanationEn: `The plan matches the three canonical use cases. Rehosting unchanged with control of the operating system is lift-and-shift, an IaaS scenario; having developers deliver code on a provider-maintained platform is the PaaS development scenario; and giving a department a ready-made product to configure and use is SaaS.
  The other assignments break the requirements. Mapping the warehouse to a finished product, the portal to raw infrastructure, and HR to a development platform misassigns every workload; so does sending the warehouse to a managed platform, the portal to a finished product, and HR to raw infrastructure. Keeping the warehouse on IaaS is right, but pairing the portal with a finished application leaves developers nothing to build on, and asking HR to develop on a platform contradicts a ready-made product.`,
    explanationPt: `O plano casa com os três casos de uso canônicos: rehospedar sem alterações, mantendo controle do sistema operacional, é lift-and-shift, cenário de IaaS; desenvolvedores entregando código sobre uma plataforma mantida pelo provedor é o cenário de desenvolvimento do PaaS; e um produto pronto para um departamento configurar e usar é SaaS.
  As demais atribuições quebram os requisitos. Mandar o armazém para um produto pronto, o portal para infraestrutura bruta e o RH para uma plataforma de desenvolvimento erra cada carga; idem com o armazém em plataforma gerenciada, o portal em produto pronto e o RH em infraestrutura bruta. Manter o armazém em IaaS está certo, mas casar o portal com uma aplicação pronta deixa os desenvolvedores sem nada para construir, e pedir que o RH desenvolva contraria um produto pronto.`,
    referenceUrl: "https://azure.microsoft.com/en-us/resources/cloud-computing-dictionary/what-are-iaas-paas-and-saas",
    referenceTitle: "What are IaaS, PaaS, and SaaS? — Microsoft Azure",
    difficulty: "HARD",
  },
];
