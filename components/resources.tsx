"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import Reveal from "./reveal";
import { useLang } from "./lang-context";
import { LOCK_MS, MAX_ATTEMPTS, verifyPin } from "@/lib/pin";
import {
  EMPTY_RESOURCE_STORE,
  avatarFor,
  fallbackTitle,
  faviconFor,
  fetchRepoMeta,
  formatStars,
  githubRepo,
  hostOf,
  loadResourceStore,
  normalizeUrl,
  previewImageFor,
  saveResourceStore,
  type Resource,
  type ResourceKind,
  type ResourceStore,
} from "@/lib/resources";

type FilterId = "all" | ResourceKind;

type Pending = { type: "add" } | { type: "remove"; item: Resource } | null;

export default function Resources() {
  const { t } = useLang();
  const copy = t.productivity.resources;
  const pins = t.productivity.videos;

  const [store, setStore] = useState<ResourceStore>(EMPTY_RESOURCE_STORE);
  const [filter, setFilter] = useState<FilterId>("all");
  const [pending, setPending] = useState<Pending>(null);
  const [step, setStep] = useState<"pin" | "form">("pin");

  const dialogRef = useRef<HTMLDialogElement>(null);
  const pinRef = useRef<HTMLInputElement>(null);
  const urlRef = useRef<HTMLInputElement>(null);

  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [, setTick] = useState(0);

  const [url, setUrl] = useState("");
  const [kind, setKind] = useState<ResourceKind>("skill");
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setStore(loadResourceStore());
  }, []);

  useEffect(() => {
    if (!lockedUntil) return;
    const id = window.setInterval(() => setTick((value) => value + 1), 500);
    return () => window.clearInterval(id);
  }, [lockedUntil]);

  const lockedFor = Math.max(0, Math.ceil((lockedUntil - Date.now()) / 1000));
  const locked = lockedFor > 0;
  const dialogOpen = pending !== null;

  const update = useCallback((next: ResourceStore) => {
    setStore(next);
    saveResourceStore(next);
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
      if (step === "form") urlRef.current?.focus();
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

  const items = useMemo<Resource[]>(() => {
    const removed = new Set(store.removed);
    const base: Resource[] = copy.items.map((item) => ({
      id: item.id,
      url: item.url,
      title: item.title,
      desc: item.desc,
      kind: item.kind as ResourceKind,
    }));
    return [...base, ...store.added].filter((item) => !removed.has(item.id));
  }, [copy.items, store]);

  const visible = filter === "all" ? items : items.filter((item) => item.kind === filter);

  const kinds: ResourceKind[] = ["skill", "mcp", "repo", "dataset", "other"];

  async function submitPin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!pending || locked) return;
    if (!/^\d{6}$/.test(pin)) {
      setPinError(pins.pinWrong.replace("{n}", String(MAX_ATTEMPTS - attempts)));
      return;
    }
    const ok = await verifyPin(pin);
    if (!ok) {
      const next = attempts + 1;
      setPin("");
      if (next >= MAX_ATTEMPTS) {
        setAttempts(0);
        setLockedUntil(Date.now() + LOCK_MS);
        setPinError(pins.pinLocked.replace("{s}", String(Math.round(LOCK_MS / 1000))));
      } else {
        setAttempts(next);
        setPinError(pins.pinWrong.replace("{n}", String(MAX_ATTEMPTS - next)));
      }
      return;
    }
    setPin("");
    setPinError("");
    setAttempts(0);

    if (pending.type === "add") {
      setStep("form");
      return;
    }
    update({ ...store, removed: Array.from(new Set([...store.removed, pending.item.id])) });
    closeDialog();
  }

  async function submitAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busy) return;

    const normalized = normalizeUrl(url);
    if (!normalized) {
      setFormError(copy.urlInvalid);
      return;
    }
    if (items.some((item) => item.url === normalized || item.id === normalized)) {
      setFormError(copy.duplicate);
      return;
    }

    setFormError("");
    setBusy(true);

    let nextTitle = title.trim();
    let nextDesc = desc.trim();
    let stars: number | undefined;
    let lang: string | undefined;

    const repo = githubRepo(normalized);
    if (repo) {
      const meta = await fetchRepoMeta(repo.owner, repo.repo);
      if (meta) {
        nextTitle = nextTitle || meta.title;
        nextDesc = nextDesc || meta.desc;
        stars = meta.stars;
        lang = meta.lang || undefined;
      }
    }
    if (!nextTitle) nextTitle = fallbackTitle(normalized);

    const item: Resource = {
      id: normalized,
      url: normalized,
      title: nextTitle,
      desc: nextDesc,
      kind,
      addedAt: Date.now(),
      stars,
      lang,
    };

    update({ ...store, added: [...store.added, item] });
    setBusy(false);
    setUrl("");
    setTitle("");
    setDesc("");
    closeDialog();
  }

  return (
    <section className="section" id="resources" aria-labelledby="resources-title">
      <div className="container">
        <Reveal>
          <div className="section__head">
            <div>
              <p className="eyebrow">
                <span className="eyebrow__num">03</span>
                {copy.label}
              </p>
              <h2 className="h2" id="resources-title">
                {copy.title}
              </h2>
              <p className="lede">{copy.lede}</p>
            </div>
            <div className="watch-tools">
              <button type="button" className="wadd wadd--primary" onClick={() => openAction({ type: "add" })}>
                <span aria-hidden="true">+</span>
                {copy.add}
              </button>
            </div>
          </div>
        </Reveal>

        <div className="filters" role="group" aria-label={copy.title}>
          <button
            type="button"
            className="filter"
            aria-pressed={filter === "all"}
            onClick={() => setFilter("all")}
          >
            {copy.all}
          </button>
          {kinds.map((k) => (
            <button
              key={k}
              type="button"
              className="filter"
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
            >
              {copy.kinds[k]}
            </button>
          ))}
          <span className="filters__count" aria-live="polite">
            {copy.countLabel(visible.length)}
          </span>
        </div>

        {visible.length === 0 ? (
          <p className="res__empty">{copy.empty}</p>
        ) : (
          <div className="res-grid">
            {visible.map((item, index) => (
              <Reveal key={item.id} delay={Math.min(index, 5) * 40}>
                <ResourceCard
                  item={item}
                  kindLabel={copy.kinds[item.kind]}
                  openLabel={copy.open}
                  removeLabel={copy.remove}
                  onRemove={() => openAction({ type: "remove", item })}
                />
              </Reveal>
            ))}
          </div>
        )}
      </div>

      <dialog
        ref={dialogRef}
        className="wdialog"
        aria-label={step === "pin" ? pins.pinTitle : copy.addTitle}
        onClose={closeDialog}
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog();
        }}
      >
        {pending ? (
          <>
            <div className="wdialog__head">
              <h3 className="wdialog__title">
                {step === "pin" ? pins.pinTitle : copy.addTitle}
              </h3>
              <button
                type="button"
                className="wdialog__x"
                onClick={closeDialog}
                aria-label={pins.cancel}
              >
                ×
              </button>
            </div>

            {step === "pin" ? (
              <form onSubmit={submitPin}>
                <div className="wdialog__body">
                  <p className="hint">{pins.pinHint}</p>
                  {pending.type === "remove" ? (
                    <p className="wdialog__target">
                      <strong>{pending.item.title}</strong>
                      <span>{copy.removeHint}</span>
                    </p>
                  ) : null}

                  <div className="field">
                    <label htmlFor="res-pin">{pins.pinLabel}</label>
                    <input
                      id="res-pin"
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
                    <p className="hint">{pins.pinLocked.replace("{s}", String(lockedFor))}</p>
                  ) : null}
                </div>

                <div className="wdialog__foot">
                  <button type="button" className="btn-n" onClick={closeDialog}>
                    {pins.cancel}
                  </button>
                  <button
                    type="submit"
                    className="btn-n btn-n--primary"
                    disabled={pin.length !== 6 || locked}
                  >
                    {pins.pinSubmit}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={submitAdd}>
                <div className="wdialog__body">
                  <div className="field">
                    <label htmlFor="res-url">{copy.urlLabel}</label>
                    <input
                      id="res-url"
                      ref={urlRef}
                      value={url}
                      onChange={(event) => setUrl(event.target.value)}
                      placeholder={copy.urlPlaceholder}
                      spellCheck={false}
                      autoComplete="off"
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="res-kind">{copy.kindLabel}</label>
                    <select
                      id="res-kind"
                      value={kind}
                      onChange={(event) => setKind(event.target.value as ResourceKind)}
                    >
                      {kinds.map((k) => (
                        <option key={k} value={k}>
                          {copy.kinds[k]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="field">
                    <label htmlFor="res-title">{copy.titleLabel}</label>
                    <input
                      id="res-title"
                      value={title}
                      onChange={(event) => setTitle(event.target.value)}
                      placeholder={copy.titlePlaceholder}
                    />
                  </div>

                  <div className="field">
                    <label htmlFor="res-desc">{copy.descLabel}</label>
                    <input
                      id="res-desc"
                      value={desc}
                      onChange={(event) => setDesc(event.target.value)}
                      placeholder={copy.descPlaceholder}
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
                      {pins.cancel}
                    </button>
                    <button type="submit" className="btn-n btn-n--primary" disabled={busy}>
                      {busy ? copy.fetching : copy.submit}
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

function ResourceCard({
  item,
  kindLabel,
  openLabel,
  removeLabel,
  onRemove,
}: {
  item: Resource;
  kindLabel: string;
  openLabel: string;
  removeLabel: string;
  onRemove: () => void;
}) {
  const [broken, setBroken] = useState(false);
  const preview = previewImageFor(item.url);
  const avatar = avatarFor(item.url) ?? faviconFor(item.url);
  const host = hostOf(item.url);

  return (
    <article className="res" data-kind={item.kind}>
      <a className="res__body" href={item.url} target="_blank" rel="noreferrer noopener">
        <span className="res__media">
          {preview && !broken ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              className="res__preview"
              src={preview}
              alt=""
              loading="lazy"
              onError={() => setBroken(true)}
            />
          ) : (
            <>
              <span className="res__letter" aria-hidden="true">
                {host.charAt(0).toUpperCase()}
              </span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="res__fav"
                src={avatar}
                alt=""
                loading="lazy"
                width={26}
                height={26}
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            </>
          )}
        </span>

        <span className="res__text">
          <span className="res__meta">
            <span className="res__kind">{kindLabel}</span>
            <span className="res__host">{host}</span>
          </span>
          <span className="res__title">{item.title}</span>
          {item.desc ? <span className="res__desc">{item.desc}</span> : null}
          <span className="res__foot">
            {item.stars ? <span className="res__stars">★ {formatStars(item.stars)}</span> : null}
            {item.lang ? <span className="res__lang">{item.lang}</span> : null}
            <span className="res__open">
              {openLabel} <span aria-hidden="true">↗</span>
            </span>
          </span>
        </span>
      </a>

      <button
        type="button"
        className="res__del"
        onClick={onRemove}
        aria-label={`${removeLabel}: ${item.title}`}
        title={removeLabel}
      >
        ×
      </button>
    </article>
  );
}