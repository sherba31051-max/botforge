import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  DatabaseZap,
  Download,
  Globe2,
  LifeBuoy,
  MessageCircle,
  Sparkles,
  Wand2,
} from "lucide-react";
import { client } from "@/lib/client";

const platforms = ["Telegram", "Авито", "Max", "WhatsApp", "VK", "Web"];

const templates = [
  {
    icon: BriefcaseBusiness,
    title: "Бизнес-продажи",
    text: "Консультации, заявки, FAQ, передача лида менеджеру.",
  },
  {
    icon: LifeBuoy,
    title: "Поддержка клиентов",
    text: "Приём обращений, статусы, база ответов, эскалация.",
  },
  {
    icon: CalendarClock,
    title: "Повседневные задачи",
    text: "Напоминания, списки, семейные дела, личный помощник.",
  },
];

const examples = [
  "Бот для Авито: отвечает покупателям, собирает контакты и отправляет мне заявки",
  "Telegram-бот для салона: запись клиентов, напоминания и FAQ",
  "Личный Max-бот: список покупок, напоминания и расписание семьи",
];

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-400/25 bg-cyan-400/10 px-3 py-1 text-xs font-medium text-cyan-100 shadow-[0_0_28px_rgba(34,211,238,0.08)]">
      {children}
    </span>
  );
}

function App() {
  const [prompt, setPrompt] = useState(examples[0]);
  const [selected, setSelected] = useState<string[]>(["Telegram", "Авито"]);

  const knowledgeQuery = useQuery({
    queryKey: ["knowledge"],
    queryFn: () => client.getKnowledgeSnapshot(),
  });

  const blueprintsQuery = useQuery({
    queryKey: ["blueprints"],
    queryFn: () => client.listBlueprints(),
  });

  const generateMutation = useMutation({
    mutationFn: () =>
      client.generateBotBlueprint({
        prompt,
        platforms: selected,
        audience: "business_and_personal",
      }),
    onSuccess: () => void blueprintsQuery.refetch(),
  });

  const currentBlueprint = useMemo(
    () => generateMutation.data ?? blueprintsQuery.data?.[0],
    [blueprintsQuery.data, generateMutation.data],
  );

  const togglePlatform = (platform: string) => {
    setSelected((items) =>
      items.includes(platform)
        ? items.filter((item) => item !== platform)
        : [...items, platform],
    );
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#050712] text-slate-50">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-28 top-0 h-72 w-72 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute right-[-8rem] top-36 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl" />
      </div>

      <section className="relative mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
        <header className="flex flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 shadow-2xl shadow-cyan-950/20 backdrop-blur md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-400/30">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <p className="text-sm text-cyan-200">BotForge</p>
              <h1 className="text-xl font-semibold tracking-tight">
                Конструктор готовых ботов
              </h1>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Badge>Telegram</Badge>
            <Badge>Авито</Badge>
            <Badge>Max</Badge>
            <Badge>ежедневная база знаний</Badge>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="rounded-[2.25rem] border border-white/10 bg-gradient-to-br from-white/[0.08] to-white/[0.03] p-5 shadow-2xl shadow-black/30 backdrop-blur md:p-8">
            <div className="mb-7 flex flex-col gap-4">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-300/20 bg-violet-400/10 px-3 py-1 text-sm text-violet-100">
                <Sparkles className="h-4 w-4" /> MVP с APK через GitHub Actions
              </div>
              <div>
                <h2 className="max-w-3xl text-4xl font-semibold tracking-tight md:text-6xl">
                  Создай бота по запросу за пару минут
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
                  Опиши задачу обычными словами. Приложение соберёт сценарий,
                  команды, интеграции, базу знаний и план запуска для бизнеса или
                  повседневной жизни.
                </p>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-cyan-300/20 bg-slate-950/70 p-4 shadow-inner shadow-cyan-950/40">
              <label className="mb-3 flex items-center gap-2 text-sm font-medium text-cyan-100">
                <Wand2 className="h-4 w-4" /> Что должен делать бот?
              </label>
              <textarea
                className="min-h-32 w-full resize-none rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-base leading-6 text-slate-50 outline-none transition focus:border-cyan-300/60 focus:ring-4 focus:ring-cyan-400/10"
                value={prompt}
                onChange={(event) => setPrompt(event.target.value)}
                placeholder="Например: бот для Авито, который отвечает клиентам и собирает заявки"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                {platforms.map((platform) => (
                  <button
                    key={platform}
                    type="button"
                    onClick={() => togglePlatform(platform)}
                    className={`min-h-11 rounded-full border px-4 text-sm transition ${
                      selected.includes(platform)
                        ? "border-cyan-300 bg-cyan-300 text-slate-950 shadow-lg shadow-cyan-400/20"
                        : "border-white/10 bg-white/[0.04] text-slate-300 hover:border-white/25"
                    }`}
                  >
                    {platform}
                  </button>
                ))}
              </div>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={() => generateMutation.mutate()}
                  disabled={!prompt.trim() || generateMutation.isPending}
                  className="min-h-12 flex-1 rounded-2xl bg-cyan-300 px-5 font-semibold text-slate-950 shadow-lg shadow-cyan-400/25 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {generateMutation.isPending
                    ? "Генерирую проект бота…"
                    : "Создать готового бота"}
                </button>
                <button
                  type="button"
                  onClick={() => setPrompt(examples[(examples.indexOf(prompt) + 1) % examples.length] ?? examples[1])}
                  className="min-h-12 rounded-2xl border border-white/10 px-5 text-sm text-slate-200 transition hover:bg-white/[0.06]"
                >
                  Пример запроса
                </button>
              </div>
            </div>
          </section>

          <aside className="flex flex-col gap-5">
            <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400">База знаний</p>
                  <h3 className="text-xl font-semibold">Самообучение ежедневно</h3>
                </div>
                <DatabaseZap className="h-9 w-9 text-cyan-300" />
              </div>
              <div className="mt-4 rounded-2xl border border-cyan-300/15 bg-cyan-300/10 p-4 text-sm leading-6 text-cyan-50">
                <p>
                  Автообновление: каждый день в 09:00 по Москве. Источники:
                  Telegram Bot API, Авито, Max, маркетплейсы, CRM и тренды
                  автоматизации.
                </p>
                <p className="mt-3 text-cyan-200/80">
                  Последнее обновление: {knowledgeQuery.data?.updatedAt ?? "ещё не запускалось"}
                </p>
              </div>
            </div>

            <div className="grid gap-3">
              {templates.map((template) => {
                const Icon = template.icon;
                return (
                  <button
                    key={template.title}
                    type="button"
                    onClick={() => setPrompt(template.text)}
                    className="group flex min-h-24 items-center gap-4 rounded-[1.5rem] border border-white/10 bg-white/[0.04] p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
                  >
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-violet-400/15 text-violet-200">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold">{template.title}</h4>
                      <p className="mt-1 text-sm leading-5 text-slate-400">{template.text}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-500 transition group-hover:translate-x-1 group-hover:text-cyan-200" />
                  </button>
                );
              })}
            </div>
          </aside>
        </div>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <Globe2 className="h-5 w-5 text-cyan-300" /> Подключаемые платформы
            </h3>
            <div className="grid gap-3 sm:grid-cols-2">
              {platforms.map((platform) => (
                <div
                  key={platform}
                  className="rounded-2xl border border-white/10 bg-slate-950/55 p-4"
                >
                  <div className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="h-4 w-4 text-cyan-300" /> {platform}
                  </div>
                  <p className="mt-2 text-sm text-slate-400">
                    Сценарии, команды, webhook/API план и готовый чек-лист запуска.
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
            <h3 className="mb-4 flex items-center gap-2 text-xl font-semibold">
              <MessageCircle className="h-5 w-5 text-violet-300" /> Готовый проект бота
            </h3>

            {currentBlueprint ? (
              <div className="space-y-4">
                <div className="rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
                  <p className="text-sm text-cyan-200">{currentBlueprint.category}</p>
                  <h4 className="mt-1 text-2xl font-semibold">{currentBlueprint.name}</h4>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    {currentBlueprint.summary}
                  </p>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {currentBlueprint.features.map((feature) => (
                    <div key={feature} className="rounded-2xl bg-slate-950/60 p-4 text-sm text-slate-300">
                      <CheckCircle2 className="mb-2 h-4 w-4 text-cyan-300" /> {feature}
                    </div>
                  ))}
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                  <p className="mb-2 text-sm font-medium text-slate-200">План запуска</p>
                  <ol className="space-y-2 text-sm text-slate-400">
                    {currentBlueprint.launchPlan.map((step, index) => (
                      <li key={step}>
                        <span className="text-cyan-300">{index + 1}.</span> {step}
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-white/15 p-8 text-center text-slate-400">
                Первый готовый проект появится здесь после генерации.
              </div>
            )}
          </div>
        </section>

        <footer className="flex flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400 md:flex-row md:items-center md:justify-between">
          <span>BotForge MVP: веб-приложение + Android APK оболочка.</span>
          <span className="flex items-center gap-2 text-cyan-200">
            <Download className="h-4 w-4" /> APK собирается через GitHub Actions
          </span>
        </footer>
      </section>
    </main>
  );
}

export default App;
