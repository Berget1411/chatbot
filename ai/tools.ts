import { tool as createTool } from "ai";
import { z } from "zod";

export const weatherTool = createTool({
  description: "Display the weather for a location",
  inputSchema: z.object({
    location: z.string().describe("The location to get the weather for"),
  }),
  execute: async function ({ location }) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return { weather: "Sunny", temperature: 75, location };
  },
});

export const askForConfirmation = createTool({
  description: "Ask the user for confirmation.",
  inputSchema: z.object({
    message: z.string().describe("The message to ask for confirmation."),
  }),
});

export const getLocation = createTool({
  description:
    "Get the user location. Always ask for confirmation before using this tool.",
  inputSchema: z.object({}),
});

export const tools = {
  getWeatherInformation: weatherTool,
  askForConfirmation: askForConfirmation,
  getLocation: getLocation,
};
