import { type ReactNode } from 'react'

type Block =
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] }

function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null
  let partIndex = 0

  while ((match = pattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      nodes.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    const key = `${keyPrefix}-inline-${partIndex++}`
    if (token.startsWith('**')) {
      nodes.push(<strong key={key}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith('*')) {
      nodes.push(<em key={key}>{token.slice(1, -1)}</em>)
    } else if (token.startsWith('`')) {
      nodes.push(<code key={key}>{token.slice(1, -1)}</code>)
    }
    lastIndex = match.index + token.length
  }

  if (lastIndex < text.length) {
    nodes.push(text.slice(lastIndex))
  }

  return nodes.length ? nodes : [text]
}

function parseBlocks(content: string): Block[] {
  const lines = content.replace(/\r\n/g, '\n').split('\n')
  const blocks: Block[] = []
  let listType: 'ul' | 'ol' | null = null
  let listItems: string[] = []

  const flushList = () => {
    if (!listType || listItems.length === 0) return
    blocks.push({ type: listType, items: [...listItems] })
    listType = null
    listItems = []
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    const trimmed = line.trim()

    if (!trimmed) {
      flushList()
      continue
    }

    const heading = trimmed.match(/^#{1,3}\s*(.+)$/)
    if (heading) {
      flushList()
      const level = trimmed.match(/^#+/)![0].length
      const text = heading[1].trim()
      if (level <= 2) {
        blocks.push({ type: 'h3', text })
      } else {
        blocks.push({ type: 'h4', text })
      }
      continue
    }

    const ul = trimmed.match(/^[-*•]\s+(.+)$/)
    if (ul) {
      if (listType !== 'ul') {
        flushList()
        listType = 'ul'
      }
      listItems.push(ul[1])
      continue
    }

    const ol = trimmed.match(/^\d+[.)]\s+(.+)$/)
    if (ol) {
      if (listType !== 'ol') {
        flushList()
        listType = 'ol'
      }
      listItems.push(ol[1])
      continue
    }

    flushList()
    blocks.push({ type: 'p', text: trimmed })
  }

  flushList()
  return blocks
}

type ChatMessageContentProps = {
  content: string
  variant?: 'assistant' | 'user'
}

export default function ChatMessageContent({ content, variant = 'assistant' }: ChatMessageContentProps) {
  if (!content.trim()) return null

  const blocks = parseBlocks(content)

  if (blocks.length === 0) {
    return <div className="message-content message-content--plain">{content}</div>
  }

  return (
    <div className={`message-content message-content--rich message-content--${variant}`}>
      {blocks.map((block, index) => {
        const key = `block-${index}`
        switch (block.type) {
          case 'h3':
            return (
              <h3 key={key} className="chat-md-h3">
                {renderInline(block.text, key)}
              </h3>
            )
          case 'h4':
            return (
              <h4 key={key} className="chat-md-h4">
                {renderInline(block.text, key)}
              </h4>
            )
          case 'ul':
            return (
              <ul key={key} className="chat-md-list">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ul>
            )
          case 'ol':
            return (
              <ol key={key} className="chat-md-list chat-md-list--ordered">
                {block.items.map((item, i) => (
                  <li key={`${key}-${i}`}>{renderInline(item, `${key}-${i}`)}</li>
                ))}
              </ol>
            )
          case 'p':
          default:
            return (
              <p key={key} className="chat-md-p">
                {renderInline(block.text, key)}
              </p>
            )
        }
      })}
    </div>
  )
}
