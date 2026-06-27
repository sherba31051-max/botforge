# BotForge

**Purpose**: Конструктор готовых ботов для бизнеса и повседневной жизни с ежедневным обновлением базы знаний.

**Type**: app + scheduled automation + Android WebView APK wrapper

**Status**: active MVP

## What It Does

- Генерирует проект бота по русскоязычному запросу пользователя.
- Поддерживает платформы Telegram, Авито, Max, WhatsApp, VK и Web как расширяемые цели.
- Показывает функции, команды, интеграции, базу знаний и план запуска бота.
- Ежедневно обновляет базу знаний через scheduled agent в 09:00 Europe/Moscow.
- Содержит Android wrapper, который открывает Adaptive web app и собирается в APK через GitHub Actions.

## Data Stored

- **BotBlueprint**: сгенерированные проекты ботов.
- **KnowledgeSnapshot**: ежедневные обновления базы знаний и metadata delegated agent run.

## Functions

- `generateBotBlueprint(input)`: создаёт и сохраняет проект бота.
- `listBlueprints()`: возвращает последние проекты.
- `getKnowledgeSnapshot()`: возвращает последнее обновление базы знаний.
- `refreshKnowledgeDaily()`: cron-safe zero-arg обновление базы знаний.
- `health()`: проверка приложения.

## Integrates With

- **GitHub Actions**: `.github/workflows/android-apk.yml` собирает debug APK.
- **Adaptive AI**: direct model call для генерации проектов и `mcp.promptAgent()` для ежедневного обновления знаний.

## Use Cases

- Быстро описать и получить готовую архитектуру бота для бизнеса.
- Создать личного бота для напоминаний, списков и семейных задач.
- Получать актуализацию знаний о платформах ботов в автоматическом режиме.
