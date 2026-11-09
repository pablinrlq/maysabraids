import { brl, services } from "../lib/services";
import { instagramPost, site, whatsappLink } from "../lib/site";

type Work = { n: string; w: number; h: number; alt: string; tag: string; code: string };

const gallery: Work[] = [
  { n: "02", w: 1100, h: 1467, alt: "Tranças longas com cachos french curls, vistas de costas", tag: "French curls", code: "DceHvjOkfph" },
  { n: "05", w: 1100, h: 1467, alt: "Detalhe de tranças nagô com acabamento limpo", tag: "Tranças nagô", code: "DZptBckkT8O" },
  { n: "03", w: 1100, h: 1467, alt: "Tranças pretas com cachos soltas nas pontas", tag: "Cachos nas pontas", code: "DceHqWukXpT" },
  { n: "06", w: 1100, h: 1467, alt: "Coque de cabelo cacheado com tranças nagô na frente", tag: "Coque & nagô", code: "DXuXbERkdvE" },
  { n: "10", w: 1100, h: 1467, alt: "Trança lateral com fios metálicos e argolas", tag: "Detalhes & acessórios", code: "DV8zwreEU03" },
  { n: "13", w: 720, h: 720, alt: "Trança com desenho ondulado no topo da cabeça", tag: "Design autoral", code: "C-8oSiwScpA" },
  { n: "08", w: 1100, h: 1467, alt: "Tranças nagô em leque terminando em rabo de cavalo trançado", tag: "Nagô em leque", code: "DXUVo01EZom" },
  { n: "07", w: 1100, h: 1375, alt: "Coque cacheado alto com tranças nagô", tag: "Nagô com coque", code: "DEN5QxKSiAp" },
  { n: "12", w: 1100, h: 1371, alt: "Tranças nagô longas em perfil", tag: "Nagô longas", code: "DCcqh_NSvSM" },
  { n: "14", w: 1100, h: 1371, alt: "Tranças em espiral vistas de cima", tag: "Espiral", code: "C82OCBHO0KU" },
  { n: "11", w: 1100, h: 1375, alt: "Trança lateral com fios brancos em cabelo liso", tag: "Lateral com fios", code: "DDyEuoQOK6m" },
  { n: "15", w: 1100, h: 1459, alt: "Tranças nagô com mechas claras", tag: "Mechas", code: "DceHy5EkTsV" },
];

const groups = [
  { id: "simples", title: "Sem jumbo", text: "Feitas com o seu próprio cabelo." },
  { id: "jumbo", title: "Com jumbo", text: "Com cabelo sintético para volume e comprimento." },
] as const;

export default function Home() {
  return (
    <main>
      <header className="site-header">
        <a className="brand" href="#inicio" aria-label="Maysa Braids — início">
          <span>Maysa</span>
          <small>Braids · trancista</small>
        </a>
        <nav aria-label="Navegação principal">
          <a href="#portfolio">Trabalhos</a>
          <a href="#valores">Valores</a>
          <a href="#sobre">Sobre</a>
          <a className="nav-cta" href="/agendamento">Agendar horário</a>
        </nav>
      </header>

      <section className="hero" id="inicio">
        <div className="hero-copy">
          <p className="eyebrow">Trancista em {site.city}</p>
          <h1>Tranças que<br />elevam <em>a sua autoestima.</em></h1>
          <p className="hero-lead">Há 3 anos realço a sua beleza com tranças cheias de identidade, cuidado e elegância. Veja os dias livres e escolha o seu horário.</p>
          <div className="hero-actions">
            <a className="primary-button" href="/agendamento">Quero agendar</a>
            <a className="text-button" href="#portfolio">Ver trabalhos <span aria-hidden="true">↘</span></a>
          </div>
          <div className="trust-row" aria-label="Diferenciais"><span>3 anos de experiência</span><i /><span>Com e sem jumbo</span><i /><span>Atendimento com hora marcada</span></div>
        </div>

        <div className="hero-visual">
          <div className="hero-arch"><img src="/images/work-01.jpg" width={1100} height={1467} alt="Tranças longas com cachos e mechas loiras, feitas pela Maysa" fetchPriority="high" /></div>
          <div className="signature" aria-hidden="true">M</div>
          <a className="booking-peek" href="/agendamento">
            <span className="booking-icon" aria-hidden="true">✦</span>
            <div><small>AGENDA ABERTA ONLINE</small><strong>Veja os horários livres</strong></div>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <div className="marquee" aria-hidden="true"><span>TRANÇAS COM IDENTIDADE</span><i>✦</i><span>CUIDADO EM CADA DETALHE</span><i>✦</i><span>AUTOESTIMA EM PRIMEIRO LUGAR</span></div>

      <section className="portfolio section" id="portfolio">
        <div className="section-heading">
          <div><p className="eyebrow">Trabalhos</p><h2>Cada trança,<br /><em>uma assinatura.</em></h2></div>
          <p>Dos desenhos mais delicados às tranças longas cheias de movimento: um olhar de perto no que sai das mãos da Maysa.</p>
        </div>
        <div className="gallery">
          {gallery.map((item) => (
            <a className="gallery-item" href={instagramPost(item.code)} target="_blank" rel="noreferrer" key={item.n}>
              <figure>
                <img src={`/images/work-${item.n}.jpg`} width={item.w} height={item.h} alt={item.alt} loading="lazy" decoding="async" />
                <figcaption><span>{item.tag}</span><small>Ver no Instagram <b aria-hidden="true">↗</b></small></figcaption>
              </figure>
            </a>
          ))}
        </div>
        <a className="instagram-link" href={site.instagramUrl} target="_blank" rel="noreferrer">Mais inspirações em @{site.instagramHandle} <span aria-hidden="true">↗</span></a>
      </section>

      <section className="services section" id="valores">
        <div className="section-heading light">
          <div><p className="eyebrow">Tranças &amp; valores</p><h2>Escolha a sua<br /><em>trança.</em></h2></div>
          <p>Toque na trança para agendar. Se nenhuma for exatamente o que você quer, é só mandar uma foto no WhatsApp que a Maysa te passa o valor.</p>
        </div>
        <div className="price-grid">
          {groups.map((group) => (
            <article className="price-card" key={group.id}>
              <header><h3>{group.title}</h3><p>{group.text}</p></header>
              <ul>
                {services.filter((service) => service.group === group.id).map((service) => (
                  <li key={service.id}>
                    <a href={`/agendamento?servico=${service.id}`}>
                      <span>{service.title}</span><i aria-hidden="true" /><strong>{brl(service.price)}</strong><b aria-hidden="true">→</b>
                    </a>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <p className="price-note">📸 Quer outro modelo? <a href={whatsappLink("Olá, Maysa! Quero fazer uma trança que não está na tabela. Segue a foto de referência:")} target="_blank" rel="noreferrer">Envie uma foto no WhatsApp ↗</a></p>
      </section>

      <section className="experience section">
        <div className="experience-photo"><img src="/images/work-04.jpg" width={1100} height={1467} alt="Tranças nagô com cachos feitas no espaço de atendimento da Maysa" loading="lazy" /><span>Atendimento<br />com hora<br />marcada</span></div>
        <div className="experience-copy">
          <p className="eyebrow">Como funciona</p>
          <h2>Do clique<br /><em>à cadeira.</em></h2>
          <p>A Maysa mostra só os dias e horários que realmente estão livres. Você escolhe, reserva e finaliza a conversa pelo WhatsApp.</p>
          <ul><li><span>01</span><div><strong>Escolha a trança</strong><small>Veja a tabela de valores e selecione o modelo que você quer.</small></div></li><li><span>02</span><div><strong>Pegue um horário livre</strong><small>O calendário só habilita os dias em que a Maysa tem vaga.</small></div></li><li><span>03</span><div><strong>Confirme pelo WhatsApp</strong><small>Seu pedido já vai pronto para a conversa, com tudo o que a Maysa precisa.</small></div></li></ul>
        </div>
      </section>

      <section className="about section" id="sobre">
        <div className="about-copy"><p className="eyebrow">Sobre a trancista</p><h2>Prazer,<br />sou a <em>Maysa.</em></h2><p>Trancista em {site.city}, há 3 anos eu transformo cabelo em autoestima. Cada trança nasce de uma conversa, passa por muito cuidado com o couro cabeludo e termina com a cliente se vendo ainda mais bonita.</p><p>Por trás de cada trança existe dedicação, amor e muito cuidado. Sou apaixonada pelo que faço e por transformar cada detalhe em autoestima.</p><div className="about-stats"><div><strong>3 anos</strong><span>de experiência<br />com tranças</span></div><div><strong>100%</strong><span>atendimento com<br />hora marcada</span></div></div></div>
        <div className="about-photo"><div className="about-arch"><img src="/images/work-09.jpg" width={1100} height={1459} alt="Cliente de perfil com tranças nagô finalizadas pela Maysa" loading="lazy" /></div><span className="about-mark" aria-hidden="true">MB</span><div className="about-seal"><strong>M</strong><span>MAYSA<br />BRAIDS</span></div></div>
      </section>

      <section className="faq section">
        <div><p className="eyebrow">Antes de agendar</p><h2>Dúvidas<br /><em>frequentes.</em></h2></div>
        <div className="faq-list">
          <details><summary>O que significa “com jumbo” e “sem jumbo”?<span>+</span></summary><p>Jumbo é o cabelo sintético usado para dar comprimento e volume às tranças. As opções “sem jumbo” são feitas apenas com o seu cabelo; as “com jumbo” levam o material extra.</p></details>
          <details><summary>Como funciona a confirmação do horário?<span>+</span></summary><p>Você escolhe um dia livre e um horário no site e o horário fica reservado para você. Em seguida, a conversa segue pelo WhatsApp, onde a Maysa confirma tudo e passa as orientações.</p></details>
          <details><summary>Não achei a trança que eu quero. E agora?<span>+</span></summary><p>Sem problema! Mande uma foto de referência no WhatsApp e a Maysa te passa o valor e o tempo necessário.</p></details>
          <details><summary>Não tem nenhum dia livre no calendário.<span>+</span></summary><p>A agenda é aberta pela própria Maysa conforme a disponibilidade dela. Se estiver sem dias livres, chame no WhatsApp para saber quando abrem novas vagas.</p></details>
          <details><summary>Preciso chegar com o cabelo preparado?<span>+</span></summary><p>Na dúvida, avise no campo de observações ao agendar ou pergunte no WhatsApp. A Maysa orienta a preparação de acordo com a trança escolhida.</p></details>
        </div>
      </section>

      <section className="final-cta"><p className="eyebrow">Seu próximo visual favorito</p><h2>Vamos fazer a sua<br /><em>próxima trança?</em></h2><a className="primary-button" href="/agendamento">Ver horários livres</a><div className="final-script" aria-hidden="true">Maysa</div></section>

      <footer><a className="brand footer-brand" href="#inicio"><span>Maysa</span><small>Braids · trancista</small></a><div className="footer-links"><a href="#portfolio">Trabalhos</a><a href="#valores">Valores</a><a href="#sobre">Sobre</a><a href="/agendamento">Agendamento</a></div><div className="footer-social"><a href={site.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a><a href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp ↗</a><span>{site.whatsappDisplay}</span></div><p>© {new Date().getFullYear()} Maysa Braids · {site.city}. Todos os direitos reservados.</p></footer>

      <a className="floating-whatsapp" href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Falar com a Maysa no WhatsApp"><span>↗</span><b>WhatsApp</b></a>
    </main>
  );
}
