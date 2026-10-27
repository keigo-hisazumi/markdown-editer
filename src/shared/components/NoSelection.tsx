import { NewDocumentIcon } from './Icons'
import '../styles/ui.css'

/** エディタ側で何も選択されていないときの表示（共通実装） */
export default function NoSelection({ message }: { message: string }) {
  return (
    <div className="no-selection">
      <div className="no-selection-content">
        <NewDocumentIcon />
        <p>{message}</p>
      </div>
    </div>
  )
}
