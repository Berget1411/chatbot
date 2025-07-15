import { openai } from "@ai-sdk/openai";
import { loadChat, saveChat } from "@/util/chat-store";
import {
  convertToModelMessages,
  createIdGenerator,
  streamText,
  UIMessage,
} from "ai";

export async function POST(req: Request) {
  // get the last message from the client:
  const { message, id } = await req.json();

  // load the previous messages from the server:
  const previousMessages = await loadChat(id);

  // append the new message to the previous messages:
  const messages = [...previousMessages, message];

  const result = streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToModelMessages(messages),
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
