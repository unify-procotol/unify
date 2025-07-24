import {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  FieldConfig,
} from "@unilab/urpc-core";
import { getRepo } from "@unilab/urpc-core";
import { getGlobalMiddlewareManager } from "@unilab/urpc-core";

const languageMap = {
  zh: "Chinese",
  en: "English",
  ja: "Japanese",
  ko: "Korean",
  fr: "French",
  de: "German",
  es: "Spanish",
  it: "Italian",
  ru: "Russian",
  pt: "Portuguese",
  nl: "Dutch",
  pl: "Polish",
  ar: "Arabic",
  hi: "Hindi",
} as const;

export function i18nAI<T extends Record<string, any>>(options?: {
  required: {
    entities: string[];
  };
}): Middleware<T> {
  const fn = async (context: MiddlewareContext<T>, next: MiddlewareNext<T>) => {
    const metadata = context.metadata;
    const targetLanguage = metadata?.context?.lang;

    // If no target language specified, execute normally without translation
    if (!targetLanguage) {
      console.log(
        "No target language specified, executing without translation"
      );
      return await next();
    }

    // If target language is English, return original value without translation
    if (targetLanguage === "en") {
      console.log("Target language is English, executing without translation");
      return await next();
    }

    const entityName = metadata.entity;
    const entityConfigs = getGlobalMiddlewareManager().entityConfigs;
    const entityConfig = entityConfigs[entityName];

    const fields = entityConfig?.fields;
    if (!fields) {
      console.log(
        "No fields configuration found, executing without translation"
      );
      return await next();
    }

    // Check if any field has i18n configuration
    const hasI18nFields = Object.values(fields).some(
      (field: any) => field.i18n
    );
    if (!hasI18nFields) {
      console.log("No i18n fields found, executing without translation");
      return await next();
    }

    // Extract identifier from context args for cache key
    const whereClause = context.args?.where;
    const identifier = whereClause?.slug || whereClause?.id;

    if (!identifier) {
      console.log(
        "No slug or id found in where clause, executing without translation"
      );
      return await next();
    }

    // Build cache key from context
    const cacheKey = `i18n:${entityName}:${identifier}:${targetLanguage}`;

    try {
      const cacheEntity = "CacheEntity";
      const cacheDefaultSource =
        entityConfigs["cache"]?.defaultSource || "memory";
      const cacheRepo = getRepo(cacheEntity, cacheDefaultSource);
      if (!cacheRepo) {
        console.log("Cache repo not found, executing without cache");
        return await next();
      }

      // First check for cached translations
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

        if (res?.value) {
          console.log("Translation found in cache, returning cached result");
          return res.value;
        }
      } catch (error) {
        console.warn("Cache lookup failed:", error);
      }

      console.log("No cache found, fetching original data and translating");

      // If no cache found, get original data
      const originalResult = await next();

      if (!originalResult) {
        console.log("No original result found");
        return originalResult;
      }

      console.log("Original result:", originalResult);

      const processEntity = async (entity: any) => {
        const translatedEntity = { ...entity };

        // Translate fields
        for (const [fieldName, fieldConfig] of Object.entries(fields)) {
          const typedFieldConfig = fieldConfig as FieldConfig;
          const i18n = typedFieldConfig.i18n;
          const originalValue = entity[fieldName];
          if (i18n && originalValue) {
            try {
              const llmEntity = "LLMEntity";
              const llmDefaultSource =
                entityConfigs["llm"]?.defaultSource || "openrouter";
              const llmRepo = getRepo(llmEntity, llmDefaultSource);
              if (llmRepo) {
                const promptText =
                  typeof i18n === "object" && i18n.prompt
                    ? i18n.prompt
                    : "Please translate the following content";
                const prompt = `${promptText}, translate to ${
                  languageMap[targetLanguage as keyof typeof languageMap]
                }:\n\n${originalValue}`;

                const translationResponse = await llmRepo.create(
                  {
                    data: {
                      model:
                        (typeof i18n === "object" && i18n.model) ||
                        "openai/gpt-4o-mini",
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
                console.log(
                  `Translation for "${fieldName}": ${translatedValue}`
                );
              }
            } catch (error) {
              console.warn(
                `Translation failed for field "${fieldName}":`,
                error
              );
              translatedEntity[fieldName] = originalValue;
            }
          }
        }

        return translatedEntity;
      };

      // Process result (handle both single entity and array)
      let translatedResult;
      if (Array.isArray(originalResult)) {
        translatedResult = await Promise.all(originalResult.map(processEntity));
      } else {
        translatedResult = await processEntity(originalResult);
      }

      // Cache the translated result
      try {
        // Getting TTL from entity-level configuration
        const ttl = entityConfig?.cache?.ttl || 1000 * 60 * 60 * 24; // Default 24 hours
        await cacheRepo.create(
          {
            data: {
              key: cacheKey,
              value: translatedResult,
              ttl: ttl,
            },
          },
          {
            entity: "cache",
            source: cacheDefaultSource,
          }
        );
        console.log("Translation cached successfully");
      } catch (error) {
        console.warn("Failed to cache translation:", error);
      }

      return translatedResult;
    } catch (error) {
      console.warn("Translation process failed:", error);
      // If translation fails, return original data
      return await next();
    }
  };

  return {
    fn,
    name: "i18nAIMiddleware",
    required: {
      entities: options?.required?.entities || ["cache", "llm"],
    },
  };
}
