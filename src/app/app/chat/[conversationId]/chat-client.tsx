"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { Database } from "@/types/database.types";

export type ChatMessage = Database["public"]["Tables"]["messages"]["Row"];
type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
type BlockInsert = Database["public"]["Tables"]["blocked_users"]["Insert"];

export function ChatClient({
  conversationId,
  currentUserId,
  otherUserId,
  otherUserName,
  otherUserPhotoUrl,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  otherUserId: string;
  otherUserName: string;
  otherUserPhotoUrl: string | null;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [text, setText] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
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

  async function handleBlock() {
    setMenuOpen(false);
    const confirmed = window.confirm(
      `Bloquear ${otherUserName}? Vocês não poderão mais trocar mensagens.`
    );
    if (!confirmed) return;

    const supabase = createClient();
    const payload: BlockInsert = {
      blocker_id: currentUserId,
      blocked_id: otherUserId,
    };
    const { error } = await supabase.from("blocked_users").insert(payload);

    if (error) {
      alert("Não foi possível bloquear: " + error.message);
      return;
    }

    router.push("/app/matches");
    router.refresh();
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col px-4 py-4">
      <div className="relative mb-3 flex items-center gap-3 border-b border-border pb-3">
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
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="px-1 text-lg text-muted-foreground"
          aria-label="Mais opções"
        >
          ⋮
        </button>

        {menuOpen && (
          <div className="absolute right-0 top-full z-10 mt-1 w-40 rounded-lg border border-border bg-card shadow-md">
            <Link
              href={`/app/chat/${conversationId}/denunciar`}
              className="block px-3 py-2 text-sm hover:bg-secondary"
              onClick={() => setMenuOpen(false)}
            >
              Denunciar
            </Link>
            <button
              type="button"
              onClick={handleBlock}
              className="block w-full px-3 py-2 text-left text-sm text-destructive hover:bg-secondary"
            >
              Bloquear
            </button>
          </div>
        )}
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
