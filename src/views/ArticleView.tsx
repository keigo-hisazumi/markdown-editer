import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
} from 'react'
import { useSearchParams } from 'react-router-dom'
import { marked } from 'marked'
import {
  useArticlesStore,
  selectArticles,
  selectTrashedArticles,
} from '@/stores/articles'
import type { ArticleStatus } from '@/stores/articles'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import './ArticleView.css'

type ViewMode = 'all' | 'draft' | 'published' | 'trash'

function previewText(c: string): string {
  return c.replace(/[#*`>_[\]]/g, '').slice(0, 80).trim()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ja-JP', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit',
  })
}

export default function ArticleView() {
  const [searchParams, setSearchParams] = useSearchParams()
  const articlesStore = useArticlesStore()
  const articles = useArticlesStore(selectArticles)
  const trashedArticles = useArticlesStore(selectTrashedArticles)
  const userEmail = useAuthStore((s) => s.user?.email ?? '')
  const logout = useAuthStore((s) => s.logout)
  const isDark = useThemeStore((s) => s.isDark)
  const toggleTheme = useThemeStore((s) => s.toggleTheme)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isDirty, setIsDirty] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  const [windowWidth, setWindowWidth] = useState(window.innerWidth)
  const [viewMode, setViewMode] = useState<ViewMode>('all')

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const titleRef = useRef<HTMLTextAreaElement | null>(null)

  const isMobile = windowWidth < 768
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
    () => marked.parse(content, { async: false }),
    [content],
  )

  // 記事の切り替え時にエディタへ内容を読み込む
  useEffect(() => {
    if (!selectedId) return
    const article = useArticlesStore.getState().getById(selectedId)
    if (!article) return
    setTitle(article.title)
    setContent(article.content)
    setIsDirty(false)
    setIsPreview(false)
  }, [selectedId])

  useEffect(() => {
    articlesStore.fetchAll()
    const onResize = () => setWindowWidth(window.innerWidth)
    const closeMenu = () => setMenuOpen(false)
    window.addEventListener('resize', onResize)
    document.addEventListener('click', closeMenu)
    return () => {
      window.removeEventListener('resize', onResize)
      document.removeEventListener('click', closeMenu)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // アンマウント時に未保存の変更を保存する
  const latestRef = useRef({ isDirty, selectedId, title, content })
  useEffect(() => {
    latestRef.current = { isDirty, selectedId, title, content }
  })
  useEffect(() => {
    return () => {
      const latest = latestRef.current
      if (latest.isDirty && latest.selectedId) {
        useArticlesStore.getState().save(latest.selectedId, latest.title, latest.content)
      }
    }
  }, [])

  // タイトル・本文の textarea を内容に合わせて自動リサイズ
  useLayoutEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [title, isPreview, selectedId])

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = el.scrollHeight + 'px'
  }, [content, isPreview, selectedId])

  async function saveArticle() {
    if (!selectedId) return
    await articlesStore.save(selectedId, title, content)
    setIsDirty(false)
  }

  function handleViewMode(mode: ViewMode) {
    setViewMode(mode)
    setIsDrawerOpen(false)
    if (selectedId) {
      if (isDirty) saveArticle()
      setSearchParams({})
    }
  }

  function onTitleInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setTitle(e.target.value)
    setIsDirty(true)
  }

  function onContentInput(e: ChangeEvent<HTMLTextAreaElement>) {
    setContent(e.target.value)
    setIsDirty(true)
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

  async function handleRestore(id: string) {
    await articlesStore.restore(id)
  }

  async function handlePermanentDelete(id: string) {
    if (!confirm('この記事を完全に削除しますか？この操作は取り消せません。')) return
    await articlesStore.permanentDelete(id)
  }

  function handleSelect(id: string) {
    if (isDirty && selectedId) saveArticle()
    setSearchParams({ id })
  }

  async function handleCreate() {
    if (isDirty && selectedId) await saveArticle()
    const article = await articlesStore.createArticle()
    setSearchParams({ id: article.id })
  }

  function handleBack() {
    if (isDirty && selectedId) saveArticle()
    setSearchParams({})
  }

  async function handleLogout() {
    setIsDrawerOpen(false)
    if (isDirty && selectedId) await saveArticle()
    await logout()
    setSearchParams({})
  }

  return (
    <div className="article-app">
      {/* ドロワーオーバーレイ */}
      <div
        className={`drawer-overlay${isDrawerOpen ? ' open' : ''}`}
        onClick={() => setIsDrawerOpen(false)}
      />

      {/* 左スライドドロワー */}
      <aside
        className={`drawer${isDrawerOpen ? ' open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-hidden={!isDrawerOpen}
      >
        <div className="drawer-account">
          <div className="drawer-avatar">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
          <span className="drawer-email">{userEmail}</span>
        </div>
        <div className="drawer-divider" />

        {/* ビューモード切り替え */}
        <button
          className={`drawer-item${viewMode === 'all' ? ' drawer-item--active' : ''}`}
          onClick={() => handleViewMode('all')}
        >
          <span className="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
              <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
            </svg>
          </span>
          <span>すべて</span>
        </button>
        <button
          className={`drawer-item${viewMode === 'draft' ? ' drawer-item--active' : ''}`}
          onClick={() => handleViewMode('draft')}
        >
          <span className="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </span>
          <span>作成中</span>
        </button>
        <button
          className={`drawer-item${viewMode === 'published' ? ' drawer-item--active' : ''}`}
          onClick={() => handleViewMode('published')}
        >
          <span className="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </span>
          <span>投稿済み</span>
        </button>
        <button
          className={`drawer-item${viewMode === 'trash' ? ' drawer-item--active' : ''}`}
          onClick={() => handleViewMode('trash')}
        >
          <span className="drawer-item-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
              <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
            </svg>
          </span>
          <span>ゴミ箱</span>
          {trashedArticles.length > 0 && (
            <span className="trash-badge">{trashedArticles.length}</span>
          )}
        </button>

        <div className="drawer-divider" />
        <div className="drawer-bottom">
          <button className="drawer-item" onClick={toggleTheme}>
            <span className="drawer-item-icon">
              {isDark ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              )}
            </span>
            <span>{isDark ? 'ダークモード' : 'ライトモード'}</span>
          </button>
          <div className="drawer-divider" />
          <button className="drawer-item drawer-item--logout" onClick={handleLogout}>
            <span className="drawer-item-icon">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
            </span>
            <span>ログアウト</span>
          </button>
        </div>
      </aside>

      {/* サイドバー（記事一覧） */}
      <div className={`article-sidebar${isMobile && showEditor ? ' mobile-hidden' : ''}`}>
        <div className="sidebar-header">
          <button
            className={`btn-hamburger${isDrawerOpen ? ' open' : ''}`}
            onClick={() => setIsDrawerOpen((v) => !v)}
            aria-label="メニューを開く"
          >
            <span className="bar" /><span className="bar" /><span className="bar" />
          </button>
          <span className="sidebar-title">Markdown Editer</span>
          {viewMode !== 'trash' ? (
            <button className="btn-compose" onClick={handleCreate} aria-label="新規作成">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 20h9"/>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </button>
          ) : (
            <div style={{ width: '36px' }} />
          )}
        </div>

        {/* 記事一覧（ゴミ箱以外） */}
        {viewMode !== 'trash' ? (
          <>
            <div className="search-bar-wrap">
              <div className="search-bar">
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"/>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                </svg>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  type="search"
                  className="search-input"
                  placeholder="記事を検索"
                />
              </div>
            </div>

            {/* 記事リスト */}
            <div className="article-list">
              {filteredArticles.length === 0 && (
                <div className="empty-state">
                  <p>記事がありません</p>
                  <p className="empty-hint">右上のボタンで記事を追加しましょう</p>
                </div>
              )}
              {filteredArticles.map((article) => (
                <div
                  key={article.id}
                  className={`article-item${selectedId === article.id ? ' active' : ''}`}
                  onClick={() => handleSelect(article.id)}
                >
                  <div className="article-item-inner">
                    <div className="article-item-header">
                      <h2 className="article-title">{article.title || '無題の記事'}</h2>
                      <span className={`status-badge status-badge--${article.status}`}>
                        {article.status === 'published' ? '投稿済み' : '作成中'}
                      </span>
                    </div>
                    <p className="article-preview">{previewText(article.content)}</p>
                    <time className="article-date">{formatDate(article.updatedAt)}</time>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* ゴミ箱 */
          <div className="article-list">
            {trashedArticles.length === 0 && (
              <div className="empty-state">
                <p>ゴミ箱は空です</p>
              </div>
            )}
            {trashedArticles.map((article) => (
              <div key={article.id} className="article-item article-item--trash">
                <div className="article-item-inner">
                  <h2 className="article-title">{article.title || '無題の記事'}</h2>
                  <p className="article-preview">{previewText(article.content)}</p>
                  <time className="article-date">削除日: {formatDate(article.deletedAt!)}</time>
                  <div className="trash-actions">
                    <button className="trash-btn trash-btn--restore" onClick={() => handleRestore(article.id)}>
                      復元
                    </button>
                    <button className="trash-btn trash-btn--delete" onClick={() => handlePermanentDelete(article.id)}>
                      完全削除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* メインエリア（エディタ） */}
      <div className={`article-main${isMobile && !showEditor ? ' mobile-hidden' : ''}`}>
        <div className="editor-nav">
          {isMobile ? (
            <button className="btn-back" onClick={handleBack}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              <span>記事一覧</span>
            </button>
          ) : (
            <div className="nav-spacer" />
          )}

          <div className="nav-actions">
            {isDirty ? (
              <span className="editing-label">編集中</span>
            ) : selectedId ? (
              <span className="saved-label">保存済み</span>
            ) : null}

            {/* プレビュー切り替えボタン */}
            {selectedId && (
              <button className="nav-icon-btn" onClick={togglePreview} title={isPreview ? '編集に戻る' : 'プレビュー'}>
                {!isPreview ? (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                  </svg>
                ) : (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                    <line x1="1" y1="1" x2="23" y2="23"/>
                  </svg>
                )}
              </button>
            )}

            {/* メニュー */}
            {selectedId && (
              <div className="nav-icon-wrap">
                <button
                  className="nav-icon-btn"
                  onClick={(e) => {
                    e.stopPropagation()
                    setMenuOpen((v) => !v)
                  }}
                  title="その他"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <circle cx="12" cy="12" r="10"/>
                    <circle cx="7.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>
                    <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none"/>
                    <circle cx="16.5" cy="12" r="1.1" fill="currentColor" stroke="none"/>
                  </svg>
                </button>
                {menuOpen && (
                  <div className="action-menu" onClick={(e) => e.stopPropagation()}>
                    <button className="action-menu-item" onClick={onMenuSave}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                        <polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/>
                      </svg>
                      保存
                    </button>
                    <div className="action-menu-divider" />
                    <button className="action-menu-item" onClick={onMenuToggleStatus}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                        <polyline points="22 4 12 14.01 9 11.01"/>
                      </svg>
                      {currentArticleStatus === 'published' ? '作成中に戻す' : '投稿済みにする'}
                    </button>
                    <div className="action-menu-divider" />
                    <button className="action-menu-item action-menu-delete" onClick={onMenuTrash}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>
                      </svg>
                      ゴミ箱に移動
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* エディタ本体 */}
        {!selectedId ? (
          <div className="no-selection">
            <div className="no-selection-content">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>
              </svg>
              <p>記事を選択してください</p>
            </div>
          </div>
        ) : (
          <div className="editor-scroll">
            <textarea
              ref={titleRef}
              value={title}
              onChange={onTitleInput}
              className="title-input"
              placeholder="記事タイトル"
              rows={1}
              readOnly={isPreview}
            />
            {!isPreview ? (
              <div className="editor-pane">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={onContentInput}
                  className="markdown-input"
                  placeholder="Markdown で書いてください..."
                  spellCheck={false}
                />
              </div>
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
