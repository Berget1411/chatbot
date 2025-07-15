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

  const { sendMessage, messages, addToolResult } = useChat({
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
    maxSteps: 5,
    // run client-side tools that are automatically executed:
    async onToolCall({ toolCall }) {
      if (toolCall.toolName === "getLocation") {
        const cities = ["New York", "Los Angeles", "Chicago", "San Francisco"];
        return cities[Math.floor(Math.random() * cities.length)];
      }
    },
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
      {messages?.map((message) => (
        <div key={message.id}>
          <strong>{`${message.role}: `}</strong>
          {message.parts.map((part) => {
            switch (part.type) {
              // render text parts as simple text:
              case "text":
                return part.text;

              // for tool parts, use the typed tool part names:
              case "tool-askForConfirmation": {
                const callId = part.toolCallId;

                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div key={callId}>Loading confirmation request...</div>
                    );
                  case "input-available":
                    return (
                      <div key={callId}>
                        {(part.input as { message: string }).message}
                        <div>
                          <button
                            onClick={() =>
                              addToolResult({
                                toolCallId: callId,
                                output: "Yes, confirmed.",
                              })
                            }
                          >
                            Yes
                          </button>
                          <button
                            onClick={() =>
                              addToolResult({
                                toolCallId: callId,
                                output: "No, denied",
                              })
                            }
                          >
                            No
                          </button>
                        </div>
                      </div>
                    );
                  case "output-available":
                    return (
                      <div key={callId}>
                        Confirmation result: {String(part.output)}
                      </div>
                    );
                  case "output-error":
                    return <div key={callId}>Error: {part.errorText}</div>;
                }
                break;
              }

              case "tool-getLocation": {
                const callId = part.toolCallId;

                switch (part.state) {
                  case "input-streaming":
                    return (
                      <div key={callId}>Preparing location request...</div>
                    );
                  case "input-available":
                    return <div key={callId}>Getting location...</div>;
                  case "output-available":
                    return (
                      <div key={callId}>Location: {String(part.output)}</div>
                    );
                  case "output-error":
                    return (
                      <div key={callId}>
                        Error getting location: {part.errorText}
                      </div>
                    );
                }
                break;
              }

              case "tool-getWeatherInformation": {
                const callId = part.toolCallId;

                switch (part.state) {
                  // example of pre-rendering streaming tool inputs:
                  case "input-streaming":
                    return (
                      <pre key={callId}>{JSON.stringify(part, null, 2)}</pre>
                    );
                  case "input-available":
                    return (
                      <div key={callId}>
                        Getting weather information for{" "}
                        {(part.input as { location: string }).location}...
                      </div>
                    );
                  case "output-available":
                    return (
                      <div key={callId}>
                        Weather in{" "}
                        {(part.input as { location: string }).location}:{" "}
                        {String(part.output)}
                      </div>
                    );
                  case "output-error":
                    return (
                      <div key={callId}>
                        Error getting weather for{" "}
                        {(part.input as { location: string }).location}:{" "}
                        {part.errorText}
                      </div>
                    );
                }
                break;
              }
            }
          })}
          <br />
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
