import {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  FieldConfig,
} from "../types";
import { getRepo } from "../repo-register";
import { getGlobalMiddlewareManager } from "../middleware-manager";

const languageMap = {
  zh: "中文",
  en: "英文",
  ja: "日文",
  ko: "韩文",
  fr: "法文",
  de: "德文",
  es: "西班牙文",
  it: "意大利文",
  ru: "俄文",
  pt: "葡萄牙文",
  nl: "荷兰文",
  pl: "波兰文",
  ar: "阿拉伯文",
  hi: "印地文",
} as const;

export function i18nAIMiddleware<
  T extends Record<string, any>,
>(): Middleware<T> {
  const middleware = async (
    context: MiddlewareContext<T>,
    next: MiddlewareNext<T>
  ) => {
    console.log("i18nAIMiddleware called with operation:", context.operation);

    const result = await next();

    const metadata = context.metadata;
    const targetLanguage = metadata?.context?.language;

    console.log("metadata:", metadata);
    console.log("targetLanguage:", targetLanguage);
    console.log("result:", result);

    if (!targetLanguage || !result) {
      console.log("No translation needed, returning result as-is");
      return result;
    }

    const entityName = metadata.entity;
    const entityConfigs = getGlobalMiddlewareManager().entityConfigs;
    console.log("entityConfigs:", entityConfigs);
    const entityConfig = entityConfigs[entityName];

    console.log("entityConfig:", entityConfig);

    const fields = entityConfig?.fields;
    if (!fields) {
      return result;
    }

    const processEntity = async (result: any) => {
      const translatedEntity = { ...result };

      for (const [fieldName, fieldConfig] of Object.entries(fields)) {
        const typedFieldConfig = fieldConfig as FieldConfig;
        if (typedFieldConfig.i18n && result[fieldName]) {
          const originalValue = result[fieldName];
          const cacheKey = `i18n:${entityName}:${result.slug}:${fieldName}:${targetLanguage}`;
          console.log("cacheKey:===>", cacheKey);
          try {
            const cacheDefaultSource =
              entityConfigs["cache"]?.defaultSource || "memory";
            const cacheRepo = getRepo("CacheEntity", cacheDefaultSource);
            let cachedTranslation = null;

            try {
              const res = await cacheRepo.findOne(
                {
                  where: { key: cacheKey },
                },
                {
                  entity: "cache",
                  source: cacheDefaultSource,
                }
              );

              cachedTranslation = res?.value;
            } catch (error) {
              console.warn("Cache lookup failed:", error);
            }

            if (cachedTranslation) {
              translatedEntity[fieldName] = cachedTranslation;
              console.log(
                `Translation from cache for ${fieldName}: ${cachedTranslation}`
              );
            } else {
              const llmDefaultSource =
                entityConfigs["llm"]?.defaultSource || "openrouter";
              const llmRepo = getRepo("LLMEntity", llmDefaultSource);
              const prompt = `${typedFieldConfig.i18n.prompt || "请翻译以下内容"} 翻译成${languageMap[targetLanguage as keyof typeof languageMap]}:\n\n${originalValue}`;
              console.log("prompt:===>", prompt);
              const translationResponse = await llmRepo.create(
                {
                  data: {
                    model: typedFieldConfig.i18n.model || "openai/gpt-4o",
                    prompt: prompt,
                  },
                },
                {
                  entity: "llm",
                  source: llmDefaultSource,
                }
              );

              const translatedValue =
                translationResponse.output || originalValue;
              translatedEntity[fieldName] = translatedValue;
              console.log(`Translation for ${fieldName}: ${translatedValue}`);

              try {
                await cacheRepo.create(
                  {
                    data: {
                      key: cacheKey,
                      value: translatedValue,
                      ttl:
                        typedFieldConfig.i18n.cache?.ttl || 1000 * 60 * 60 * 24, // 默认 24 小时
                    },
                  },
                  {
                    entity: "cache",
                    source: cacheDefaultSource,
                  }
                );
              } catch (error) {
                console.warn("Failed to cache translation:", error);
              }
            }
          } catch (error) {
            console.warn(`Translation failed for field ${fieldName}:`, error);
            translatedEntity[fieldName] = originalValue;
          }
        }
      }

      return translatedEntity;
    };

    if (Array.isArray(result)) {
      return await Promise.all(result.map(processEntity));
    } else {
      return await processEntity(result);
    }
  };

  Object.defineProperty(middleware, "name", {
    value: "i18nAIMiddleware",
    writable: false,
    enumerable: false,
    configurable: true,
  });

  return middleware;
}
