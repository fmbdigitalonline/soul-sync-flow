import React, { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { ArrowDown, ArrowRight, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSelector } from "@/components/ui/language-selector";
import { useLanguage } from "@/contexts/LanguageContext";

type LanguageKey = "en" | "nl";

const copy = {
  en: {
    nav: ["The feeling", "The mirror", "The Twin", "Alignment", "Movement"],
    heroEyebrow: "Come back to the person underneath the noise",
    heroLine1: "You learned",
    heroLine2: "how to become.",
    heroLine3: "But was it you?",
    heroBody:
      "Somewhere between expectations, ambition, relationships and survival, we become versions of ourselves that work — but don't always feel like home.",
    follow: "Follow the story",
    distanceChapter: "01 — The distance",
    distanceTitle: "Sometimes nothing is ‘wrong.’ You just don't feel aligned.",
    distanceBody1:
      "You can be intelligent, capable, successful — and still keep repeating choices you don't fully understand.",
    distanceBody2:
      "You know what you should do. You know what would probably help. And yet something in you keeps moving another way.",
    questions: [
      "Why do I delay?",
      "Why do I overthink?",
      "Why do I lose energy?",
      "Why do I keep choosing this?",
      "Why does success still feel off?",
    ],
    mirrorChapter: "02 — The mirror",
    mirrorTitle: "SoulSync tries to understand the person underneath the pattern.",
    mirrorBody:
      "Your blueprint is not a box. It is a starting map — a way to ask why certain thoughts, decisions, tensions and impulses may keep appearing in your life.",
    echoes: [
      ["How you take in the world", "What reaches you first?", "Pattern, emotion, logic, possibility, detail — different minds begin in different places."],
      ["How you make meaning", "What has to matter?", "Some choices only become real when they connect to identity, values or inner coherence."],
      ["How you decide", "Where does movement stall?", "A delay can be laziness. Or fear. Or a mind protecting possibility. The difference matters."],
      ["How you act", "What actually moves you?", "Willpower is not the only engine. Environment, timing, emotional truth and meaning can matter more."],
    ],
    mirrorLine:
      "The aim is not to tell you who you are. It is to build a better hypothesis about how you work — and let your real life correct it.",
    twinChapter: "03 — The Twin",
    twinTitle: "A reflection of your blueprint, talking back.",
    twinBody:
      "The Twin is not another personality sitting beside you. It is SoulSync's attempt to reflect your own pattern back to you — with context, memory and the humility to be corrected.",
    dialogue: [
      ["me", "Why do I keep looking for another option when I already know this one is good?"],
      ["twin", "Maybe because possibility gives you energy — and choosing one path feels like closing every other door."],
      ["me", "That sounds like me."],
      ["twin", "Then the question may not be ‘which option is best?’ It may be ‘what would let commitment still feel like freedom?’"],
    ],
    twinUnderTitle: "It doesn't only remember what you said.",
    twinUnder:
      "It tries to remember why it mattered — and how that connects to the way you seem to think, choose and move.",
    alignChapter: "04 — Alignment",
    alignTitle: "The goal is not to become someone better. It is to stop fighting the way you actually work.",
    alignBody:
      "Alignment means learning where your energy, decisions and actions become more coherent — then shaping your life around that understanding instead of constantly forcing yourself against it.",
    adapted: "The adapted self",
    adaptedTitle: "Who you learned to be",
    aligned: "The aligned self",
    alignedTitle: "How you work when you're not fighting yourself",
    alignCaption:
      "Not every discomfort means you are misaligned. Not every desire is your ‘true self.’ Alignment is the ongoing work of testing what brings you closer to coherence — in real life.",
    moveChapter: "05 — From knowing to becoming",
    moveTitle: "An insight only matters if it changes the relationship you have with yourself.",
    moveBody:
      "Sometimes you need to understand. Sometimes you need to remember. Sometimes you need to practice a new response. And sometimes you need to turn what matters into something concrete.",
    paths: [
      ["Stay with it", "Understand", "Explore why a pattern exists before trying to fix it."],
      ["Change the pattern", "Transform", "Practice a different response until your lived evidence starts to change."],
      ["Move toward something", "Achieve", "Turn a meaningful direction into milestones, action and progress."],
      ["Carry it forward", "Remember", "Keep important context alive for the moment when it becomes useful again."],
    ],
    finalTitle: "You are not a puzzle to solve.",
    finalBody:
      "You are a life in motion. SoulSync is a way to notice the patterns, understand the person inside them, and slowly make choices that feel more like your own.",
    footer: "Know yourself. Align with yourself. Move as yourself.",
  },
  nl: {
    nav: ["Het gevoel", "De spiegel", "De Twin", "Alignment", "Beweging"],
    heroEyebrow: "Kom terug bij de persoon onder alle ruis",
    heroLine1: "Je leerde",
    heroLine2: "hoe je moest worden.",
    heroLine3: "Maar was jij dat?",
    heroBody:
      "Ergens tussen verwachtingen, ambitie, relaties en overleven worden we versies van onszelf die functioneren — maar niet altijd als thuis voelen.",
    follow: "Volg het verhaal",
    distanceChapter: "01 — De afstand",
    distanceTitle: "Soms is er niets ‘mis’. Je voelt je gewoon niet aligned.",
    distanceBody1:
      "Je kunt intelligent, capabel en succesvol zijn — en toch keuzes blijven herhalen die je niet volledig begrijpt.",
    distanceBody2:
      "Je weet wat je zou moeten doen. Je weet wat waarschijnlijk helpt. En toch beweegt iets in jou steeds een andere kant op.",
    questions: [
      "Waarom stel ik uit?",
      "Waarom denk ik te veel?",
      "Waarom verlies ik energie?",
      "Waarom blijf ik hiervoor kiezen?",
      "Waarom voelt succes nog steeds niet goed?",
    ],
    mirrorChapter: "02 — De spiegel",
    mirrorTitle: "SoulSync probeert de persoon onder het patroon te begrijpen.",
    mirrorBody:
      "Je blueprint is geen hokje. Het is een startkaart — een manier om te onderzoeken waarom bepaalde gedachten, beslissingen, spanningen en impulsen blijven terugkomen.",
    echoes: [
      ["Hoe je de wereld binnenkrijgt", "Wat bereikt je als eerste?", "Patroon, emotie, logica, mogelijkheid, detail — verschillende mensen beginnen op verschillende plekken."],
      ["Hoe je betekenis maakt", "Wat moet ertoe doen?", "Sommige keuzes worden pas echt wanneer ze raken aan identiteit, waarden of innerlijke samenhang."],
      ["Hoe je beslist", "Waar stokt beweging?", "Uitstel kan luiheid zijn. Of angst. Of een brein dat mogelijkheden probeert te beschermen. Dat verschil doet ertoe."],
      ["Hoe je handelt", "Wat brengt je echt in beweging?", "Wilskracht is niet de enige motor. Omgeving, timing, emotionele waarheid en betekenis kunnen zwaarder wegen."],
    ],
    mirrorLine:
      "Het doel is niet om je te vertellen wie je bent. Het is om een betere hypothese te bouwen over hoe je werkt — en je echte leven die te laten corrigeren.",
    twinChapter: "03 — De Twin",
    twinTitle: "Een reflectie van je blueprint die terugpraat.",
    twinBody:
      "De Twin is geen extra persoonlijkheid naast je. Het is SoulSync's poging om je eigen patroon aan je terug te spiegelen — met context, geheugen en de ruimte om gecorrigeerd te worden.",
    dialogue: [
      ["me", "Waarom blijf ik naar een andere optie zoeken terwijl ik al weet dat deze goed is?"],
      ["twin", "Misschien omdat mogelijkheden je energie geven — en één pad kiezen voelt alsof je alle andere deuren sluit."],
      ["me", "Dat klinkt als mij."],
      ["twin", "Dan is de vraag misschien niet ‘welke optie is het beste?’ maar ‘wat zou commitment nog steeds als vrijheid laten voelen?’"],
    ],
    twinUnderTitle: "Het onthoudt niet alleen wat je zei.",
    twinUnder:
      "Het probeert te onthouden waarom het ertoe deed — en hoe dat samenhangt met hoe jij lijkt te denken, kiezen en bewegen.",
    alignChapter: "04 — Alignment",
    alignTitle: "Het doel is niet om iemand beter te worden. Het is stoppen met vechten tegen hoe je werkelijk werkt.",
    alignBody:
      "Alignment betekent leren waar je energie, beslissingen en acties meer samenhang krijgen — en je leven rond dat begrip vormgeven in plaats van jezelf er steeds tegenin te forceren.",
    adapted: "De aangepaste zelf",
    adaptedTitle: "Wie je hebt geleerd te zijn",
    aligned: "De aligned zelf",
    alignedTitle: "Hoe je werkt wanneer je niet tegen jezelf vecht",
    alignCaption:
      "Niet elk ongemak betekent dat je misaligned bent. Niet elk verlangen is je ‘ware zelf’. Alignment is blijven testen wat je in het echte leven dichter bij samenhang brengt.",
    moveChapter: "05 — Van weten naar worden",
    moveTitle: "Een inzicht doet er pas toe als het de relatie met jezelf verandert.",
    moveBody:
      "Soms moet je begrijpen. Soms onthouden. Soms een nieuwe reactie oefenen. En soms moet je wat belangrijk is omzetten in iets concreets.",
    paths: [
      ["Blijf erbij", "Begrijp", "Onderzoek waarom een patroon bestaat voordat je het probeert op te lossen."],
      ["Verander het patroon", "Transformeer", "Oefen een andere reactie totdat je geleefde bewijs begint te veranderen."],
      ["Beweeg ergens naartoe", "Bereik", "Vertaal een betekenisvolle richting naar mijlpalen, actie en voortgang."],
      ["Neem het mee", "Onthoud", "Houd belangrijke context levend voor het moment waarop die weer nuttig wordt."],
    ],
    finalTitle: "Je bent geen puzzel die opgelost moet worden.",
    finalBody:
      "Je bent een leven in beweging. SoulSync helpt patronen op te merken, de persoon erin te begrijpen en langzaam keuzes te maken die meer als de jouwe voelen.",
    footer: "Ken jezelf. Align met jezelf. Beweeg als jezelf.",
  },
} satisfies Record<LanguageKey, any>;

const VideoBackdrop: React.FC<{
  src: string;
  className?: string;
  priority?: boolean;
}> = ({ src, className = "", priority = false }) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hostRef = useRef<HTMLDivElement | null>(null);
  const reduceMotion = useReducedMotion();
  const inView = useInView(hostRef, { margin: "35% 0px 35% 0px", amount: 0.08 });

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion || !inView) {
      video.pause();
      return;
    }
    void video.play().catch(() => undefined);
  }, [inView, reduceMotion]);

  return (
    <div ref={hostRef} className={`absolute inset-0 overflow-hidden ${className}`}>
      <motion.video
        ref={videoRef}
        className="h-full w-full object-cover"
        src={src}
        muted
        loop={!reduceMotion}
        playsInline
        preload={priority ? "auto" : "metadata"}
        initial={reduceMotion ? false : { scale: 1.035 }}
        animate={inView && !reduceMotion ? { scale: 1 } : undefined}
        transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
};

const Reveal: React.FC<{ children: React.ReactNode; className?: string; delay?: number }> = ({
  children,
  className = "",
  delay = 0,
}) => {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Public signed-out landing only. The authenticated runtime remains untouched:
 * HomeGate still routes signed-in users directly to /companion.
 *
 * This page merges the cinematic video-scroll prototype with the richer Motion V2
 * story: the videos carry emotion; the V2 mirror/Twin/alignment/movement sections
 * explain the product without coupling marketing UI to application state.
 */
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const reduceMotion = useReducedMotion();
  const c = copy[(language as LanguageKey) ?? "en"] ?? copy.en;

  return (
    <div className="relative overflow-x-hidden bg-[#090812] text-white selection:bg-white selection:text-black">
      <header className="fixed left-1/2 top-3 z-50 flex h-14 w-[calc(100%-24px)] max-w-[1180px] -translate-x-1/2 items-center justify-between rounded-full border border-white/15 bg-[#0a0811]/60 px-3 pl-4 backdrop-blur-2xl sm:top-5 sm:w-[calc(100%-32px)] sm:px-4 sm:pl-5">
        <Link to="/" className="flex items-center gap-2.5 text-xs font-extrabold tracking-[-0.02em] sm:text-sm">
          <span className="h-7 w-7 rounded-full bg-[radial-gradient(circle_at_34%_28%,#fff_0_7%,#d9cdff_12%,#8b5cf6_42%,#3f2b67_72%)] shadow-[0_0_30px_rgba(139,92,246,.35)]" />
          SOULSYNC
        </Link>
        <nav className="hidden items-center gap-5 text-xs text-white/70 lg:flex">
          <a href="#distance">{c.nav[0]}</a>
          <a href="#mirror">{c.nav[1]}</a>
          <a href="#twin">{c.nav[2]}</a>
          <a href="#align">{c.nav[3]}</a>
          <a href="#move">{c.nav[4]}</a>
        </nav>
        <div className="flex items-center gap-1.5">
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
        <section id="top" className="relative h-[165vh]">
          <div className="sticky top-0 h-[100svh] overflow-hidden">
            <VideoBackdrop src="/assets/01-search.mp4" priority />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_47%_40%,rgba(124,58,237,.18),transparent_28%)]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#090812]/95 via-[#090812]/55 to-[#090812]/10" />
            <div className="absolute inset-0 bg-gradient-to-b from-[#090812]/20 via-transparent to-[#090812]/70" />

            <div className="relative z-10 mx-auto flex h-full w-[calc(100%-36px)] max-w-[1220px] items-center pt-16 sm:w-[calc(100%-48px)]">
              <div className="max-w-4xl">
                <Reveal>
                  <div className="mb-6 flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200/80">
                    <span className="h-px w-8 bg-gradient-to-r from-violet-400 to-transparent" />
                    {c.heroEyebrow}
                  </div>
                </Reveal>
                <h1 className="max-w-[9ch] font-cormorant text-[clamp(4rem,8.2vw,8.3rem)] font-semibold leading-[0.84] tracking-[-0.065em]">
                  <motion.span className="block" initial={reduceMotion ? false : { y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.95, ease: [0.16, 0.72, 0.16, 1] }}>
                    {c.heroLine1}
                  </motion.span>
                  <motion.span className="block" initial={reduceMotion ? false : { y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.95, delay: 0.1, ease: [0.16, 0.72, 0.16, 1] }}>
                    {c.heroLine2}
                  </motion.span>
                  <motion.span className="block bg-gradient-to-r from-[#b79cff] via-[#8b5cf6] to-[#33d0dd] bg-clip-text text-transparent" initial={reduceMotion ? false : { y: 70, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.95, delay: 0.2, ease: [0.16, 0.72, 0.16, 1] }}>
                    {c.heroLine3}
                  </motion.span>
                </h1>
                <Reveal delay={0.3} className="max-w-2xl">
                  <p className="mt-8 text-lg leading-relaxed text-white/70 sm:text-xl">{c.heroBody}</p>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Button asChild size="lg" className="rounded-full bg-white px-7 text-[#231a30] hover:bg-white/90">
                      <a href="#distance">{language === "nl" ? "Bekijk jezelf anders" : "See yourself differently"}</a>
                    </Button>
                    <Button asChild variant="outline" size="lg" className="rounded-full border-white/20 bg-white/5 px-7 text-white backdrop-blur-md hover:bg-white/10 hover:text-white">
                      <a href="#mirror">{language === "nl" ? "Wat is SoulSync?" : "What is SoulSync?"}</a>
                    </Button>
                  </div>
                </Reveal>
              </div>
            </div>
            <motion.div className="absolute bottom-6 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-[9px] uppercase tracking-[0.16em] text-white/45" animate={reduceMotion ? undefined : { y: [0, 7, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <ArrowDown className="h-4 w-4" />
              {c.follow}
            </motion.div>
          </div>
        </section>

        <section id="distance" className="relative min-h-[115svh] overflow-hidden bg-[#f1ede8] text-[#171421]">
          <div className="absolute inset-0 lg:right-1/2">
            <VideoBackdrop src="/assets/04-misalignment.mp4" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#f1ede8]/20 to-[#f1ede8]" />
            <div className="absolute inset-0 bg-[#f1ede8]/10" />
          </div>
          <div className="relative z-10 mx-auto grid min-h-[115svh] w-[calc(100%-36px)] max-w-[1180px] items-center py-24 lg:w-[calc(100%-48px)] lg:grid-cols-2 lg:gap-20">
            <div className="min-h-[52vh] lg:min-h-0" />
            <Reveal className="pb-12 lg:pb-0">
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#816bb2]">{c.distanceChapter}</div>
              <h2 className="font-cormorant text-[clamp(3.2rem,6.3vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.055em]">{c.distanceTitle}</h2>
              <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#6f6875]">{c.distanceBody1}</p>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-[#6f6875]">{c.distanceBody2}</p>
              <div className="mt-7 flex flex-wrap gap-2">
                {c.questions.map((question: string, index: number) => (
                  <motion.span key={question} className="rounded-full border border-black/10 bg-white/60 px-3 py-2 text-xs text-[#706979]" initial={reduceMotion ? false : { opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                    {question}
                  </motion.span>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section id="mirror" className="relative min-h-[140svh] overflow-hidden bg-[#0b0911] px-5 py-32 text-white sm:px-6 lg:py-40">
          <VideoBackdrop src="/assets/02-reflection.mp4" className="opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b0911]/90 via-[#0b0911]/55 to-[#0b0911]/95" />
          <div className="relative z-10 mx-auto max-w-[1180px]">
            <Reveal className="mx-auto max-w-4xl text-center">
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/70">{c.mirrorChapter}</div>
              <h2 className="font-cormorant text-[clamp(3.2rem,6.3vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.055em]">{c.mirrorTitle}</h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/55">{c.mirrorBody}</p>
            </Reveal>

            <div className="relative mx-auto mt-20 grid max-w-5xl gap-4 md:grid-cols-2">
              {c.echoes.map((echo: string[], index: number) => (
                <Reveal key={echo[0]} delay={index * 0.08}>
                  <div className="rounded-[24px] border border-white/10 bg-white/[0.055] p-5 backdrop-blur-xl shadow-[0_18px_55px_rgba(0,0,0,.18)]">
                    <small className="text-[9px] font-bold uppercase tracking-[0.14em] text-violet-200/60">{echo[0]}</small>
                    <h3 className="mt-2 text-xl font-semibold">{echo[1]}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/50">{echo[2]}</p>
                  </div>
                </Reveal>
              ))}
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[440px] w-[440px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-violet-400/10 md:block" />
              <div className="pointer-events-none absolute left-1/2 top-1/2 hidden h-[590px] w-[590px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-cyan-300/10 md:block" />
            </div>
            <Reveal className="mx-auto mt-14 max-w-3xl text-center text-sm leading-relaxed text-white/45">
              {c.mirrorLine}
            </Reveal>
          </div>
        </section>

        <section id="twin" className="relative min-h-[125svh] overflow-hidden bg-[#f8f5f1] text-[#171421]">
          <div className="absolute inset-0 left-1/2">
            <VideoBackdrop src="/assets/03-patterns.mp4" />
            <div className="absolute inset-0 bg-gradient-to-l from-transparent via-[#f8f5f1]/30 to-[#f8f5f1]" />
          </div>
          <div className="relative z-10 mx-auto grid min-h-[125svh] w-[calc(100%-36px)] max-w-[1180px] items-center py-28 lg:w-[calc(100%-48px)] lg:grid-cols-2 lg:gap-20">
            <Reveal className="max-w-xl">
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#816bb2]">{c.twinChapter}</div>
              <h2 className="font-cormorant text-[clamp(3.2rem,6vw,5.6rem)] font-semibold leading-[0.94] tracking-[-0.055em]">{c.twinTitle}</h2>
              <p className="mt-6 text-lg leading-relaxed text-[#716a77]">{c.twinBody}</p>
              <div className="mt-8 grid gap-3">
                {c.dialogue.map((item: string[], index: number) => (
                  <motion.div key={`${item[0]}-${index}`} className={`max-w-[88%] rounded-[20px] px-4 py-3 text-sm leading-relaxed ${item[0] === "me" ? "ml-auto bg-[#e4dcef]" : "border border-black/10 bg-white"}`} initial={reduceMotion ? false : { opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.16 }}>
                    {item[1]}
                  </motion.div>
                ))}
              </div>
              <div className="mt-5 rounded-[18px] bg-gradient-to-br from-[#eee8ff] to-[#f0fbfc] p-4 text-sm leading-relaxed text-[#5e5670]">
                <strong className="block">{c.twinUnderTitle}</strong>
                {c.twinUnder}
              </div>
            </Reveal>
            <div className="min-h-[58vh] lg:min-h-0" />
          </div>
        </section>

        <section id="align" className="relative min-h-[145svh] overflow-hidden bg-white px-5 py-32 text-[#171421] sm:px-6 lg:py-40">
          <VideoBackdrop src="/assets/05-alignment.mp4" className="opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-white/70 to-white/95" />
          <div className="relative z-10 mx-auto max-w-[1180px]">
            <Reveal className="mx-auto max-w-4xl text-center">
              <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-[#816bb2]">{c.alignChapter}</div>
              <h2 className="font-cormorant text-[clamp(3.2rem,6.3vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.055em]">{c.alignTitle}</h2>
              <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[#756f7f]">{c.alignBody}</p>
            </Reveal>

            <div className="relative mx-auto mt-20 grid max-w-5xl gap-5 md:grid-cols-[1fr_auto_1fr] md:items-center">
              <Reveal>
                <div className="rounded-[30px] border border-violet-200/60 bg-white/75 p-7 shadow-[0_30px_90px_rgba(35,27,45,.08)] backdrop-blur-xl">
                  <small className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#8a8290]">{c.adapted}</small>
                  <h3 className="mt-2 text-2xl font-semibold">{c.adaptedTitle}</h3>
                </div>
              </Reveal>
              <motion.div className="mx-auto h-24 w-px bg-gradient-to-b from-violet-300 via-cyan-300 to-transparent md:h-px md:w-32" animate={reduceMotion ? undefined : { opacity: [0.35, 1, 0.35] }} transition={{ duration: 2.6, repeat: Infinity }} />
              <Reveal delay={0.12}>
                <div className="rounded-[30px] border border-cyan-200/70 bg-white/75 p-7 shadow-[0_30px_90px_rgba(35,27,45,.08)] backdrop-blur-xl">
                  <small className="text-[9px] font-bold uppercase tracking-[0.13em] text-[#8a8290]">{c.aligned}</small>
                  <h3 className="mt-2 text-2xl font-semibold">{c.alignedTitle}</h3>
                </div>
              </Reveal>
            </div>
            <Reveal className="mx-auto mt-12 max-w-3xl text-center text-base leading-relaxed text-[#716a77]">
              {c.alignCaption}
            </Reveal>
          </div>
        </section>

        <section id="move" className="relative min-h-[110svh] overflow-hidden bg-[#0b0911] px-5 py-32 text-white sm:px-6 lg:py-40">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,rgba(139,92,246,.12),transparent_35%)]" />
          <div className="relative z-10 mx-auto max-w-[1180px]">
            <div className="grid gap-12 lg:grid-cols-[1.1fr_.9fr] lg:items-end lg:gap-20">
              <Reveal>
                <div className="mb-5 text-[10px] font-bold uppercase tracking-[0.18em] text-violet-300/70">{c.moveChapter}</div>
                <h2 className="font-cormorant text-[clamp(3.2rem,6.3vw,5.9rem)] font-semibold leading-[0.94] tracking-[-0.055em]">{c.moveTitle}</h2>
              </Reveal>
              <Reveal delay={0.12}>
                <p className="text-lg leading-relaxed text-white/50">{c.moveBody}</p>
              </Reveal>
            </div>

            <div className="relative mt-20 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="pointer-events-none absolute left-1/2 top-[-46px] hidden h-[92px] w-[92px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0_6%,#d8ccff_12%,#8b5cf6_42%,#372554_73%)] shadow-[0_0_55px_rgba(139,92,246,.27)] lg:block" />
              {c.paths.map((path: string[], index: number) => (
                <Reveal key={path[1]} delay={index * 0.08}>
                  <div className={`min-h-[180px] rounded-[24px] border p-5 backdrop-blur-xl transition-transform hover:-translate-y-1.5 ${index === 1 ? "border-emerald-300/20 bg-emerald-300/[0.06]" : index === 2 ? "border-violet-300/20 bg-violet-300/[0.06]" : "border-white/10 bg-white/[0.05]"}`}>
                    <small className="text-[9px] font-bold uppercase tracking-[0.12em] text-white/50">{path[0]}</small>
                    <h3 className="mt-2 text-xl font-semibold">{path[1]}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/45">{path[2]}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="start" className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-[#fcf8f6] px-6 py-28 text-center text-[#171421]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_25%,rgba(139,92,246,.10),transparent_40%)]" />
          <Reveal className="relative z-10 mx-auto max-w-4xl">
            <motion.div className="mx-auto mb-8 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_35%_30%,#fff_0_6%,#d8ccff_12%,#8b5cf6_42%,#372554_73%)] shadow-[0_0_65px_rgba(139,92,246,.24)]" animate={reduceMotion ? undefined : { y: [0, -10, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }} />
            <h2 className="font-cormorant text-[clamp(3.6rem,7.2vw,6.6rem)] font-semibold leading-[0.9] tracking-[-0.06em]">{c.finalTitle}</h2>
            <p className="mx-auto mt-7 max-w-3xl text-lg leading-relaxed text-[#756f7f]">{c.finalBody}</p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button onClick={() => navigate("/get-started")} size="lg" className="h-12 rounded-full bg-[#171421] px-8 text-white hover:bg-[#2a2433]">
                {t("index.getStarted")}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button asChild variant="outline" size="lg" className="h-12 rounded-full border-black/10 bg-white/60 px-8 text-[#171421] hover:bg-white">
                <Link to="/auth">{t("auth.signIn")}</Link>
              </Button>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-[#fcf8f6] px-6 pb-8 text-[#8c8791]">
        <div className="mx-auto flex max-w-[1180px] flex-col justify-between gap-2 border-t border-black/10 pt-6 text-[11px] sm:flex-row">
          <span>SOULSYNC</span>
          <span>{c.footer}</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
