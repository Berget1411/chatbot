"use client";

import { UIMessage, useChat } from "@ai-sdk/react";
import { createIdGenerator } from "ai";
import { DefaultChatTransport } from "ai";
import { useRef, useState } from "react";

export function Chat({
  id,
  initialMessages,
}: {
  id?: string | undefined;
  initialMessages?: UIMessage[];
}) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<FileList | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { sendMessage, messages } = useChat({
    id, // use the provided chat ID
    messages: initialMessages, // load initial messages
    // id format for client-side messages:
    generateId: createIdGenerator({
      prefix: "msgc",
      size: 16,
    }),
    transport: new DefaultChatTransport({
      prepareSendMessagesRequest({ messages, id }) {
        return { body: { message: messages[messages.length - 1], id } };
      },
      api: "/api/chat",
    }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input, files });
      setInput("");
      setFiles(undefined);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // reset the file input
      }
    }
  };

  // simplified rendering code, extend as needed:
  return (
    <div>
      {messages.map((m) => (
        <div key={m.id}>
          {m.role === "user" ? "User: " : "AI: "}
          {m.parts
            .map((part) => (part.type === "text" ? part.text : ""))
            .join("")}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder='Type a message...'
        />
        <input
          type='file'
          onChange={(event) => {
            if (event.target.files) {
              setFiles(event.target.files);
            }
          }}
          multiple
          ref={fileInputRef}
        />
        <button type='submit'>Send</button>
      </form>
    </div>
  );
}
