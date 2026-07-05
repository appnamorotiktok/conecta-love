"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database.types";

export type ChatMessage = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];

export function ChatClient({
  conversationId,
  currentUserId,
  otherUserName,
  otherUserPhotoUrl,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserName: string;
  otherUserPhotoUrl: string | null;
  initialMessages: ChatMessage[];
}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`messages-${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as ChatMessage]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [conversationId]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("conversation_id", conversationId)
      .neq("sender_id", currentUserId)
      .is("read_at", null)
      .then();
  }, [conversationId, currentUserId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const content = text.trim();
    if (!content) return;

    setText("");
    const supabase = createClient();

    const payload: MessageInsert = {
      conversation_id: conversationId,
      sender_id: currentUserId,
      content,
    };

    await supabase.from("messages").insert(payload);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
      <div className="mb-3 flex items-center gap-3 border-b border-border pb-3">
        <Link href="/app/matches" className="text-muted-foreground">
          ←
        </Link>
        <Avatar className="h-9 w-9">
          <AvatarImage src={otherUserPhotoUrl ?? undefined} alt={otherUserName} />
          <AvatarFallback>{otherUserName.charAt(0)}</AvatarFallback>
        </Avatar>
        <span className="flex-1 font-semibold">{otherUserName}</span>
        <Link
          href={`/app/chat/${conversationId}/historia`}
          className="text-xs text-primary underline underline-offset-2"
        >
          Somos um casal 💍
        </Link>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto py-2">
        {messages.map((m) => {
          const isMine = m.sender_id === currentUserId;
          return (
            <div
              key={m.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm ${
                  isMine
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2 border-t border-border pt-3">
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Escreva uma mensagem..."
        />
        <Button type="submit">Enviar</Button>
      </form>
    </main>
  );
}
