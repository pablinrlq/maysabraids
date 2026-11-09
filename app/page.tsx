import Image, { type StaticImageData } from "next/image";
import { jumboLabel, priceLabel, services } from "../lib/services";
import { instagramPost, site, whatsappLink } from "../lib/site";
import WhatsAppIcon from "./components/WhatsAppIcon";
import { braidPhotos } from "./components/braidPhotos";

import retrato from "../assets/photos/maysa-retrato.jpg";
import jornal from "../assets/photos/maysa-jornal.jpg";
import fotoJumbo from "../assets/photos/maysa-jumbo.jpg";
import fogo from "../assets/photos/maysa-fogo.jpg";
import experiencia from "../assets/photos/experiencia.jpg";
import t01 from "../assets/photos/trabalho-01.jpg";
import t02 from "../assets/photos/trabalho-02.jpg";
import t03 from "../assets/photos/trabalho-03.jpg";
import t04 from "../assets/photos/trabalho-04.jpg";
import t05 from "../assets/photos/trabalho-05.jpg";
import t06 from "../assets/photos/trabalho-06.jpg";
import t07 from "../assets/photos/trabalho-07.jpg";
import t08 from "../assets/photos/trabalho-08.jpg";
import t09 from "../assets/photos/trabalho-09.jpg";
import t10 from "../assets/photos/trabalho-10.jpg";
import t11 from "../assets/photos/trabalho-11.jpg";
import t12 from "../assets/photos/trabalho-12.jpg";

type Work = { src: StaticImageData; alt: string; tag: string; code: string };

const gallery: Work[] = [
  { src: t01, alt: "Tranças nagô com desenho de coração, mechas loiras e cachos", tag: "Nagô com cachos", code: "DdAUnAwkdjy" },
  { src: t02, alt: "Tranças longas com cachos loiros, vistas de costas", tag: "Loiro com cachos", code: "DceHc9ckc0I" },
  { src: t03, alt: "Tranças nagô finas com acabamento ondulado na frente", tag: "Acabamento ondulado", code: "DceHvjOkfph" },
  { src: t04, alt: "Tranças nagô curvas vistas de lado", tag: "Desenho lateral", code: "DYiJaSrGaBe" },
  { src: t05, alt: "Tranças nagô com mechas acobreadas", tag: "Mechas", code: "DceHy5EkTsV" },
  { src: t06, alt: "Tranças longas com cachos pretos, vistas de costas", tag: "Cachos pretos", code: "DceHqWukXpT" },
  { src: t07, alt: "Coque de cabelo cacheado com tranças nagô na frente", tag: "Nagô com coque", code: "DEN5QxKSiAp" },
  { src: t08, alt: "Trança lateral com fios metálicos e pingente", tag: "Acessórios", code: "DV8zwreEU03" },
  { src: t09, alt: "Tranças nagô em leque terminando em rabo trançado", tag: "Nagô em leque", code: "DXUVo01EZom" },
  { src: t10, alt: "Tranças laterais com fios brancos em cabelo liso", tag: "Lateral com fios", code: "DDyEuoQOK6m" },
  { src: t11, alt: "Tranças nagô com baby hair, vistas de perfil", tag: "Perfil", code: "DV80T4qEWw5" },
  { src: t12, alt: "Tranças nagô longas vistas de perfil", tag: "Nagô longas", code: "DCcqh_NSvSM" },
];

const marquee = ["TRANÇAS COM IDENTIDADE", "CUIDADO EM CADA DETALHE", "AUTOESTIMA EM PRIMEIRO LUGAR"];

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
          <div className="hero-arch">
            <Image src={retrato} alt="Maysa, trancista da Maysa Braids, com tranças longas" priority placeholder="blur" sizes="(max-width: 820px) 88vw, 420px" />
          </div>
          <div className="signature" aria-hidden="true">M</div>
          <a className="booking-peek" href="/agendamento">
            <span className="booking-icon" aria-hidden="true">✦</span>
            <div><small>AGENDA ABERTA ONLINE</small><strong>Veja os horários livres</strong></div>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </section>

      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((copy) => (
            <div className="marquee-group" key={copy}>
              {marquee.map((text) => <span key={text}>{text}<i>✦</i></span>)}
            </div>
          ))}
        </div>
      </div>

      <section className="portfolio section" id="portfolio">
        <div className="section-heading">
          <div><p className="eyebrow">Trabalhos</p><h2>Cada trança,<br /><em>uma assinatura.</em></h2></div>
          <p>Dos desenhos mais delicados às tranças longas cheias de movimento: um olhar de perto no que sai das mãos da Maysa.</p>
        </div>
        <div className="gallery">
          {gallery.map((item) => (
            <a className="gallery-item" href={instagramPost(item.code)} target="_blank" rel="noreferrer" key={item.code}>
              <figure>
                <Image src={item.src} alt={item.alt} placeholder="blur" sizes="(max-width: 980px) 50vw, 390px" />
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
          <p>Toque na trança para agendar. Se você quiser um modelo diferente, é só mandar uma foto no WhatsApp que a Maysa te passa o valor.</p>
        </div>
        <div className="braid-grid">
          {services.map((service) => {
            const photos = braidPhotos[service.id];
            const jumbo = jumboLabel(service);
            return (
              <a className="braid-card" href={`/agendamento?servico=${service.id}`} key={service.id}>
                <div className="braid-photo">
                  <Image src={photos.main} alt={`${service.title} feita pela Maysa`} placeholder="blur" sizes="(max-width: 980px) 46vw, 280px" />
                  {photos.extra && <Image className="braid-extra" src={photos.extra} alt={`Outro exemplo de ${service.title}`} sizes="120px" />}
                </div>
                <div className="braid-info">
                  <h3>{service.title}</h3>
                  {jumbo && <small>{jumbo}</small>}
                  <p><strong>{priceLabel(service)}</strong><span>Agendar <b aria-hidden="true">→</b></span></p>
                </div>
              </a>
            );
          })}
          <a className="braid-card braid-custom" href={whatsappLink("Olá, Maysa! Quero fazer uma trança diferente. Segue a foto de referência:")} target="_blank" rel="noreferrer">
            <Image src={fotoJumbo} alt="Maysa segurando mechas de jumbo" fill placeholder="blur" sizes="(max-width: 980px) 46vw, 280px" />
            <div><small>Outro modelo?</small><strong>Mande uma foto no WhatsApp</strong><span>A Maysa te passa o valor ↗</span></div>
          </a>
        </div>
      </section>

      <section className="experience section">
        <div className="experience-photo"><Image src={experiencia} alt="Cliente com tranças nagô e cachos no espaço de atendimento da Maysa" placeholder="blur" sizes="(max-width: 820px) 92vw, 560px" /><span>Atendimento<br />com hora<br />marcada</span></div>
        <div className="experience-copy">
          <p className="eyebrow">Como funciona</p>
          <h2>Do clique<br /><em>à cadeira.</em></h2>
          <p>A Maysa mostra só os dias e horários que realmente estão livres. Você escolhe, reserva e finaliza a conversa pelo WhatsApp.</p>
          <ul><li><span>01</span><div><strong>Escolha a trança</strong><small>Veja a tabela de valores e selecione o modelo que você quer.</small></div></li><li><span>02</span><div><strong>Pegue um horário livre</strong><small>O calendário só habilita os dias em que a Maysa tem vaga.</small></div></li><li><span>03</span><div><strong>Confirme pelo WhatsApp</strong><small>Seu pedido já vai pronto para a conversa, com tudo o que a Maysa precisa.</small></div></li></ul>
        </div>
      </section>

      <section className="about section" id="sobre">
        <div className="about-copy"><p className="eyebrow">Sobre a trancista</p><h2>Prazer,<br />sou a <em>Maysa.</em></h2><p>Trancista em {site.city}, há 3 anos eu transformo cabelo em autoestima. Cada trança nasce de uma conversa, passa por muito cuidado com o couro cabeludo e termina com a cliente se vendo ainda mais bonita.</p><p>Por trás de cada trança existe dedicação, amor e muito cuidado. Sou apaixonada pelo que faço e por transformar cada detalhe em autoestima.</p><div className="about-stats"><div><strong>3 anos</strong><span>de experiência<br />com tranças</span></div><div><strong>100%</strong><span>atendimento com<br />hora marcada</span></div></div></div>
        <div className="about-photo"><div className="about-arch"><Image src={jornal} alt="Maysa segurando um jornal com a manchete Maysa Braids" placeholder="blur" sizes="(max-width: 520px) 285px, 370px" /></div><span className="about-mark" aria-hidden="true">MB</span><div className="about-seal"><strong>M</strong><span>MAYSA<br />BRAIDS</span></div></div>
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

      <section className="final-cta">
        <Image className="final-bg" src={fogo} alt="" fill placeholder="blur" sizes="100vw" />
        <p className="eyebrow">Seu próximo visual favorito</p>
        <h2>Vamos fazer a sua<br /><em>próxima trança?</em></h2>
        <a className="primary-button" href="/agendamento">Ver horários livres</a>
        <div className="final-script" aria-hidden="true">Maysa</div>
      </section>

      <footer><a className="brand footer-brand" href="#inicio"><span>Maysa</span><small>Braids · trancista</small></a><div className="footer-links"><a href="#portfolio">Trabalhos</a><a href="#valores">Valores</a><a href="#sobre">Sobre</a><a href="/agendamento">Agendamento</a></div><div className="footer-social"><a href={site.instagramUrl} target="_blank" rel="noreferrer">Instagram ↗</a><a href={whatsappLink()} target="_blank" rel="noreferrer">WhatsApp ↗</a><span>{site.whatsappDisplay}</span></div><p>© {new Date().getFullYear()} Maysa Braids · {site.city}. Todos os direitos reservados.</p></footer>

      <a className="floating-whatsapp" href={whatsappLink()} target="_blank" rel="noreferrer" aria-label="Falar com a Maysa no WhatsApp"><span><WhatsAppIcon /></span><b>WhatsApp</b></a>
    </main>
  );
}
