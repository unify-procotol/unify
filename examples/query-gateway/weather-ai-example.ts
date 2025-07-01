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

const getLocationTool = createTool({
  id: "get_location",
  description: "Get the latitude and longitude coordinates for a city name",
  inputSchema: z.object({
    cityName: z
      .string()
      .describe("The name of the city to get coordinates for"),
  }),
  outputSchema: z.object({
    city: z.string(),
    latitude: z.number(),
    longitude: z.number(),
  }),
  execute: async ({ context }) => {
    console.log(`🔍 Looking up coordinates for: ${context.cityName}`);

    const data = await repo<GeocodingEntity>("geocoding", "open-meteo").findOne(
      {
        where: {
          name: context.cityName.toLowerCase(),
        },
      }
    );

    if (!data) {
      throw new Error(`No location data found for ${context.cityName}`);
    }

    const result = {
      city: context.cityName,
      latitude: data.result.latitude,
      longitude: data.result.longitude,
    };

    console.log(`📍 Found coordinates:`, result);
    return result;
  },
});

const getWeatherTool = createTool({
  id: "get_weather",
  description: "Get current weather information for given coordinates",
  inputSchema: z.object({
    latitude: z.number().describe("The latitude coordinate"),
    longitude: z.number().describe("The longitude coordinate"),
    current: z
      .string()
      .default("temperature_2m,wind_speed_10m")
      .describe(
        "A list of weather variables to get current conditions, separated by commas, e.g. temperature_2m,wind_speed_10m"
      ),
    hourly: z
      .string()
      .default("temperature_2m,relative_humidity_2m,wind_speed_10m")
      .describe(
        "A list of weather variables which should be returned. Values can be comma separated, or multiple &hourly= parameter in the URL can be used. e.g. temperature_2m,relative_humidity_2m,wind_speed_10m"
      ),
  }),
  outputSchema: z.object({
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
    console.log(
      `🌤️ Getting weather for coordinates: ${context.latitude}, ${context.longitude}`
    );

    const data = await repo<WeatherEntity>("weather", "open-meteo").findOne({
      where: {
        latitude: context.latitude,
        longitude: context.longitude,
        current: context.current,
        hourly: context.hourly,
      },
    });

    if (!data) {
      throw new Error("No weather data found");
    }

    const result = {
      location: { latitude: context.latitude, longitude: context.longitude },
      current: {
        temperature: `${data.result.current.temperature_2m}${data.result.current_units.temperature_2m}`,
        windSpeed: `${data.result.current.wind_speed_10m}${data.result.current_units.wind_speed_10m}`,
        time: data.result.current.time,
      },
      timezone: data.result.timezone,
    };

    console.log(`☁️ Weather data retrieved:`, result.current);
    return result;
  },
});

const weatherAgent = new Agent({
  name: "Weather Assistant",
  instructions: `
    You are a helpful and friendly weather assistant. When users ask about weather in a specific location:
    
    1. First use the get_location tool to find the coordinates for the city they mentioned
    2. Then use the get_weather tool to get current weather information for those coordinates
    3. Provide a conversational and informative response about the weather conditions
    
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
  tools: { getLocationTool, getWeatherTool },
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

  // // Example 3: More specific question
  // await askWeatherAI("Is it windy in new york right now?");
}

runWeatherAIDemo();
