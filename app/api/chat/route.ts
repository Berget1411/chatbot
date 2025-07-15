import { openai } from "@ai-sdk/openai";
import { loadChat, saveChat } from "@/util/chat-store";
import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  UIMessage,
} from "ai";
import { tools } from "@/ai/tools";

export async function POST(req: Request) {
  // get the last message from the client:
  const { message, id } = await req.json();

  // load the previous messages from the server:
  const previousMessages = await loadChat(id);

  // append the new message to the previous messages:
  const messages = [...previousMessages, message];

  // Filter out client-side interactive tool states before sending to the model
  const messagesForModel = messages
    .map((msg) => {
      if (msg.role === "assistant" && msg.parts) {
        // Filter out tool parts that have client-side interactive states
        const filteredParts = msg.parts.filter((part: any) => {
          if (part.type?.startsWith("tool-")) {
            // Only keep tool parts that have completed execution (output-available)
            return part.state === "output-available";
          }
          // Keep all non-tool parts (like text)
          return true;
        });

        return {
          ...msg,
          parts: filteredParts,
        };
      }
      return msg;
    })
    .filter((msg) => {
      // Remove messages that have no parts after filtering
      if (msg.role === "assistant" && msg.parts && msg.parts.length === 0) {
        return false;
      }
      return true;
    });

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messagesForModel),
    tools,
    toolChoice: "auto",
  });

  return result.toUIMessageStreamResponse({
    originalMessages: messages,
    generateMessageId: createIdGenerator({
      prefix: "msgs",
      size: 16,
    }),
    onFinish: ({ messages }) => {
      saveChat({ chatId: id, messages });
    },
  });
}
