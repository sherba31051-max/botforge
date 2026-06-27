import { mcp } from "@adaptive-ai/sdk/server";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { generateText } from "ai";
import { db } from "@/api/db";
import { env } from "@/lib/env";

type Blueprint = {
  name: string;
  category: string;
  summary: string;
  platforms: string[];
  features: string[];
  commands: string[];
  integrations: string[];
  knowledgeBase: string[];
  launchPlan: string[];
};

const fallbackBlueprint = (prompt: string, platforms: string[]): Blueprint => ({
  name: "Умный бот-помощник",
  category: "Бизнес и повседневная жизнь",
  summary: `Готовый проект бота под запрос: ${prompt}. Он отвечает пользователям, собирает данные и помогает запускать сценарии на выбранных платформах.`,
  platforms,
  features: [
    "Диалоговый сценарий с приветствием, уточнениями и финальным действием",
    "Сбор контактов, заявок или личных задач в понятную структуру",
    "База частых вопросов и быстрые ответы",
    "Передача сложных случаев человеку или в отдельный список",
  ],
  commands: ["/start", "/help", "/status", "/settings"],
  integrations: ["CRM/таблица", "уведомления владельцу", "webhook/API платформы"],
  knowledgeBase: ["описание продукта или задачи", "FAQ", "правила общения", "ограничения платформ"],
  launchPlan: [
    "Проверить сценарий и выбрать платформу запуска",
    "Создать токен/API-доступ в выбранной платформе",
    "Подключить webhook или no-code сценарий",
    "Протестировать 10 типовых диалогов",
    "Запустить и ежедневно улучшать базу знаний",
  ],
});

function parseJson<T>(text: string, fallback: T): T {
  try {
    const cleaned = text.replace(/^```json/i, "").replace(/```$/i, "").trim();
    return JSON.parse(cleaned) as T;
  } catch {
    return fallback;
  }
}

export async function health() {
  return {
    status: "ok",
    timestamp: new Date().toISOString(),
    db: await db.$queryRaw`SELECT 1 as result`
      .then(() => "connected")
      .catch(() => "disconnected"),
    env: env.VITE_NODE_ENV,
  };
}

export async function generateBotBlueprint(input: {
  prompt: string;
  platforms: string[];
  audience: "business" | "personal" | "business_and_personal";
}) {
  const prompt = input.prompt.trim();
  if (!prompt) throw new Error("Опиши, какого бота нужно создать");

  const platforms = input.platforms.length ? input.platforms : ["Telegram"];
  const fallback = fallbackBlueprint(prompt, platforms);

  let blueprint = fallback;
  if (process.env.OPENROUTER_OPENCODE_BASE_URL && process.env.API_KEY) {
    const openrouter = createOpenRouter({
      baseURL: process.env.OPENROUTER_OPENCODE_BASE_URL,
      apiKey: process.env.API_KEY,
      headers: { "x-boxman-app-id": env.VITE_APP_ID },
    });

    const { text } = await generateText({
      model: openrouter.chat("openai/gpt-4.1-mini"),
      prompt: [
        "Ты продуктовый архитектор ботов. Ответь только валидным JSON без markdown.",
        "Создай готовый проект бота на русском языке для бизнеса или повседневной жизни.",
        `Запрос пользователя: ${prompt}`,
        `Платформы: ${platforms.join(", ")}`,
        `Аудитория: ${input.audience}`,
        "JSON поля: name, category, summary, platforms, features, commands, integrations, knowledgeBase, launchPlan.",
        "features/commands/integrations/knowledgeBase/launchPlan — массивы строк, 4-7 пунктов.",
      ].join("\n"),
    });
    blueprint = parseJson<Blueprint>(text, fallback);
  }

  const saved = await db.botBlueprint.create({
    data: {
      name: blueprint.name,
      category: blueprint.category,
      prompt,
      platforms: JSON.stringify(blueprint.platforms ?? platforms),
      summary: blueprint.summary,
      features: JSON.stringify(blueprint.features ?? fallback.features),
      commands: JSON.stringify(blueprint.commands ?? fallback.commands),
      integrations: JSON.stringify(blueprint.integrations ?? fallback.integrations),
      knowledgeBase: JSON.stringify(blueprint.knowledgeBase ?? fallback.knowledgeBase),
      launchPlan: JSON.stringify(blueprint.launchPlan ?? fallback.launchPlan),
    },
  });

  return toBlueprint(saved);
}

export async function listBlueprints() {
  const records = await db.botBlueprint.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
  });
  return records.map(toBlueprint);
}

export async function getKnowledgeSnapshot() {
  const latest = await db.knowledgeSnapshot.findFirst({
    orderBy: { createdAt: "desc" },
  });

  if (!latest) {
    return {
      updatedAt: null,
      headline: "База знаний готова к первому ежедневному обновлению",
      items: [],
      sources: ["Telegram Bot API", "Авито", "Max", "общие тренды автоматизации"],
    };
  }

  return {
    updatedAt: latest.createdAt.toISOString(),
    headline: latest.headline,
    items: JSON.parse(latest.items) as string[],
    sources: JSON.parse(latest.sources) as string[],
  };
}

export async function refreshKnowledgeDaily() {
  const result = await mcp.promptAgent({
    message: [
      "Собери краткое ежедневное обновление базы знаний для конструктора ботов.",
      "Фокус: Telegram боты, Авито для бизнеса, Max, WhatsApp/VK, CRM, no-code, ограничения платформ, тренды автоматизации.",
      "Верни практичные пункты на русском: что изменилось/что важно учесть при создании ботов.",
    ].join("\n"),
    outputJsonSchema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        items: { type: "array", items: { type: "string" } },
        sources: { type: "array", items: { type: "string" } },
      },
      required: ["headline", "items", "sources"],
    },
  });

  const response = result.response as {
    headline?: string;
    items?: string[];
    sources?: string[];
  };

  const saved = await db.knowledgeSnapshot.create({
    data: {
      headline: response.headline ?? "Ежедневное обновление базы знаний",
      items: JSON.stringify(response.items ?? []),
      sources: JSON.stringify(response.sources ?? []),
      sessionId: result.sessionId,
      status: result.status,
    },
  });

  return {
    id: saved.id,
    updatedAt: saved.createdAt.toISOString(),
    sessionId: result.sessionId,
    status: result.status,
  };
}

function toBlueprint(record: {
  id: string;
  name: string;
  category: string;
  prompt: string;
  platforms: string;
  summary: string;
  features: string;
  commands: string;
  integrations: string;
  knowledgeBase: string;
  launchPlan: string;
  createdAt: Date;
}) {
  return {
    id: record.id,
    name: record.name,
    category: record.category,
    prompt: record.prompt,
    platforms: JSON.parse(record.platforms) as string[],
    summary: record.summary,
    features: JSON.parse(record.features) as string[],
    commands: JSON.parse(record.commands) as string[],
    integrations: JSON.parse(record.integrations) as string[],
    knowledgeBase: JSON.parse(record.knowledgeBase) as string[],
    launchPlan: JSON.parse(record.launchPlan) as string[],
    createdAt: record.createdAt.toISOString(),
  };
}
