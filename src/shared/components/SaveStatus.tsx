import '../styles/ui.css'

/** 自動保存の状態表示（共通実装）。保存待ちの間は「編集中」、保存後は「保存済み」 */
export default function SaveStatus({ isDirty }: { isDirty: boolean }) {
  return isDirty
    ? <span className="save-status save-status--editing" role="status">編集中</span>
    : <span className="save-status save-status--saved" role="status">保存済み</span>
}
