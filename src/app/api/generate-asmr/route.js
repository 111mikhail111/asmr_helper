import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(request) {
  const openai = new OpenAI({
    baseURL: "https://router.huggingface.co/featherless-ai/v1",
    apiKey: process.env.HF_TOKEN, // Теперь ключ только на сервере
  });
  try {
    const { triggers, req, ex, duration } = await request.json();

    // Валидация входных данных
    if (!triggers || !duration) {
      return NextResponse.json(
        { error: "Не указаны обязательные параметры" },
        { status: 400 }
      );
    }

    // Подготовка данных (как в вашем оригинальном коде)
    const triggerNames = triggers.map((t) => t.name);
    const requiredNames = req?.map((t) => t.name) || [];
    const excludedNames = ex?.map((t) => t.name) || [];

    const question = `Ты - ассистент для создания ASMR видео. Тебе нужно:
1. Придумать завлекающую тему для АСМР видео
2. Отобрать триггеры ТОЛЬКО из предоставленного списка, которые подходят под придуманную тему: ${triggerNames.join(
      ", "
    )}
3. Обязательно включить: ${requiredNames.join(", ") || "нет"}
4. Исключить: ${excludedNames.join(", ") || "нет"}
5. Распределить выбранные триггеры по таймлайну ${duration} минутного видео
6. Не изменять названия триггеров и не добавлять новые

Правила:
- Триггеры должны быть из строго предоставленного списка
- Названия триггеров не менять
- Каждый триггер должен занимать примерно 2-3 минуты, то есть триггеров должно быть (длительность видео/2.5)
- Общая длительность должна быть около ${duration} минут (±30 секунд)
- Триггеры не должны повторяться
- Первый триггер должен начинаться с 0:00

Список доступных триггеров: ${triggerNames.join(", ")}

В ответ только сгенерируй JSON следующего формата:
{
  "title": "Название темы, объединяющей выбранные триггеры",
  "duration": ${duration},
  "triggers": [
    { 
      "timecode": "0:00", 
      "name": "Точное название из списка", 
      "duration": 60 
    }
  ]
}

`;

    // Вызов OpenAI через OpenRouter
    const completion = await openai.chat.completions.create({
      model: "moonshotai/Kimi-Dev-72B",
      messages: [
        {
          role: "system",
          content:
            "Ты помогаешь создавать ASMR видео, строго следуя инструкциям.",
        },
        { role: "user", content: question },
      ],
      temperature: 0.3,
    });

    // Очистка и парсинг ответа
    const cleanJsonString = completion.choices[0].message.content
      .replace(/^["`]+|["`]+$/g, "")
      .replace(/^json/, "")
      .trim();

    return NextResponse.json(JSON.parse(cleanJsonString));
  } catch (error) {
    console.error("Ошибка генерации ASMR:", error);
    return NextResponse.json(
      {
        error: "Ошибка при генерации сценария",
        details: error.message,
      },
      { status: 500 }
    );
  }
}
