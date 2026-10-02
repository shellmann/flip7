import { useCallback, useEffect, useState } from 'react'
import { Menu as MenuIcon } from 'lucide-react'
import GameOver from './GameOver'
import History from './History'
import Menu from './Menu'
import NoticeToast from './NoticeToast'
import RoundEntry from './RoundEntry'
import Rules from './Rules'
import Scoreboard from './Scoreboard'
import Setup from './Setup'
import UpdateToast from './UpdateToast'
import { addRound, dealerIndex, isOver, newGame, newId, undoLastRound, updateEntry } from './game'
import { collectHighlightsSince, type ReleaseNote } from './releaseNotes'
import { DATA_KEY, SETTINGS, emptyData, loadData, readLocal, rememberPlayers, saveData, withGame, writeLocal } from './storage'
import { applyTheme, loadTheme, saveTheme, watchSystemTheme, type Theme } from './theme'
import { useWakeLock } from './wakeLock'
import type { AppData, Entry, RecentPlayer } from './types'

type Entering = { edit?: { roundId: string; playerId: string } } | null
type Sheet = 'rules' | 'history' | null
type Notice = { id: string; text: string; undo?: () => void } | null

export default function App() {
  const [data, setDataState] = useState<AppData>(loadData)
  const [theme, setThemeState] = useState<Theme>(loadTheme)
  const [largeText, setLargeText] = useState(() => readLocal(SETTINGS.largeText, false))
  const [wakeLock, setWakeLock] = useState(() => readLocal(SETTINGS.wakeLock, true))
  const [menuOpen, setMenuOpen] = useState(false)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [entering, setEntering] = useState<Entering>(null)
  const [overviewGameId, setOverviewGameId] = useState<string | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [updateNotes, setUpdateNotes] = useState<ReleaseNote[]>(() => {
    const last = readLocal<string | null>(SETTINGS.lastSeenVersion, null)
    // Echte Erststarter bekommen kein "Neu in Version X".
    return last === null ? [] : collectHighlightsSince(last)
  })

  const setData = useCallback((next: AppData) => {
    setDataState(next)
    saveData(next)
  }, [])

  useEffect(() => { writeLocal(SETTINGS.lastSeenVersion, __APP_VERSION__) }, [])
  useEffect(() => watchSystemTheme(() => theme), [theme])
  useEffect(() => { document.documentElement.classList.toggle('large-text', largeText) }, [largeText])
  useEffect(() => { if (!notice) return; const t = window.setTimeout(() => setNotice(null), 8000); return () => window.clearTimeout(t) }, [notice])
  useWakeLock(wakeLock)

  const game = data.current
  const over = game ? isOver(game) : false

  // Spielstand ändern; ein beendetes Spiel, das wieder offen ist, zeigt wieder die normale Übersicht.
  const commit = (next: ReturnType<typeof newGame> | null) => {
    setData(withGame(data, next))
    if (!next || !isOver(next)) setOverviewGameId(null)
  }

  const startGame = (players: RecentPlayer[], target: number, firstDealer: number) => {
    const g = newGame(players.map((p) => ({ ...p, id: newId() })), target, firstDealer)
    setData(withGame(rememberPlayers(data, players), g))
    setOverviewGameId(null)
  }

  const sameAgain = () => {
    if (!game) return
    const fresh = newGame(game.players, game.target, dealerIndex(game, game.rounds.length))
    setData(withGame(data, fresh))
    setOverviewGameId(null)
  }

  const saveRound = (entries: Record<string, Entry>) => {
    if (!game) return
    const next = addRound(game, entries)
    commit(next)
    setEntering(null)
    if (!isOver(next)) {
      setNotice({
        id: newId(),
        text: `Runde ${next.rounds.length} gespeichert.`,
        undo: () => {
          setData(withGame({ ...data, current: next }, undoLastRound(next)))
          setNotice(null)
        },
      })
    }
  }

  const saveEdit = (roundId: string, playerId: string, entry: Entry) => {
    if (!game) return
    commit(updateEntry(game, roundId, playerId, entry))
    setEntering(null)
  }

  const setTheme = (t: Theme) => { setThemeState(t); saveTheme(t) }
  const resetAll = () => {
    try {
      localStorage.removeItem(DATA_KEY)
      Object.values(SETTINGS).forEach((k) => localStorage.removeItem(k))
    } catch { /* nichts zu löschen */ }
    setDataState(emptyData())
    setThemeState('system'); applyTheme('system')
    setLargeText(false); setWakeLock(true)
    setOverviewGameId(null); setMenuOpen(false); setNotice(null)
  }

  const showGameOver = !!game && over && overviewGameId !== game.id

  return (
    <div className="app">
      <header className="topbar">
        <h1>🃏 Flip 7 Zähler</h1>
        <button type="button" className="btn btn-secondary btn-menu" onClick={() => setMenuOpen(true)}>
          <MenuIcon size={26} aria-hidden /> Menü
        </button>
      </header>

      <main className="main">
        {!game ? (
          <Setup recent={data.recentPlayers} onStart={startGame} />
        ) : showGameOver ? (
          <GameOver
            game={game}
            onSamePlayers={sameAgain}
            onOverview={() => setOverviewGameId(game.id)}
            onNewGame={() => commit(null)}
          />
        ) : (
          <Scoreboard
            game={game}
            finished={over}
            onEnterRound={() => setEntering({})}
            onUndo={() => { commit(undoLastRound(game)); setNotice(null) }}
            onEditEntry={(roundId, playerId) => setEntering({ edit: { roundId, playerId } })}
            onShowResult={() => setOverviewGameId(null)}
          />
        )}
      </main>

      {entering && game && (
        <RoundEntry
          game={game}
          edit={entering.edit}
          onSaveRound={saveRound}
          onSaveEdit={saveEdit}
          onClose={() => setEntering(null)}
        />
      )}

      {sheet === 'rules' && <Rules onClose={() => setSheet(null)} />}
      {sheet === 'history' && <History history={data.history} onClose={() => setSheet(null)} />}

      {menuOpen && (
        <Menu
          theme={theme}
          onTheme={setTheme}
          largeText={largeText}
          onLargeText={(v) => { setLargeText(v); writeLocal(SETTINGS.largeText, v) }}
          wakeLock={wakeLock}
          onWakeLock={(v) => { setWakeLock(v); writeLocal(SETTINGS.wakeLock, v) }}
          hasRunningGame={!!game && !over}
          hasHistory={data.history.length > 0}
          onAbortGame={() => { commit(null); setMenuOpen(false) }}
          onClearHistory={() => setData({ ...data, history: [] })}
          onResetAll={resetAll}
          onRules={() => { setMenuOpen(false); setSheet('rules') }}
          onHistory={() => { setMenuOpen(false); setSheet('history') }}
          onClose={() => setMenuOpen(false)}
        />
      )}

      {notice && !entering ? (
        <NoticeToast
          text={notice.text}
          actionLabel={notice.undo ? 'Rückgängig' : undefined}
          onAction={notice.undo}
          onDismiss={() => setNotice(null)}
        />
      ) : (
        updateNotes.length > 0 && !entering && <UpdateToast notes={updateNotes} onDismiss={() => setUpdateNotes([])} />
      )}
    </div>
  )
}

