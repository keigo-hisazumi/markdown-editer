import type { Article } from '@/stores/articles'
import { SwipeableListItem } from '@/shared/components/SwipeableList'
import { formatDateTime, previewText } from '@/shared/lib/format'

interface Props {
  article: Article
  active: boolean
  onSelect: (id: string) => void
  onTrash: (id: string) => void
}

/**
 * 記事一覧の項目。タッチ操作で左にスワイプすると「ゴミ箱」ボタンを表示する。
 * スワイプ操作と見た目の土台は共通実装（SwipeableListItem）を使い、
 * 状態バッジ（作成中 / 投稿済み）だけをこのアプリ固有に表示する。
 */
export default function ArticleListItem({ article, active, onSelect, onTrash }: Props) {
  return (
    <SwipeableListItem id={article.id} active={active} onSelect={onSelect} onAction={onTrash}>
      <div className="list-item-inner">
        <div className="list-item-main">
          <div className="list-item-header">
            <h2 className="list-item-title">{article.title || '無題の記事'}</h2>
            <span className={`status-badge status-badge--${article.status}`}>
              {article.status === 'published' ? '投稿済み' : '作成中'}
            </span>
          </div>
          <p className="list-item-preview">{previewText(article.content) || '内容なし'}</p>
          <time className="list-item-meta">{formatDateTime(article.updatedAt)}</time>
        </div>
      </div>
    </SwipeableListItem>
  )
}
