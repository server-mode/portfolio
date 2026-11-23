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
  type WatchStore,
  type WatchVideo,
} from "@/lib/watchlist";

type DialogState =
  | { kind: "closed" }
  | { kind: "add"; step: "pin" | "form" }
  | { kind: "delete"; video: WatchVideo };

type GroupView = { id: string; title: string; note: string; items: WatchVideo[] };

export default function Watchlist() {
  const { t } = useLang();
  const videos = t.productivity.videos;

  const [store, setStore] = useState<WatchStore>(EMPTY_STORE);
  const [dialog, setDialog] = useState<DialogState>({ kind: "closed" });
  const dialogRef = useRef<HTMLDialogElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, setTick] = useState(0);

  const [url, setUrl] = useState("");
  const [groupChoice, setGroupChoice] = useState(videos.groups[0]?.id ?? "");
  const [customGroup, setCustomGroup] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [exported, setExported] = useState(false);

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

  const update = useCallback((next: WatchStore) => {
    setStore(next);
    saveWatchStore(next);
  }, []);

  const closeDialog = useCallback(() => {
    setDialog({ kind: "closed" });
    setPin("");
    setPinError("");
  }, []);

  const openDialog = useCallback((next: DialogState) => {
    setPin("");
    setPinError("");
    setDialog(next);
  }, []);

  useEffect(() => {
    const element = dialogRef.current;
    if (!element) return;
    if (dialog.kind !== "closed" && !element.open) element.showModal();
    if (dialog.kind === "closed" && element.open) element.close();
  }, [dialog.kind]);

  useEffect(() => {
    if (dialog.kind === "closed") return;
    const timer = window.setTimeout(() => {
      if (dialog.kind === "add" && dialog.step === "form") urlRef.current?.focus();
      else pinRef.current?.focus();
    }, 60);
    return () => window.clearTimeout(timer);
  }, [dialog]);

  useEffect(() => {
    if (dialog.kind === "closed") return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [dialog.kind]);

  const groups = useMemo<GroupView[]>(() => {
    const removed = new Set(store.removed);
    const base: GroupView[] = videos.groups.map((group) => ({
      id: group.id,
      title: group.title,
      note: group.note,
      items: group.items
        .filter((item) => !removed.has(item.id))
        .map((item) => ({ id: item.id, title: item.title, author: item.author, url: item.url })),
    }));

    const extra: GroupView[] = [];
    for (const added of store.added) {
      if (removed.has(added.id)) continue;
      const found =
        base.find((group) => group.id === added.groupId) ??
        extra.find((group) => group.id === added.groupId);
      const target =
        found ??
        (() => {
          const created: GroupView = {
            id: added.groupId,
            title: added.groupTitle || videos.customGroup,
            note: "",
            items: [],
          };
          extra.push(created);
          return created;
        })();
      target.items.push({
        id: added.id,
        title: added.title,
        author: added.author,
        url: added.url,
      });
    }

    return [...base, ...extra].filter((group) => group.items.length > 0);
  }, [videos.groups, videos.customGroup, store]);

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

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (locked) return;
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
    if (dialog.kind === "add") setDialog({ kind: "add", step: "form" });
    else if (dialog.kind === "delete") {
      removeVideo(dialog.video);
      closeDialog();
    }
  }

  function resetForm() {
    setUrl("");
    setTitleInput("");
    setCustomGroup("");
    setFormError("");
  }

  async function submitAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const id = parseYouTubeId(url);
    if (!id) {
      setFormError(videos.urlInvalid);
      return;
    }

    const allIds = new Set([
      ...videos.groups.flatMap((group) => group.items.map((item) => item.id)),
      ...store.added.map((item) => item.id),
    ]);
    if (allIds.has(id)) {
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

    const isCustom = groupChoice === "__custom";
    const customName = customGroup.trim();
    const added: AddedVideo = {
      id,
      title,
      author,
      url: `https://youtu.be/${id}`,
      groupId: isCustom ? `custom:${customName || videos.customGroup}` : groupChoice,
      groupTitle: isCustom ? customName || videos.customGroup : "",
      addedAt: Date.now(),
    };

    update({ ...store, added: [...store.added, added] });
    setBusy(false);
    resetForm();
    closeDialog();
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(store.added, null, 2));
      setExported(true);
      window.setTimeout(() => setExported(false), 1800);
    } catch {
      /* clipboard blocked */
    }
  }

  const isPinStep = dialog.kind === "delete" || (dialog.kind === "add" && dialog.step === "pin");
  const dialogTitle =
    dialog.kind === "delete"
      ? videos.deleteTitle
      : dialog.kind === "add" && dialog.step === "form"
        ? videos.addTitle
        : videos.pinTitle;

  return (
    <section className="section" id="videos" aria-labelledby="videos-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">03</span>
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
                onClick={() => openDialog({ kind: "add", step: "pin" })}
              >
                <span aria-hidden="true">+</span>
                {videos.add}
              </button>
            </div>
          </div>
        </Reveal>

        <div className="video-groups">
          {groups.map((group, index) => (
            <Reveal key={group.id} delay={index * 40}>
              <div className="vgroup">
                <div className="vgroup__head">
                  <h3 className="vgroup__title">{group.title}</h3>
                  <span className="vgroup__count">{videos.countLabel(group.items.length)}</span>
                </div>
                {group.note ? <p className="vgroup__note">{group.note}</p> : null}

                <div className="vgrid">
                  {group.items.map((video) => (
                    <VideoCard
                      key={video.id}
                      id={video.id}
                      title={video.title}
                      author={video.author}
                      url={video.url}
                      playLabel={videos.playLabel}
                      removeLabel={videos.remove}
                      onRemove={() => openDialog({ kind: "delete", video })}
                    />
                  ))}
                </div>
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
        {dialog.kind !== "closed" ? (
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
                  {dialog.kind === "delete" ? (
                    <p className="wdialog__target">
                      <strong>{dialog.video.title}</strong>
                      <span>{videos.removeHint}</span>
                    </p>
                  ) : null}

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
                  {locked ? <p className="hint">{videos.pinLocked.replace("{s}", String(lockedFor))}</p> : null}
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
            ) : (
              <form onSubmit={submitAdd}>
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
                      {videos.groups.map((group) => (
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
            )}
          </>
        ) : null}
      </dialog>
    </section>
  );
}
