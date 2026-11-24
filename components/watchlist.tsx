"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Reveal from "./reveal";
import VideoCard from "./video-card";
import { useLang } from "./lang-context";
import {
  EMPTY_STORE,
  LOCK_MS,
  MAX_ATTEMPTS,
  fetchVideoMeta,
  loadWatchStore,
  parseYouTubeId,
  saveWatchStore,
  verifyPin,
  type AddedVideo,
  type WatchGroup,
  type WatchStore,
  type WatchVideo,
} from "@/lib/watchlist";

type GroupView = {
  id: string;
  title: string;
  note: string;
  custom: boolean;
  items: WatchVideo[];
};

type Pending =
  | { kind: "add-video" }
  | { kind: "add-group" }
  | { kind: "remove-video"; video: WatchVideo }
  | { kind: "remove-group"; group: GroupView }
  | { kind: "move-video"; video: WatchVideo; toGroup: GroupView };

export default function Watchlist() {
  const { t } = useLang();
  const videos = t.productivity.videos;

  const [store, setStore] = useState<WatchStore>(EMPTY_STORE);
  const [pending, setPending] = useState<Pending | null>(null);
  const [step, setStep] = useState<"pin" | "form">("pin");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);
  const groupNameRef = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, setTick] = useState(0);

  const [url, setUrl] = useState("");
  const [groupChoice, setGroupChoice] = useState(videos.groups[0]?.id ?? "");
  const [customGroup, setCustomGroup] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [groupTitle, setGroupTitle] = useState("");
  const [groupNote, setGroupNote] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [exported, setExported] = useState(false);

  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);

  useEffect(() => {
    setStore(loadWatchStore());
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = window.setInterval(() => setTick((value) => value + 1), 500);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  const lockedFor = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  const locked = lockedFor > 0;
  const dialogOpen = pending !== null;

  const update = useCallback((next: WatchStore) => {
    setStore(next);
    saveWatchStore(next);
  }, []);

  const closeDialog = useCallback(() => {
    setPending(null);
    setStep("pin");
    setPin("");
    setPinError("");
    setFormError("");
  }, []);

  const openAction = useCallback((action: Pending) => {
    setPin("");
    setPinError("");
    setFormError("");
    setStep("pin");
    setPending(action);
  }, []);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (dialogOpen && !element.open) element.showModal();
    if (!dialogOpen && element.open) element.close();
  }, [dialogOpen]);

  useEffect(() => {
    if (!pending) return;
    const timer = window.setTimeout(() => {
      if (step === "form" && pending.kind === "add-video") urlRef.current?.focus();
      else if (step === "form" && pending.kind === "add-group") groupNameRef.current?.focus();
      else pinRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [pending, step]);

  useEffect(() => {
    if (!dialogOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dialogOpen]);

  const selectableGroups = useMemo(
    () => [
      ...videos.groups.map((group) => ({ id: group.id, title: group.title })),
      ...store.groups
        .filter((group) => !store.removedGroups.includes(group.id))
        .map((group) => ({ id: group.id, title: group.title })),
    ],
    [videos.groups, store.groups, store.removedGroups],
  );

  const { groups, placement, index } = useMemo(() => {
    const removed = new Set(store.removed);
    const hidden = new Set(store.removedGroups);

    const views: GroupView[] = [
      ...videos.groups
        .filter((group) => !hidden.has(group.id))
        .map((group) => ({
          id: group.id,
          title: group.title,
          note: group.note,
          custom: false,
          items: [] as WatchVideo[],
        })),
      ...store.groups
        .filter((group) => !hidden.has(group.id))
        .map((group) => ({
          id: group.id,
          title: group.title,
          note: group.note,
          custom: true,
          items: [] as WatchVideo[],
        })),
    ];

    const byId = new Map(views.map((view) => [view.id, view]));
    const placement: Record<string, string> = {};
    const index: Record<string, WatchVideo> = {};

    for (const group of videos.groups) {
      for (const item of group.items) {
        if (removed.has(item.id)) continue;
        index[item.id] = { id: item.id, title: item.title, author: item.author, url: item.url };
        const target = byId.get(store.moved[item.id] ?? group.id);
        if (!target) continue;
        target.items.push(index[item.id]);
        placement[item.id] = target.id;
      }
    }

    for (const added of store.added) {
      if (removed.has(added.id)) continue;
      const video: WatchVideo = {
        id: added.id,
        title: added.title,
        author: added.author,
        url: added.url,
      };
      index[added.id] = video;
      const target = byId.get(store.moved[added.id] ?? added.groupId);
      if (!target) continue;
      target.items.push(video);
      placement[added.id] = target.id;
    }

    return { groups: views, placement, index };
  }, [videos.groups, store]);

  const removeVideo = useCallback(
    (video: WatchVideo) => {
      const isAdded = store.added.some((item) => item.id === video.id);
      if (isAdded) {
        update({ ...store, added: store.added.filter((item) => item.id !== video.id) });
      } else {
        update({ ...store, removed: Array.from(new Set([...store.removed, video.id])) });
      }
    },
    [store, update],
  );

  const hideGroup = useCallback(
    (groupId: string) => {
      update({
        ...store,
        removedGroups: Array.from(new Set([...store.removedGroups, groupId])),
      });
    },
    [store, update],
  );

  const moveVideo = useCallback(
    (videoId: string, groupId: string) => {
      update({ ...store, moved: { ...store.moved, [videoId]: groupId } });
    },
    [store, update],
  );

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || locked) return;
    if (!/^\d{6}$/.test(pin)) {
      setPinError(videos.pinWrong.replace("{n}", String(MAX_ATTEMPTS - attempts)));
      return;
    }
    const ok = await verifyPin(pin);
    if (!ok) {
      const next = attempts + 1;
      setPin("");
      if (next >= MAX_ATTEMPTS) {
        setAttempts(0);
        setLockedUntil(Date.now() + LOCK_MS);
        setPinError(videos.pinLocked.replace("{s}", String(Math.round(LOCK_MS / 1000))));
      } else {
        setAttempts(next);
        setPinError(videos.pinWrong.replace("{n}", String(MAX_ATTEMPTS - next)));
      }
      return;
    }
    setPin("");
    setPinError("");
    setAttempts(0);

    if (pending.kind === "add-video" || pending.kind === "add-group") {
      setStep("form");
      return;
    }

    if (pending.kind === "remove-video") removeVideo(pending.video);
    if (pending.kind === "remove-group") hideGroup(pending.group.id);
    if (pending.kind === "move-video") moveVideo(pending.video.id, pending.toGroup.id);
    closeDialog();
  }

  function resetForms() {
    setUrl("");
    setTitleInput("");
    setCustomGroup("");
    setGroupTitle("");
    setGroupNote("");
    setFormError("");
  }

  async function submitAddVideo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const id = parseYouTubeId(url);
    if (!id) {
      setFormError(videos.urlInvalid);
      return;
    }

    const existing = new Set([
      ...groups.flatMap((group) => group.items.map((item) => item.id)),
      ...store.added.map((item) => item.id),
      ...store.removed,
    ]);
    if (existing.has(id)) {
      setFormError(videos.duplicate);
      return;
    }

    setFormError("");
    setBusy(true);

    let title = titleInput.trim();
    let author = "";
    if (!title) {
      const meta = await fetchVideoMeta(id);
      title = meta?.title?.trim() || `YouTube · ${id}`;
      author = meta?.author?.trim() || "";
    }

    const chosen = selectableGroups.some((group) => group.id === groupChoice)
      ? groupChoice
      : selectableGroups[0]?.id ?? "__custom";
    const isCustom = chosen === "__custom";
    const customName = customGroup.trim();
    const added: AddedVideo = {
      id,
      title,
      author,
      url: `https://youtu.be/${id}`,
      groupId: isCustom ? `custom:${customName || videos.customGroup}` : chosen,
      groupTitle: isCustom ? customName || videos.customGroup : "",
      addedAt: Date.now(),
    };

    update({ ...store, added: [...store.added, added] });
    setBusy(false);
    resetForms();
    closeDialog();
  }

  function submitAddGroup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = groupTitle.trim();
    if (!title) return;
    const group: WatchGroup = {
      id: `g${Date.now().toString(36)}`,
      title,
      note: groupNote.trim(),
    };
    update({ ...store, groups: [...store.groups, group] });
    resetForms();
    closeDialog();
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(store, null, 2));
      setExported(true);
      window.setTimeout(() => setExported(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const isPinStep = !pending || step === "pin";

  const dialogTitle = (() => {
    if (!pending) return "";
    if (step === "pin") return videos.pinTitle;
    if (pending.kind === "add-group") return videos.addGroupTitle;
    return videos.addTitle;
  })();

  function pinContext() {
    if (!pending) return null;
    if (pending.kind === "remove-video") {
      return (
        <p className="wdialog__target">
          <strong>{pending.video.title}</strong>
          <span>{videos.removeHint}</span>
        </p>
      );
    }
    if (pending.kind === "remove-group") {
      return (
        <p className="wdialog__target">
          <strong>{pending.group.title}</strong>
          <span>{videos.removeGroupHint}</span>
        </p>
      );
    }
    if (pending.kind === "move-video") {
      return (
        <p className="wdialog__target">
          <strong>
            {videos.moveHint
              .replace("{video}", pending.video.title)
              .replace("{group}", pending.toGroup.title)}
          </strong>
        </p>
      );
    }
    return null;
  }

  return (
    <section className="section" id="videos" aria-labelledby="videos-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">04</span>
                {videos.label}
              </p>
              <h2 className="h2" id="videos-title">
                {videos.title}
              </h2>
              <p className="lede">{videos.lede}</p>
            </div>
            <div className="watch-tools">
              <button
                type="button"
                className="wadd"
                onClick={() => openAction({ kind: "add-group" })}
              >
                <span aria-hidden="true">+</span>
                {videos.addGroup}
              </button>
              <button
                type="button"
                className="wadd wadd--primary"
                onClick={() => openAction({ kind: "add-video" })}
              >
                <span aria-hidden="true">+</span>
                {videos.add}
              </button>
            </div>
          </div>
        </Reveal>

        <div className="video-groups">
          {groups.map((group, groupIndex) => (
            <Reveal key={group.id} delay={groupIndex * 40}>
              <div
                className={`vgroup${dragOver === group.id ? " is-drop" : ""}`}
                onDragOver={(event) => {
                  if (!dragId) return;
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                  if (dragOver !== group.id) setDragOver(group.id);
                }}
                onDragLeave={(event) => {
                  if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                    setDragOver((current) => (current === group.id ? null : current));
                  }
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setDragOver(null);
                  const id = event.dataTransfer.getData("text/plain") || dragId;
                  setDragId(null);
                  if (!id) return;
                  const video = index[id];
                  if (!video || placement[id] === group.id) return;
                  openAction({ kind: "move-video", video, toGroup: group });
                }}
              >
                <div className="vgroup__head">
                  <h3 className="vgroup__title">{group.title}</h3>
                  <div className="vgroup__aside">
                    <span className="vgroup__count">{videos.countLabel(group.items.length)}</span>
                    <button
                      type="button"
                      className="vgroup__del"
                      onClick={() => openAction({ kind: "remove-group", group })}
                      aria-label={`${videos.removeGroup}: ${group.title}`}
                      title={videos.removeGroup}
                    >
                      ×
                    </button>
                  </div>
                </div>
                {group.note ? <p className="vgroup__note">{group.note}</p> : null}

                {group.items.length === 0 ? (
                  <p className="vgroup__empty">{videos.dropHint}</p>
                ) : (
                  <div className="vgrid">
                    {group.items.map((video) => (
                      <div
                        className="video-slot"
                        key={video.id}
                        draggable
                        onDragStart={(event) => {
                          setDragId(video.id);
                          event.dataTransfer.effectAllowed = "move";
                          event.dataTransfer.setData("text/plain", video.id);
                        }}
                        onDragEnd={() => {
                          setDragId(null);
                          setDragOver(null);
                        }}
                      >
                        <VideoCard
                          id={video.id}
                          title={video.title}
                          author={video.author}
                          url={video.url}
                          playLabel={videos.playLabel}
                          removeLabel={videos.remove}
                          onRemove={() => openAction({ kind: "remove-video", video })}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <dialog
        ref={dialogRef}
        className="wdialog"
        aria-label={dialogTitle}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        {pending ? (
          <>
            <div className="wdialog__head">
              <h3 className="wdialog__title">{dialogTitle}</h3>
              <button
                type="button"
                className="wdialog__x"
                onClick={closeDialog}
                aria-label={videos.cancel}
              >
                ×
              </button>
            </div>

            {isPinStep ? (
              <form onSubmit={submitPin}>
                <div className="wdialog__body">
                  <p className="hint">{videos.pinHint}</p>
                  {pinContext()}

                  <div className="field">
                    <label htmlFor="watch-pin">{videos.pinLabel}</label>
                    <input
                      id="watch-pin"
                      ref={pinRef}
                      className="pin-input"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={6}
                      value={pin}
                      onChange={(event) =>
                        setPin(event.target.value.replace(/\D/g, "").slice(0, 6))
                      }
                      placeholder="••••••"
                    />
                  </div>

                  {pinError ? (
                    <p className="err" role="alert">
                      {pinError}
                    </p>
                  ) : null}
                  {locked ? (
                    <p className="hint">{videos.pinLocked.replace("{s}", String(lockedFor))}</p>
                  ) : null}
                </div>

                <div className="wdialog__foot">
                  <button type="button" className="btn-n" onClick={closeDialog}>
                    {videos.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn-n btn-n--primary"
                    disabled={pin.length !== 6 || locked}
                  >
                    {videos.pinSubmit}
                  </button>
                </div>
              </form>
            ) : pending.kind === "add-video" ? (
              <form onSubmit={submitAddVideo}>
                <div className="wdialog__body">
                  <div className="field">
                    <label htmlFor="watch-url">{videos.urlLabel}</label>
                    <input
                      id="watch-url"
                      ref={urlRef}
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder={videos.urlPlaceholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="watch-group">{videos.groupLabel}</label>
                    <select
                      id="watch-group"
                      value={groupChoice}
                      onChange={(event) => setGroupChoice(event.target.value)}
                    >
                      {selectableGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.title}
                        </option>
                      ))}
                      <option value="__custom">{videos.groupCustom}</option>
                    </select>
                  </div>

                  {groupChoice === "__custom" ? (
                    <div className="field">
                      <label htmlFor="watch-group-name">{videos.groupNameLabel}</label>
                      <input
                        id="watch-group-name"
                        value={customGroup}
                        onChange={(event) => setCustomGroup(event.target.value)}
                        placeholder={videos.customGroup}
                      />
                    </div>
                  ) : null}

                  <div className="field">
                    <label htmlFor="watch-title">{videos.titleLabel}</label>
                    <input
                      id="watch-title"
                      value={titleInput}
                      onChange={(event) => setTitleInput(event.target.value)}
                      placeholder={videos.titlePlaceholder}
                    />
                  </div>

                  {formError ? (
                    <p className="err" role="alert">
                      {formError}
                    </p>
                  ) : null}

                  <p className="hint">{videos.localNote}</p>
                </div>

                <div className="wdialog__foot">
                  <button type="button" className="btn-n" onClick={() => update(EMPTY_STORE)}>
                    {videos.reset}
                  </button>
                  <button
                    type="button"
                    className="btn-n"
                    onClick={copyJson}
                    disabled={store.added.length === 0}
                  >
                    {exported ? videos.exported : videos.export}
                  </button>
                  <div className="wdialog__actions">
                    <button type="button" className="btn-n" onClick={closeDialog}>
                      {videos.cancel}
                    </button>
                    <button type="submit" className="btn-n btn-n--primary" disabled={busy}>
                      {busy ? videos.fetching : videos.submit}
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={submitAddGroup}>
                <div className="wdialog__body">
                  <div className="field">
                    <label htmlFor="watch-new-group">{videos.groupNameLabel}</label>
                    <input
                      id="watch-new-group"
                      ref={groupNameRef}
                      value={groupTitle}
                      onChange={(event) => setGroupTitle(event.target.value)}
                      placeholder={videos.customGroup}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="watch-new-note">{videos.groupNoteLabel}</label>
                    <input
                      id="watch-new-note"
                      value={groupNote}
                      onChange={(event) => setGroupNote(event.target.value)}
                      placeholder={videos.groupNotePlaceholder}
                    />
                  </div>

                  {formError ? (
                    <p className="err" role="alert">
                      {formError}
                    </p>
                  ) : null}
                </div>

                <div className="wdialog__foot">
                  <div className="wdialog__actions">
                    <button type="button" className="btn-n" onClick={closeDialog}>
                      {videos.cancel}
                    </button>
                    <button
                      type="submit"
                      className="btn-n btn-n--primary"
                      disabled={!groupTitle.trim()}
                    >
                      {videos.submitGroup}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </>
        ) : null}
      </dialog>
    </section>
  );
}
