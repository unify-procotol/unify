import { repo, Unify } from "@unilab/unify";
import {
  Current,
  CurrentUnits,
  Hourly,
  HourlyUnits,
  WeatherEntity,
  WeatherQueryResult,
} from "./entities/weather";
import { Plugin } from "@unilab/core";
import { WeatherAdapter } from "./adapters/open-meteo-weather";
import { GeocodingAdapter } from "./adapters/geocoding";
import { Agent } from "@mastra/core";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { GeocodingEntity, GeocodingQueryResult } from "./entities/geocoding";
import { config } from "dotenv";
import { EnhancedUnifyToolBuilder } from "./unify-tool";

config({ path: ".env" });

const WeatherPlugin: Plugin = {
  entities: [
    GeocodingEntity,
    GeocodingQueryResult,
    WeatherEntity,
    WeatherQueryResult,
    Current,
    CurrentUnits,
    Hourly,
    HourlyUnits,
  ],
  adapters: [
    {
      source: "open-meteo",
      entity: "GeocodingEntity",
      adapter: new GeocodingAdapter(),
    },
    {
      source: "open-meteo",
      entity: "WeatherEntity",
      adapter: new WeatherAdapter(),
    },
  ],
};

Unify.init({
  // enableDebug: true,
  plugins: [WeatherPlugin],
});

// Using the Enhanced UnifyToolBuilder for cleaner code
const toolBuilder = new EnhancedUnifyToolBuilder(WeatherPlugin);

// Create the SMART weather tool - no manual coding required!
const weatherTool = toolBuilder.createSmartTool({
  id: "get_city_weather_smart",
  description: `
    Smart AI-driven weather tool for getting weather information about cities. 
    
    Usage:
    - Pass natural language queries directly to the tool
    - Examples: "weather in London", "temperature in Paris", "how's the weather in Tokyo"
    
    The tool automatically:
    - Determines what entities are needed (geocoding, weather data, etc.)
    - Handles dependencies between entities
    - Generates and executes the query plan
    - Returns formatted weather results
    
    Provides current weather conditions including temperature, wind speed, and other relevant weather data.
    If location cannot be found, returns appropriate error message.
  `,
});

const smartAgent = new Agent({
  name: "Smart Unify Assistant",
  instructions: `
    You are a helpful and friendly assistant. When users ask questions:
    
    1. Use the available tools to get the information they need
    2. Pass the user's query directly to the appropriate tool
    3. Provide a friendly and conversational response based on the tool's results
    
    If a tool returns an error or cannot find the requested information, explain this clearly and suggest alternatives.
    
    Be friendly and conversational in your responses!
  `,
  model: createOpenRouter({
    apiKey: process.env.OPENROUTER_API_KEY!,
  }).chat("openai/gpt-4o-mini"),
  tools: { weatherTool },
});

// Main function to demonstrate the SMART AI weather assistant
async function askWeatherAI(question: string) {
  try {
    console.log(`\n👤 User: "${question}"\n`);

    const response = await smartAgent.generate([
      {
        role: "user",
        content: question,
      },
    ]);

    console.log(`\n🤖 Smart Weather Assistant: ${response.text}\n`);
  } catch (error) {
    console.error(
      "❌ Error:",
      error instanceof Error ? error.message : String(error)
    );
  }
}

// Demo function with multiple examples
async function runWeatherAIDemo() {
  console.log(
    "🌤️ Smart AI Weather Assistant Demo (Using AI-Driven Smart Tool)"
  );
  console.log(
    "================================================================\n"
  );

  // Example 1: London - Smart tool automatically handles everything
  await askWeatherAI("What's the weather like in london?");
}

runWeatherAIDemo();
