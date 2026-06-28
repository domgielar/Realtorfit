'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Message {
  id: string
  sender_role: 'buyer' | 'realtor'
  content: string
  created_at: string
}

interface Props {
  buyerId: string
  realtorId: string
  senderRole: 'buyer' | 'realtor'
  otherName: string
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

export default function MessageThread({ buyerId, realtorId, senderRole, otherName }: Props) {
  const [messages, setMessages] = useState<Message[]>([])
  const [content, setContent] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(true)
  const bottomRef = useRef<HTMLDivElement>(null)

  const fetchMessages = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('messages')
      .select('id, sender_role, content, created_at')
      .eq('buyer_id', buyerId)
      .eq('realtor_id', realtorId)
      .order('created_at', { ascending: true })
    if (data) setMessages(data as Message[])
    setLoading(false)
  }, [buyerId, realtorId])

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [fetchMessages])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const send = async () => {
    if (!content.trim() || sending) return
    setSending(true)
    const supabase = createClient()
    const { error } = await supabase.from('messages').insert({
      buyer_id: buyerId,
      realtor_id: realtorId,
      sender_role: senderRole,
      content: content.trim(),
    })
    if (!error) {
      setContent('')
      await fetchMessages()
    }
    setSending(false)
  }

  return (
    <div className="flex flex-col mt-1">
      <div className="max-h-56 overflow-y-auto flex flex-col gap-2 p-3.5 bg-[--color-paper] rounded-xl mb-3 border border-[--color-line]">
        {loading ? (
          <p className="text-[13px] text-center text-[--color-muted] py-3">Loading…</p>
        ) : messages.length === 0 ? (
          <p className="text-[13px] text-center text-[--color-muted] py-3">
            No messages yet — say hello!
          </p>
        ) : (
          messages.map((m) => {
            const isMine = m.sender_role === senderRole
            return (
              <div key={m.id} className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-[14px] leading-[1.45] ${
                    isMine
                      ? 'bg-[--color-clay] text-white rounded-br-sm'
                      : 'bg-white text-[--color-ink] border border-[--color-line] rounded-bl-sm'
                  }`}
                >
                  {m.content}
                </div>
                <span className="text-[11px] text-[--color-muted] mt-0.5 px-1">
                  {timeAgo(m.created_at)}
                </span>
              </div>
            )
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="flex gap-2 items-end">
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={`Message ${otherName}…`}
          className="flex-1 resize-none px-3.5 py-2.5 text-[14px] border-[1.5px] border-[--color-line] rounded-xl bg-white text-[--color-ink] placeholder:text-[--color-muted] outline-none focus:border-[--color-clay] transition-colors"
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send()
            }
          }}
        />
        <button
          onClick={send}
          disabled={sending || !content.trim()}
          className="px-4 py-2.5 rounded-xl text-[14px] font-semibold text-white shrink-0 transition-opacity disabled:opacity-40"
          style={{ backgroundColor: 'var(--color-clay)' }}
        >
          {sending ? '…' : 'Send'}
        </button>
      </div>
      <p className="text-[11px] text-[--color-muted] mt-1.5 text-center">
        Enter to send · Shift+Enter for new line
      </p>
    </div>
  )
}
