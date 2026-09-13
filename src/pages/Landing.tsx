import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";

const story = {
  en: [
    {
      eyebrow: "01 · The search",
      title: "You already know when something feels off.",
      body: "Not because your life is wrong. Because somewhere between who you are and how you live, the signal became harder to hear.",
      video: "/assets/01-search.mp4",
      align: "left" as const,
    },
    {
      eyebrow: "02 · The reflection",
      title: "What if you could meet yourself without the noise?",
      body: "Soul Sync does not hand you another identity. It reflects the patterns that are already there — how you think, choose, react and move through life.",
      video: "/assets/02-reflection.mp4",
      align: "right" as const,
    },
    {
      eyebrow: "03 · The patterns",
      title: "The pieces were never random.",
      body: "Your choices, strengths, friction and recurring loops begin to form a picture. Different lenses become one personal blueprint you can actually recognize yourself in.",
      video: "/assets/03-patterns.mp4",
      align: "left" as const,
    },
    {
      eyebrow: "04 · The misalignment",
      title: "Understanding yourself changes what you can no longer ignore.",
      body: "You start seeing where your life asks you to become someone you are not — and where old patterns keep choosing before you do.",
      video: "/assets/04-misalignment.mp4",
      align: "right" as const,
    },
    {
      eyebrow: "05 · The alignment",
      title: "Then insight becomes movement.",
      body: "Your Twin learns with you, keeps the larger picture in view and helps turn self-knowledge into choices that feel more like your own.",
      video: "/assets/05-alignment.mp4",
      align: "left" as const,
    },
  ],
  nl: [
    {
      eyebrow: "01 · De zoektocht",
      title: "Je voelt het al wanneer iets niet klopt.",
      body: "Niet omdat je leven verkeerd is. Maar omdat ergens tussen wie je bent en hoe je leeft, je eigen signaal moeilijker hoorbaar werd.",
      video: "/assets/01-search.mp4",
      align: "left" as const,
    },
    {
      eyebrow: "02 · De reflectie",
      title: "Wat als je jezelf kon ontmoeten zonder alle ruis?",
      body: "Soul Sync geeft je geen nieuwe identiteit. Het weerspiegelt de patronen die er al zijn — hoe je denkt, kiest, reageert en door het leven beweegt.",
      video: "/assets/02-reflection.mp4",
      align: "right" as const,
    },
    {
      eyebrow: "03 · De patronen",
      title: "De losse delen waren nooit willekeurig.",
      body: "Je keuzes, kracht, frictie en terugkerende patronen vormen langzaam één beeld. Verschillende lenzen worden een persoonlijke blauwdruk waarin je jezelf herkent.",
      video: "/assets/03-patterns.mp4",
      align: "left" as const,
    },
    {
      eyebrow: "04 · De misalignment",
      title: "Jezelf begrijpen verandert wat je niet langer kunt negeren.",
      body: "Je ziet waar je leven vraagt iemand te zijn die je niet bent — en waar oude patronen nog voor jou kiezen.",
      video: "/assets/04-misalignment.mp4",
      align: "right" as const,
    },
    {
      eyebrow: "05 · De alignment",
      title: "Dan wordt inzicht beweging.",
      body: "Je Twin leert met je mee, houdt het grotere geheel in beeld en helpt zelfkennis te vertalen naar keuzes die steeds meer als die van jou voelen.",
      video: "/assets/05-alignment.mp4",
      align: "left" as const,
    },
  ],
};

/**
 * Public landing only. The authenticated product/runtime is intentionally untouched:
 * HomeGate still sends signed-in users directly to /companion.
 *
 * This page uses five full-screen video chapters. Each chapter remains sticky while
 * the page scrolls through it, so copy can enter/leave over moving footage without
 * coupling the marketing experience to application state or system services.
 */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const chapters = story[language] ?? story.en;

  return (
    <div className="relative bg-black text-white selection:bg-white selection:text-black">
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between px-5 py-4 sm:px-8 lg:px-12">
        <Link
          to="/"
          className="text-sm font-semibold tracking-[0.16em] uppercase text-white/95 drop-shadow-lg"
        >
          Soul Sync
        </Link>
        <div className="flex items-center gap-2 rounded-full border border-white/15 bg-black/20 p-1.5 pl-3 backdrop-blur-md">
          <LanguageSelector />
          <Button asChild variant="ghost" size="sm" className="rounded-full text-white hover:bg-white/10 hover:text-white">
            <Link to="/auth">
              <LogIn className="mr-2 h-4 w-4" />
              {t("auth.signIn")}
            </Link>
          </Button>
        </div>
      </header>

      <main>
        {chapters.map((chapter, index) => (
          <section key={chapter.video} className="relative h-[150vh] sm:h-[165vh]">
            <div className="sticky top-0 h-[100svh] overflow-hidden bg-black">
              <motion.video
                className="absolute inset-0 h-full w-full object-cover"
                src={chapter.video}
                autoPlay
                muted
                loop
                playsInline
                preload={index === 0 ? "auto" : "metadata"}
                initial={reduceMotion ? false : { scale: 1.035 }}
                whileInView={reduceMotion ? undefined : { scale: 1 }}
                viewport={{ amount: 0.25 }}
                transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }}
              />

              <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/65" />
              <div
                className={`absolute inset-0 ${
                  chapter.align === "left"
                    ? "bg-gradient-to-r from-black/70 via-black/20 to-transparent"
                    : "bg-gradient-to-l from-black/70 via-black/20 to-transparent"
                }`}
              />

              <div className="relative z-10 mx-auto flex h-full w-full max-w-[1500px] items-center px-6 sm:px-10 lg:px-16 xl:px-24">
                <motion.div
                  className={`max-w-2xl ${chapter.align === "right" ? "ml-auto text-right" : "mr-auto text-left"}`}
                  initial={reduceMotion ? false : { opacity: 0, y: 36 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ amount: 0.45 }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="mb-5 text-[11px] font-medium uppercase tracking-[0.3em] text-white/65 sm:text-xs">
                    {chapter.eyebrow}
                  </p>
                  <h1 className="font-cormorant text-4xl font-medium leading-[0.95] tracking-[-0.03em] text-white drop-shadow-xl sm:text-6xl lg:text-7xl xl:text-8xl">
                    {chapter.title}
                  </h1>
                  <p
                    className={`mt-7 max-w-xl text-base leading-relaxed text-white/78 sm:text-lg lg:text-xl ${
                      chapter.align === "right" ? "ml-auto" : "mr-auto"
                    }`}
                  >
                    {chapter.body}
                  </p>

                  {index === 0 && (
                    <motion.div
                      className={`mt-10 flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-white/60 ${
                        chapter.align === "right" ? "justify-end" : "justify-start"
                      }`}
                      animate={reduceMotion ? undefined : { y: [0, 8, 0] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    >
                      <ArrowDown className="h-4 w-4" />
                      {language === "nl" ? "Scroll door het verhaal" : "Scroll through the story"}
                    </motion.div>
                  )}
                </motion.div>
              </div>

              <div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
                {chapters.map((_, dotIndex) => (
                  <span
                    key={dotIndex}
                    className={`h-1 rounded-full transition-all ${dotIndex === index ? "w-8 bg-white" : "w-3 bg-white/35"}`}
                  />
                ))}
              </div>
            </div>
          </section>
        ))}

        <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#0b0a09] px-6 py-24 text-center">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.08),transparent_45%)]" />
          <motion.div
            className="relative z-10 mx-auto max-w-3xl"
            initial={reduceMotion ? false : { opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }}
            transition={{ duration: 0.9 }}
          >
            <p className="mb-5 text-xs uppercase tracking-[0.3em] text-white/50">Soul Sync Flow</p>
            <h2 className="font-cormorant text-5xl font-medium leading-none tracking-[-0.03em] sm:text-6xl lg:text-7xl">
              {language === "nl" ? "Niet iemand anders worden. Meer jezelf worden." : "Not becoming someone else. Becoming more yourself."}
            </h2>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-white/60 sm:text-lg">
              {language === "nl"
                ? "Begin met je blauwdruk. Laat Soul Sync vervolgens met je meegroeien terwijl inzicht verandert in richting."
                : "Start with your blueprint. Then let Soul Sync grow with you as understanding becomes direction."}
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                onClick={() => navigate("/get-started")}
                size="lg"
                className="h-12 rounded-full bg-white px-8 text-black hover:bg-white/90"
              >
                {t("index.getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-white/25 bg-transparent px-8 text-white hover:bg-white/10 hover:text-white">
                <Link to="/auth">{t("auth.signIn")}</Link>
              </Button>
            </div>
          </motion.div>
        </section>
      </main>
    </div>
  );
};

export default Landing;
