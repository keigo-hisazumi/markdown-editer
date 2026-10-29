import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useArticlesStore } from '@/stores/articles'
import type { ArticleStatus } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import ArticleListItem from '@/components/ArticleListItem'
import AppHeader from '@/shared/components/AppHeader'
import DrawerMenu from '@/shared/components/DrawerMenu'
import EditorNav from '@/shared/components/EditorNav'
import EmptyState from '@/shared/components/EmptyState'
import IconButton from '@/shared/components/IconButton'
import NoSelection from '@/shared/components/NoSelection'
import SaveStatus from '@/shared/components/SaveStatus'
import SearchBar from '@/shared/components/SearchBar'
import { SwipeableList } from '@/shared/components/SwipeableList'
import { TrashListItem, TrashToolbar } from '@/shared/components/Trash'
import { MenuDivider, MenuItem, Popover } from '@/shared/components/Popover'
import { ComposeIcon, MoreIcon, TrashIcon } from '@/shared/components/Icons'
import { useAutoResize } from '@/shared/hooks/useAutoResize'
import { useDebouncedTask } from '@/shared/hooks/useDebouncedTask'
import { useDocumentClick } from '@/shared/hooks/useDocumentClick'
import { useIsMobile } from '@/shared/hooks/useIsMobile'
import { useTitleBodyKeys } from '@/shared/hooks/useTitleBodyKeys'
import { useVisualViewport } from '@/shared/hooks/useVisualViewport'
import { confirmEmptyTrash, confirmPermanentDelete } from '@/shared/lib/confirm'
import { renderMarkdown } from '@/lib/renderMarkdown'
import './ArticleView.css'

type ViewMode = 'all' | 'draft' | 'published' | 'trash'

const VIEW_TITLES: Record<ViewMode, string> = {
  all: 'すべての記事',
  draft: '作成中',
  published: '投稿済み',
  trash: 'ゴミ箱',
}

// サーバー（Firestore）への同期のデバウンス時間（ミリ秒）。
// 編集内容はローカルへ即時保存され、この時間キー入力が止まるとサーバーへも反映される。
// 1 打鍵ごとに書き込むとネットワーク遅延で更新が前後する可能性があるため、
// ローカルと同様「リアルタイム」に見える範囲で短い時間だけデバウンスする。
const SERVER_SYNC_DEBOUNCE_MS = 400

function ListIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
      <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
    </svg>
  )
}

function PenIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
    </svg>
  )
}

function CheckCircleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}

function EyeIcon({ off }: { off: boolean }) {
  return off ? (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

export default function ArticleView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const articlesStore = useArticlesStore()
  // セレクタで毎レンダー新しい配列を返すと useSyncExternalStore の getSnapshot が
  // 不安定になり無限再レンダー（React error #185）になるため、
  // ストアからは all をそのまま購読し、派生リストは useMemo で計算する
  const all = useArticlesStore((s) => s.all)
  const articles = useMemo(() => all.filter((a) => !a.deletedAt), [all])
  const trashedArticles = useMemo(() => all.filter((a) => !!a.deletedAt), [all])
  const userEmail = useAuthStore((s) => s.user?.email ?? '')
  const logout = useAuthStore((s) => s.logout)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)
  const isMobile = useIsMobile()
  useVisualViewport()

  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const titleRef = useRef<HTMLTextAreaElement | null>(null)
  const editorScrollRef = useRef<HTMLDivElement | null>(null)
  const focusContentOnNextSelectionRef = useRef(false)
  const { onTitleKeyDown, onBodyKeyDown } = useTitleBodyKeys(titleRef, textareaRef)

  // キー入力が SERVER_SYNC_DEBOUNCE_MS 止まったらサーバー（Firestore）へ同期する。
  // ローカルと同様、入力のたびに（少し遅れて）サーバーへも反映されるようにする。
  // アンマウント時には予約済みの同期を必ず実行する。
  const serverSync = useDebouncedTask(SERVER_SYNC_DEBOUNCE_MS)

  const selectedId = searchParams.get('id') ?? undefined
  const showEditor = !!selectedId

  const currentArticleStatus: ArticleStatus = useArticlesStore((s) =>
    selectedId ? (s.all.find((a) => a.id === selectedId)?.status ?? 'draft') : 'draft',
  )

  const filteredArticles = useMemo(() => {
    let list = articles
    if (viewMode === 'draft' || viewMode === 'published') {
      list = list.filter((a) => a.status === viewMode)
    }
    const q = searchQuery.trim().toLowerCase()
    if (!q) return list
    return list.filter((a) =>
      a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q),
    )
  }, [articles, viewMode, searchQuery])

  const renderedContent = useMemo(
    () => renderMarkdown(content),
    [content],
  )

  useDocumentClick(() => setMenuOpen(false))

  // 記事の切り替え時にエディタへ内容を読み込む。
  // 選択中の記事が変わっていない場合でも、他デバイスでの更新がサーバーから
  // 届いて all が変化したときは、編集中でなければエディタへ反映する。
  const prevSelectedIdRef = useRef<string | undefined>(undefined)
  useEffect(() => {
    if (!selectedId) {
      prevSelectedIdRef.current = undefined
      return
    }
    const article = all.find((a) => a.id === selectedId)
    if (!article) return

    const isNewSelection = prevSelectedIdRef.current !== selectedId
    prevSelectedIdRef.current = selectedId

    if (isNewSelection) {
      setTitle(article.title)
      setContent(article.content)
      setIsDirty(false)
      setIsPreview(false)
      if (focusContentOnNextSelectionRef.current) {
        focusContentOnNextSelectionRef.current = false
        setTimeout(() => textareaRef.current?.focus(), 0)
      }
      return
    }

    // 編集中に他デバイスの更新で上書きしないよう、未編集のときだけ反映する
    if (!isDirty && (article.title !== title || article.content !== content)) {
      setTitle(article.title)
      setContent(article.content)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, all, isDirty])

  useEffect(() => {
    // Firestore のリアルタイム購読を開始し、デバイス間で記事を同期する
    articlesStore.subscribe()
    return () => articlesStore.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // タイトル・本文の textarea を内容に合わせて自動リサイズする
  useAutoResize(titleRef, editorScrollRef, [title, isPreview, selectedId])
  useAutoResize(textareaRef, editorScrollRef, [content, isPreview, selectedId])

  function scheduleServerSync(id: string): void {
    serverSync.schedule(() => {
      setIsDirty(false)
      useArticlesStore.getState().syncToServer(id)
    })
  }

  async function saveArticle() {
    if (!selectedId) return
    serverSync.cancel()
    await articlesStore.save(selectedId, title, content)
    setIsDirty(false)
  }

  function handleViewMode(mode: ViewMode) {
    setViewMode(mode)
    if (selectedId) {
      if (isDirty) saveArticle()
      setSearchParams({})
    }
  }

  function onTitleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    // タイトルは 1 行として扱う（貼り付けた改行は空白にする）
    const value = e.target.value.replace(/\r?\n/g, ' ')
    setTitle(value)
    setIsDirty(true)
    // 編集内容をローカルへリアルタイムに保存し、サーバーへもすぐに同期する
    if (selectedId) {
      articlesStore.saveLocal(selectedId, value, content)
      scheduleServerSync(selectedId)
    }
  }

  function onContentInput(e: ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setContent(value)
    setIsDirty(true)
    // 編集内容をローカルへリアルタイムに保存し、サーバーへもすぐに同期する
    if (selectedId) {
      articlesStore.saveLocal(selectedId, title, value)
      scheduleServerSync(selectedId)
    }
  }

  function togglePreview() {
    if (!isPreview && isDirty) saveArticle()
    setIsPreview((v) => !v)
  }

  function onMenuSave() {
    saveArticle()
    setMenuOpen(false)
  }

  async function onMenuToggleStatus() {
    if (!selectedId) return
    setMenuOpen(false)
    const next: ArticleStatus = currentArticleStatus === 'published' ? 'draft' : 'published'
    await articlesStore.updateStatus(selectedId, next)
    setIsDirty(false)
  }

  async function onMenuTrash() {
    if (!selectedId) return
    setMenuOpen(false)
    if (isDirty) await saveArticle()
    await articlesStore.trash(selectedId)
    setSearchParams({})
  }

  // 一覧のスワイプ操作からゴミ箱へ移動する
  async function handleListTrash(id: string) {
    if (isDirty && selectedId === id) await saveArticle()
    await articlesStore.trash(id)
    if (selectedId === id) setSearchParams({})
  }

  async function handlePermanentDelete(id: string) {
    if (!confirmPermanentDelete('記事')) return
    await articlesStore.permanentDelete(id)
  }

  async function handleEmptyTrash() {
    if (trashedArticles.length === 0) return
    if (!confirmEmptyTrash('記事', trashedArticles.length)) return
    await articlesStore.emptyTrash()
  }

  function handleSelect(id: string) {
    if (isDirty && selectedId) saveArticle()
    setSearchParams({ id })
  }

  async function handleCreate() {
    if (isDirty && selectedId) await saveArticle()
    // ゴミ箱・投稿済みを表示中に新規作成した場合は、作成した記事（作成中）が見える一覧へ切り替える
    if (viewMode === 'trash' || viewMode === 'published') setViewMode('all')
    const article = await articlesStore.createArticle()
    focusContentOnNextSelectionRef.current = true
    setSearchParams({ id: article.id })
  }

  function handleBack() {
    if (isDirty && selectedId) saveArticle()
    setSearchParams({})
  }

  async function handleLogout() {
    if (isDirty && selectedId) await saveArticle()
    await logout()
    setSearchParams({})
  }

  const drawerItems = [
    { key: 'all', label: 'すべて', icon: <ListIcon /> },
    { key: 'draft', label: '作成中', icon: <PenIcon /> },
    { key: 'published', label: '投稿済み', icon: <CheckCircleIcon /> },
    { key: 'trash', label: 'ゴミ箱', icon: <TrashIcon />, badge: trashedArticles.length },
  ].map((item) => ({
    ...item,
    active: viewMode === item.key,
    onSelect: () => handleViewMode(item.key as ViewMode),
  }))

  return (
    <div className="split-app">
      {/* サイドバー（記事一覧） */}
      <div className={`split-sidebar${isMobile && showEditor ? ' mobile-hidden' : ''}`}>
        <AppHeader
          left={
            <DrawerMenu
              email={userEmail}
              items={drawerItems}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onLogout={handleLogout}
            />
          }
          title={VIEW_TITLES[viewMode]}
          right={viewMode !== 'trash' ? (
            <IconButton label="新規作成" onClick={handleCreate}>
              <ComposeIcon />
            </IconButton>
          ) : undefined}
        />

        {viewMode !== 'trash' ? (
          <>
            <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="記事を検索" />
            <div className="list-scroll">
              {filteredArticles.length === 0 ? (
                searchQuery.trim()
                  ? <EmptyState message="一致する記事がありません" />
                  : <EmptyState message="記事がありません" hint="右上のボタンで記事を追加しましょう" />
              ) : (
                <SwipeableList>
                  {filteredArticles.map((article) => (
                    <ArticleListItem
                      key={article.id}
                      article={article}
                      active={selectedId === article.id}
                      onSelect={handleSelect}
                      onTrash={handleListTrash}
                    />
                  ))}
                </SwipeableList>
              )}
            </div>
          </>
        ) : (
          /* ゴミ箱 */
          <>
            <TrashToolbar count={trashedArticles.length} onEmpty={handleEmptyTrash} />
            <div className="list-scroll">
              {trashedArticles.length === 0 ? (
                <EmptyState message="ゴミ箱は空です" icon={<TrashIcon size={40} />} />
              ) : (
                trashedArticles.map((article) => (
                  <TrashListItem
                    key={article.id}
                    title={article.title}
                    content={article.content}
                    deletedAt={article.deletedAt!}
                    untitledLabel="無題の記事"
                    onRestore={() => articlesStore.restore(article.id)}
                    onDelete={() => handlePermanentDelete(article.id)}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>

      {/* メインエリア（エディタ） */}
      <div className={`split-main${isMobile && !showEditor ? ' mobile-hidden' : ''}`}>
        <EditorNav showBack={isMobile} backLabel="記事一覧" onBack={handleBack}>
          {selectedId && (
            <>
              <SaveStatus isDirty={isDirty} />
              <IconButton label={isPreview ? '編集に戻る' : 'プレビュー'} onClick={togglePreview}>
                <EyeIcon off={isPreview} />
              </IconButton>
              <Popover label="その他" icon={<MoreIcon />} open={menuOpen} onOpenChange={setMenuOpen}>
                <MenuItem icon={<SaveIcon />} onClick={onMenuSave}>保存</MenuItem>
                <MenuDivider />
                <MenuItem icon={<CheckCircleIcon size={16} />} onClick={onMenuToggleStatus}>
                  {currentArticleStatus === 'published' ? '作成中に戻す' : '投稿済みにする'}
                </MenuItem>
                <MenuDivider />
                <MenuItem icon={<TrashIcon size={16} />} onClick={onMenuTrash} danger>
                  ゴミ箱に移動
                </MenuItem>
              </Popover>
            </>
          )}
          <IconButton label="新規作成" onClick={handleCreate}>
            <ComposeIcon />
          </IconButton>
        </EditorNav>

        {/* エディタ本体 */}
        {!selectedId ? (
          <NoSelection message="記事を選択してください" />
        ) : (
          <div className="editor-scroll" ref={editorScrollRef}>
            <textarea
              ref={titleRef}
              value={title}
              onChange={onTitleInput}
              onKeyDown={onTitleKeyDown}
              className="editor-title"
              placeholder="記事タイトル"
              rows={1}
              readOnly={isPreview}
            />
            {!isPreview ? (
              <textarea
                ref={textareaRef}
                value={content}
                onChange={onContentInput}
                onKeyDown={onBodyKeyDown}
                className="editor-body markdown-input"
                placeholder="Markdown で書いてください..."
                spellCheck={false}
              />
            ) : (
              <div
                className="preview-pane markdown-body"
                dangerouslySetInnerHTML={{ __html: renderedContent }}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}
