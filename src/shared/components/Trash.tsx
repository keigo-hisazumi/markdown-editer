import { formatDateTime, previewText } from '../lib/format'
import { RestoreIcon, TrashIcon } from './Icons'
import '../styles/ui.css'

interface ToolbarProps {
  count: number
  onEmpty: () => void
}

/** ゴミ箱の件数と「ゴミ箱を空にする」ボタン（共通実装） */
export function TrashToolbar({ count, onEmpty }: ToolbarProps) {
  return (
    <div className="trash-toolbar">
      <span className="trash-count">{count} 件</span>
      {count > 0 && (
        <button type="button" className="btn-outline btn-outline--danger" onClick={onEmpty}>
          ゴミ箱を空にする
        </button>
      )}
    </div>
  )
}

interface ItemProps {
  title: string
  content: string
  deletedAt: Date | string
  /** タイトルが空のときの表示（「無題のメモ」など） */
  untitledLabel: string
  onRestore: () => void
  onDelete: () => void
}

/** ゴミ箱内の項目。復元と完全削除のボタンを持つ（共通実装） */
export function TrashListItem({ title, content, deletedAt, untitledLabel, onRestore, onDelete }: ItemProps) {
  return (
    <div className="trash-item">
      <div className="trash-item-body">
        <p className="list-item-title">{title || untitledLabel}</p>
        <p className="list-item-preview">{previewText(content) || '内容なし'}</p>
        <p className="list-item-meta">削除日時: {formatDateTime(deletedAt)}</p>
      </div>
      <div className="trash-item-actions">
        <button type="button" className="btn-outline" onClick={onRestore}>
          <RestoreIcon />
          復元
        </button>
        <button type="button" className="btn-outline btn-outline--danger" onClick={onDelete}>
          <TrashIcon size={16} />
          完全削除
        </button>
      </div>
    </div>
  )
}
