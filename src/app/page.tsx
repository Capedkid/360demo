import { project, type GalleryItem } from "@/content/project";
import { getImage, getPanorama, getVideo } from "@/lib/media";
import { Films } from "@/components/Films";
import { FloorPlan } from "@/components/FloorPlan";
import { Gallery } from "@/components/Gallery";
import { Hero } from "@/components/Hero";
import { ResponsiveImage } from "@/components/ResponsiveImage";
import { Reveal, RevealImage } from "@/components/Reveal";
import { SectionHeading } from "@/components/SectionHeading";
import { SiteHeader } from "@/components/SiteHeader";
import { VirtualTour } from "@/components/VirtualTour";

const NAV = [
  { id: "overview", label: "Overview" },
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
  { id: "tour", label: "360° Tour" },
  { id: "films", label: "Films" },
  { id: "details", label: "Details" },
];

const toGallery = (items: GalleryItem[]) => items.map((i) => ({ asset: getImage(i.image), caption: i.caption }));

export default function Home() {
  const { overview, exterior, interior, tour, films, details } = project;

  const scenes = tour.scenes.map((s) => ({ ...s, panorama: getPanorama(s.panorama) }));
  const filmData = films.items.map((f) => ({
    ...f,
    video: getVideo(f.video).src,
    preview: f.preview ? getVideo(f.preview).src : undefined,
    poster: getImage(f.poster),
  }));
  const [overviewInterior, overviewExterior] = overview.images.map(getImage);

  return (
    <>
      <SiteHeader name={project.shortName} items={NAV} />

      <main>
        <Hero
          title={project.name}
          kicker={project.kicker}
          tagline={project.tagline}
          image={getImage(project.hero.image)}
          alt={project.hero.alt}
          facts={overview.facts}
        />

        {/* 01 Overview */}
        <section id="overview" className="py-24 md:py-36">
          <div className="container-x">
            <div className="grid gap-6 md:grid-cols-12 md:gap-10">
              <Reveal className="md:col-span-3">
                <p className="eyebrow flex items-center gap-3 text-muted">
                  <span>01</span>
                  <span className="block h-px w-8 bg-current opacity-60" />
                  <span>Overview</span>
                </p>
              </Reveal>
              <div className="md:col-span-9">
                <Reveal>
                  <p className="font-display text-[clamp(1.85rem,3.6vw,3.3rem)] leading-[1.12] tracking-[-0.01em]">
                    {overview.lead}
                  </p>
                </Reveal>
                <div className="mt-10 grid gap-6 text-base leading-relaxed text-ink-2 md:mt-14 md:grid-cols-2 md:gap-10">
                  {overview.body.map((para, i) => (
                    <Reveal key={i} delay={0.08 * i}>
                      <p>{para}</p>
                    </Reveal>
                  ))}
                </div>
              </div>
            </div>

            <dl className="mt-16 grid grid-cols-2 gap-x-6 md:mt-24 md:grid-cols-6">
              {overview.facts.map((f, i) => (
                <Reveal key={f.label} delay={0.05 * i} className="border-t border-line py-4 md:py-5">
                  <dt className="eyebrow text-muted">{f.label}</dt>
                  <dd className="mt-2 font-display text-2xl md:text-[1.7rem]">{f.value}</dd>
                </Reveal>
              ))}
            </dl>

            <div className="mt-16 grid gap-3 md:mt-24 md:grid-cols-12 md:items-end">
              <RevealImage className="aspect-[4/5] md:col-span-5">
                <ResponsiveImage
                  asset={overviewInterior}
                  alt="Double-height living hall"
                  sizes="(min-width: 768px) 42vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </RevealImage>
              <RevealImage className="aspect-[4/3] md:col-span-7" delay={0.12}>
                <ResponsiveImage
                  asset={overviewExterior}
                  alt="Pool terrace and garden elevation"
                  sizes="(min-width: 768px) 58vw, 100vw"
                  className="h-full w-full object-cover"
                />
              </RevealImage>
            </div>
          </div>
        </section>

        {/* 02 Exterior */}
        <section id="exterior" className="pb-24 md:pb-36">
          <div className="container-x">
            <SectionHeading index="02" label={exterior.title} heading={exterior.heading} intro={exterior.intro} />
            <div className="mt-12 md:mt-16">
              <Gallery images={toGallery(exterior.items)} label={exterior.title} />
            </div>
          </div>
        </section>

        {/* 03 Interior */}
        <section id="interior" className="bg-paper-2 py-24 md:py-36">
          <div className="container-x">
            <SectionHeading index="03" label={interior.title} heading={interior.heading} intro={interior.intro} />
            <div className="mt-12 md:mt-16">
              <Gallery images={toGallery(interior.items)} label={interior.title} />
            </div>
          </div>
        </section>

        {/* 04 360° Tour */}
        <section id="tour" className="bg-night py-24 text-white md:py-32">
          <div className="container-x">
            <SectionHeading index="04" label={tour.title} heading={tour.heading} intro={tour.intro} tone="dark" />
          </div>
          <Reveal className="mt-12 md:container-x md:mt-16" y={40}>
            <VirtualTour scenes={scenes} firstScene={tour.firstScene} />
          </Reveal>
        </section>

        {/* 05 Films */}
        <section id="films" className="border-t border-white/10 bg-night pb-24 pt-20 text-white md:pb-32 md:pt-28">
          <div className="container-x">
            <SectionHeading index="05" label={films.title} heading={films.heading} intro={films.intro} tone="dark" />
            <div className="mt-12 md:mt-16">
              <Films films={filmData} />
            </div>
          </div>
        </section>

        {/* 06 Drawings & Details */}
        <section id="details" className="py-24 md:py-36">
          <div className="container-x">
            <SectionHeading index="06" label={details.title} heading={details.heading} intro={details.intro} />

            <Reveal className="mt-12 md:mt-16">
              <FloorPlan />
            </Reveal>

            <div className="mt-20 md:mt-28">
              <Reveal>
                <p className="eyebrow text-muted">Material palette</p>
              </Reveal>
              <ul className="mt-6 grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
                {details.materials.map((m, i) => (
                  <Reveal as="li" key={m.name} delay={0.06 * i}>
                    <div className="aspect-square overflow-hidden">
                      <ResponsiveImage
                        asset={getImage(m.image)}
                        alt={`${m.name} sample`}
                        sizes="(min-width: 1024px) 16vw, (min-width: 640px) 33vw, 50vw"
                        className="h-full w-full object-cover transition-transform duration-700 hover:scale-105"
                      />
                    </div>
                    <p className="mt-3 text-sm font-medium">{m.name}</p>
                    <p className="mt-0.5 text-xs text-muted">{m.spec}</p>
                  </Reveal>
                ))}
              </ul>
            </div>

            <div className="mt-20 md:mt-28">
              <Reveal>
                <p className="eyebrow mb-6 text-muted">Details</p>
              </Reveal>
              <Gallery images={toGallery(details.items)} label="Details" />
            </div>
          </div>
        </section>
      </main>

      {/* Contact */}
      <footer id="contact" className="bg-night text-white">
        <div className="container-x py-24 md:py-32">
          <Reveal>
            <p className="eyebrow text-white/55">Contact</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h2 className="mt-6 max-w-4xl font-display text-[clamp(2.6rem,7vw,6.5rem)] leading-[0.95] tracking-[-0.02em]">
              Arrange a private <em>presentation</em>
            </h2>
          </Reveal>
          <Reveal delay={0.12} className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            <a
              href={`mailto:${project.contactEmail}?subject=${encodeURIComponent(project.name)}`}
              className="inline-flex items-center justify-center rounded-full bg-white px-7 py-4 text-sm text-ink transition-colors hover:bg-accent hover:text-white"
            >
              {project.contactEmail}
            </a>
            <a
              href={`tel:${project.contactPhone.replace(/\s/g, "")}`}
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 text-sm transition-colors hover:border-white"
            >
              {project.contactPhone}
            </a>
          </Reveal>

          <div className="mt-24 grid gap-8 border-t border-white/15 pt-8 text-sm text-white/55 md:grid-cols-3">
            <p>
              {project.name}
              <br />
              Presented by {project.studio}
            </p>
            <ul className="space-y-1">
              {project.credits.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="md:text-right">
              Demonstration website. Project data is illustrative.
              <br />© {new Date().getFullYear()} {project.studio}
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
