import {
  Middleware,
  MiddlewareContext,
  MiddlewareNext,
  FieldConfig,
} from "../types";
import { getRepo } from "../repo-register";
import { getGlobalMiddlewareManager } from "../middleware-manager";

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

export interface I18nAIMiddlewareOptions {
  required: {
    cache: {
      entity: string;
      source: string;
    };
    llm: {
      entity: string;
      source: string;
    };
  };
}

export function i18nAIMiddleware<T extends Record<string, any>>(
  options?: I18nAIMiddlewareOptions
): Middleware<T> {
  const middleware = async (
    context: MiddlewareContext<T>,
    next: MiddlewareNext<T>
  ) => {
    console.log(
      "i18nAIMiddleware called with context:",
      JSON.stringify(context, null, 2)
    );

    const metadata = context.metadata;
    const targetLanguage = metadata?.context?.language;

    // If no target language specified, execute normally without translation
    if (!targetLanguage) {
      console.log(
        "No target language specified, executing without translation"
      );
      return await next();
    }

    // If target language is English, return original value without translation
    if (targetLanguage === "en") {
      console.log(
        "Target language is English, executing without translation"
      );
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
    console.log("cacheKey:===>", cacheKey);

    try {
      const cacheEntity = options?.required.cache.entity || "CacheEntity";
      const cacheDefaultSource =
        options?.required.cache.source ||
        entityConfigs["cache"]?.defaultSource ||
        "memory";
      const cacheRepo = getRepo(cacheEntity, cacheDefaultSource);

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
              const llmEntity = options?.required.llm.entity || "LLMEntity";
              const llmDefaultSource =
                options?.required.llm.source ||
                entityConfigs["llm"]?.defaultSource ||
                "openrouter";
              const llmRepo = getRepo(llmEntity, llmDefaultSource);
              const prompt = `${i18n.prompt || "Please translate the following content"}, translate to ${languageMap[targetLanguage as keyof typeof languageMap]}:\n\n${originalValue}`;
              console.log("prompt:===>", prompt);
              const translationResponse = await llmRepo.create(
                {
                  data: {
                    model: i18n.model || "openai/gpt-4o-mini",
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
              console.log(`Translation for "${fieldName}": ${translatedValue}`);
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

  Object.defineProperty(middleware, "name", {
    value: "i18nAIMiddleware",
    writable: false,
    enumerable: false,
    configurable: true,
  });

  return middleware;
}
