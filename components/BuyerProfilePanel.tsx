'use client'

import { useCallback, useEffect, useState } from 'react'
import { getBuyerConversations, type ConversationPreview } from '@/lib/supabase/queries'
import MessageThread from '@/components/MessageThread'

interface Props {
  open: boolean
  onClose: () => void
  userId: string
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

export default function BuyerProfilePanel({ open, onClose, userId }: Props) {
  const [conversations, setConversations] = useState<ConversationPreview[]>([])
  const [activeConv, setActiveConv] = useState<ConversationPreview | null>(null)

  const loadConversations = useCallback(async () => {
    const convs = await getBuyerConversations(userId)
    setConversations(convs)
  }, [userId])

  useEffect(() => {
    if (open) {
      loadConversations()
      setActiveConv(null)
    }
  }, [open, loadConversations])

  useEffect(() => {
    if (!open) return
    const interval = setInterval(loadConversations, 10000)
    return () => clearInterval(interval)
  }, [open, loadConversations])

  if (!open) return null

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div
        className="rounded-2xl border flex flex-col overflow-hidden shadow-2xl"
        style={{ width: 320, background: 'white', borderColor: 'var(--color-line)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ background: 'var(--color-paper)', borderColor: 'var(--color-line)' }}
        >
          {activeConv ? (
            <button
              onClick={() => setActiveConv(null)}
              className="flex items-center gap-1.5 text-[14px] font-semibold"
              style={{ color: 'var(--color-ink)' }}
            >
              <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              {activeConv.realtorName}
            </button>
          ) : (
            <span className="text-[14px] font-semibold" style={{ color: 'var(--color-ink)' }}>
              Messages
            </span>
          )}
          <button
            onClick={onClose}
            className="p-1 rounded-md transition-colors"
            style={{ color: 'var(--color-muted)' }}
            aria-label="Close messages"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        {/* Body */}
        {activeConv ? (
          <div className="p-4 overflow-y-auto" style={{ maxHeight: 420 }}>
            <MessageThread
              buyerId={userId}
              realtorId={activeConv.realtorId}
              senderRole="buyer"
              otherName={activeConv.realtorName}
            />
          </div>
        ) : (
          <div className="overflow-y-auto" style={{ maxHeight: 420 }}>
            {conversations.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-[13px]" style={{ color: 'var(--color-muted)' }}>
                  No conversations yet.
                </p>
                <p className="text-[12px] mt-1" style={{ color: 'var(--color-muted)' }}>
                  Open a realtor profile and tap Message to get started.
                </p>
              </div>
            ) : (
              <ul>
                {conversations.map((conv) => (
                  <li key={conv.realtorId}>
                    <button
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left border-b last:border-0 transition-colors hover:bg-[--color-paper]"
                      style={{ borderColor: 'var(--color-line)' }}
                      onClick={() => setActiveConv(conv)}
                    >
                      <div
                        className="w-10 h-10 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-[15px] font-bold"
                        style={{ background: 'var(--color-paper-deep)', color: 'var(--color-ink-soft)' }}
                      >
                        {conv.realtorPhoto ? (
                          <img
                            src={conv.realtorPhoto}
                            alt={conv.realtorName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          conv.realtorName[0]
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] font-semibold truncate" style={{ color: 'var(--color-ink)' }}>
                          {conv.realtorName}
                        </p>
                        <p className="text-[12px] truncate" style={{ color: 'var(--color-muted)' }}>
                          {conv.lastSenderRole === 'buyer' ? 'You: ' : ''}
                          {conv.lastMessage}
                        </p>
                      </div>
                      <span
                        className="text-[11px] shrink-0 self-start mt-0.5"
                        style={{ color: 'var(--color-muted)' }}
                      >
                        {timeAgo(conv.lastMessageAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
