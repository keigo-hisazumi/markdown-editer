import { SearchIcon } from './Icons'
import '../styles/ui.css'

interface Props {
  value: string
  onChange: (value: string) => void
  placeholder: string
}

/** 一覧の上部に置く検索欄（共通実装） */
export default function SearchBar({ value, onChange, placeholder }: Props) {
  return (
    <div className="search-bar-wrap">
      <label className="search-bar">
        <SearchIcon className="search-icon" />
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          type="search"
          className="search-input"
          placeholder={placeholder}
          aria-label={placeholder}
        />
      </label>
    </div>
  )
}
