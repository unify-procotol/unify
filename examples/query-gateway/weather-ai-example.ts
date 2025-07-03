import { config } from "dotenv";
import { repo, UnifyClient } from "@unilab/unify-client";
import { WeatherEntity } from "./entities/weather";
import { GeocodingEntity } from "./entities/geocoding";
import { Agent } from "@mastra/core";
import { createTool } from "@mastra/core/tools";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";

config({ path: ".env" });

UnifyClient.init({
  baseUrl: "http://localhost:3000",
  timeout: 10000,
});

const weatherTool = createTool({
  id: "get_city_weather",
  description: "Get current weather information for a city by name",
  inputSchema: z.object({
    cityName: z
      .string()
      .describe("The name of the city to get weather information for"),
    current: z
      .string()
      .default("temperature_2m,wind_speed_10m")
      .describe(
        "A list of weather variables to get current conditions, separated by commas, e.g. temperature_2m,wind_speed_10m"
      ),
    hourly: z
      .string()
      .default("temperature_2m,wind_speed_10m")
      .describe(
        "A list of weather variables which should be returned. Values can be comma separated, or multiple &hourly= parameter in the URL can be used. e.g. temperature_2m,relative_humidity_2m,wind_speed_10m"
      ),
  }),
  outputSchema: z.object({
    city: z.string(),
    location: z.object({
      latitude: z.number(),
      longitude: z.number(),
    }),
    current: z.object({
      temperature: z.string(),
      windSpeed: z.string(),
      time: z.string(),
    }),
    timezone: z.string(),
  }),
  execute: async ({ context }) => {
    console.log(`🔍 Looking up weather for city: ${context.cityName}`);

    // Step 1: Get location coordinates
    const locationData = await repo<GeocodingEntity>({
      entityName: "geocoding",
      source: "open-meteo",
    }).findOne({
      where: {
        name: context.cityName.toLowerCase(),
      },
    });

    if (!locationData) {
      throw new Error(`No location data found for ${context.cityName}`);
    }

    const latitude = locationData.result.latitude;
    const longitude = locationData.result.longitude;

    console.log(`📍 Found coordinates: ${latitude}, ${longitude}`);

    // Step 2: Get weather data using coordinates
    const weatherData = await repo<WeatherEntity>({
      entityName: "weather",
      source: "open-meteo",
    }).findOne({
      where: {
        latitude,
        longitude,
        current: context.current,
        hourly: context.hourly,
      },
    });

    if (!weatherData) {
      throw new Error("No weather data found");
    }

    const result = {
      city: context.cityName,
      location: { latitude, longitude },
      current: {
        temperature: `${weatherData.result.current.temperature_2m}${weatherData.result.current_units.temperature_2m}`,
        windSpeed: `${weatherData.result.current.wind_speed_10m}${weatherData.result.current_units.wind_speed_10m}`,
        time: weatherData.result.current.time,
      },
      timezone: weatherData.result.timezone,
    };

    console.log(
      `☁️ Weather data retrieved for ${context.cityName}:`,
      result.current
    );
    return result;
  },
});

const weatherAgent = new Agent({
  name: "Weather Assistant",
  instructions: `
    You are a helpful and friendly weather assistant. When users ask about weather in a specific location:
    
    1. Use the get_city_weather tool to get current weather information for the city they mentioned
    2. Provide a conversational and informative response about the weather conditions
    
    Always include:
    - Current temperature
    - Wind speed
    - A brief comment about the conditions (pleasant, cold, windy, etc.)
    
    If you can't find the location or weather data, explain this clearly and suggest they try a different city name.
    
    Be friendly and conversational in your responses!
  `,
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  }).chat("openai/gpt-4o-mini"),
  tools: { weatherTool },
});

// Main function to demonstrate the AI weather assistant
async function askWeatherAI(question: string) {
  try {
    console.log(`\n👤 User: "${question}"\n`);

    const response = await weatherAgent.generate([
      {
        role: "user",
        content: question,
      },
    ]);

    console.log(`\n🤖 Weather Assistant: ${response.text}\n`);
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Demo function with multiple examples
async function runWeatherAIDemo() {
  console.log("🌤️ AI Weather Assistant Demo");
  console.log("=============================\n");

  // Example 1: London
  await askWeatherAI("What's the weather like in london?");

  // // Example 2: Different phrasing
  // await askWeatherAI("How's the weather in paris today?");

  // Example 3: More specific question
  // await askWeatherAI("Is it windy in new york right now?");
}

runWeatherAIDemo();
