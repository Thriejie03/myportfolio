"use client";

import * as React from "react";
import Image from "next/image";
import { ImagePlus, RefreshCw, Save, X, Upload, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showErrorAlert, showSuccessToast } from "@/lib/alerts";
import { defaultHomepageContent, type HomepageContent } from "@/data/homepage";

interface LibraryImage {
  name: string;
  url: string;
  createdAt: string | null;
}

export function HomepageContentManager() {
  const [content, setContent] = React.useState<HomepageContent>(defaultHomepageContent);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [uploadingImage, setUploadingImage] = React.useState<"profile" | "achievement" | null>(null);
  const [isUploadingCv, setIsUploadingCv] = React.useState(false);
  const [isProfileLibraryOpen, setIsProfileLibraryOpen] = React.useState(false);
  const [profileImages, setProfileImages] = React.useState<LibraryImage[]>([]);
  const [isLibraryLoading, setIsLibraryLoading] = React.useState(false);

  const loadContent = React.useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/homepage", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load homepage content."));
      if (!isRecord(data) || !isHomepageContent(data.content)) {
        throw new Error("The homepage content response is invalid.");
      }
      setContent(data.content);
    } catch (error) {
      console.error("Unable to load homepage content:", error);
      await showErrorAlert("Could not load homepage content", error instanceof Error ? error.message : "Unable to load homepage content.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  React.useEffect(() => {
    const timer = window.setTimeout(() => void loadContent(), 0);
    return () => window.clearTimeout(timer);
  }, [loadContent]);

  function updateHero<K extends keyof HomepageContent["hero"]>(key: K, value: HomepageContent["hero"][K]) {
    setContent((current) => ({ ...current, hero: { ...current.hero, [key]: value } }));
  }

  function updateAbout<K extends keyof HomepageContent["about"]>(key: K, value: HomepageContent["about"][K]) {
    setContent((current) => ({ ...current, about: { ...current.about, [key]: value } }));
  }

  function updateAchievement<K extends keyof HomepageContent["achievement"]>(key: K, value: HomepageContent["achievement"][K]) {
    setContent((current) => ({ ...current, achievement: { ...current.achievement, [key]: value } }));
  }

  function updateCv<K extends keyof HomepageContent["cv"]>(key: K, value: HomepageContent["cv"][K]) {
    setContent((current) => ({ ...current, cv: { ...current.cv, [key]: value } }));
  }

  function updateStat(index: number, key: "value" | "label", value: string) {
    setContent((current) => ({
      ...current,
      about: {
        ...current.about,
        stats: current.about.stats.map((stat, statIndex) =>
          statIndex === index ? { ...stat, [key]: value } : stat,
        ),
      },
    }));
  }

  async function uploadImage(file: File | undefined, target: "profile" | "achievement") {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("collection", "homepage");
    setUploadingImage(target);
    try {
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Image upload failed."));
      if (!isRecord(data) || typeof data.imageUrl !== "string") throw new Error("The upload response was invalid.");
      if (target === "profile") updateHero("imageUrl", data.imageUrl);
      else updateAchievement("imageUrl", data.imageUrl);
      await showSuccessToast("Image uploaded");
    } catch (error) {
      console.error("Unable to upload homepage image:", error);
      await showErrorAlert("Image upload failed", error instanceof Error ? error.message : "Unable to upload image.");
    } finally {
      setUploadingImage(null);
    }
  }

  async function uploadDocument(file: File | undefined) {
    if (!file) return;
    const formData = new FormData();
    formData.set("file", file);
    formData.set("collection", "homepage");
    setIsUploadingCv(true);
    try {
      const response = await fetch("/api/admin/content/upload", { method: "POST", body: formData });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "CV upload failed."));
      if (!isRecord(data) || typeof data.documentUrl !== "string") throw new Error("The upload response was invalid.");
      updateCv("url", data.documentUrl);
      await showSuccessToast("CV uploaded");
    } catch (error) {
      console.error("Unable to upload CV:", error);
      await showErrorAlert("CV upload failed", error instanceof Error ? error.message : "Unable to upload CV.");
    } finally {
      setIsUploadingCv(false);
    }
  }

  async function openProfileLibrary() {
    setIsProfileLibraryOpen(true);
    setIsLibraryLoading(true);
    try {
      const response = await fetch("/api/admin/content/images", { cache: "no-store" });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to load saved images."));
      if (
        !isRecord(data) ||
        !Array.isArray(data.images) ||
        !data.images.every(isLibraryImage)
      ) {
        throw new Error("The image library returned an invalid response.");
      }
      setProfileImages(data.images);
    } catch (error) {
      console.error("Unable to load homepage image library:", error);
      setIsProfileLibraryOpen(false);
      await showErrorAlert("Could not load image library", error instanceof Error ? error.message : "Unable to load saved images.");
    } finally {
      setIsLibraryLoading(false);
    }
  }

  async function saveContent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch("/api/admin/homepage", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });
      const data: unknown = await response.json();
      if (!response.ok) throw new Error(readError(data, "Unable to save homepage content."));
      if (!isRecord(data) || !isHomepageContent(data.content)) throw new Error("The saved homepage content response is invalid.");
      setContent(data.content);
      await showSuccessToast("Homepage content saved");
    } catch (error) {
      console.error("Unable to save homepage content:", error);
      await showErrorAlert("Could not save homepage content", error instanceof Error ? error.message : "Unable to save homepage content.");
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <section className="mx-auto max-w-5xl px-4 pb-24"><p className="rounded-2xl border border-border bg-card p-8 text-center text-muted-foreground">Loading homepage content…</p></section>;
  }

  return (
    <section className="mx-auto max-w-5xl px-4 pb-24">
      <form onSubmit={saveContent} className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Homepage & Profile</h1>
            <p className="mt-1 text-sm text-muted-foreground">Edit the intro, About section, featured achievement, and Download CV button shown across the site.</p>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => void loadContent()} disabled={isLoading}>
              <RefreshCw className="mr-2 h-4 w-4" /> Reload
            </Button>
            <Button type="submit" disabled={isSaving || uploadingImage !== null || isUploadingCv}>
              <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </div>

        <fieldset className={fieldsetClass}>
          <legend className={legendClass}>Hero / introduction</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Greeting"><input required maxLength={100} value={content.hero.greeting} onChange={(event) => updateHero("greeting", event.target.value)} className={inputClass} /></Field>
            <Field label="Role / headline"><input required maxLength={250} value={content.hero.role} onChange={(event) => updateHero("role", event.target.value)} className={inputClass} /></Field>
            <Field label="First name"><input required maxLength={100} value={content.hero.firstName} onChange={(event) => updateHero("firstName", event.target.value)} className={inputClass} /></Field>
            <Field label="Highlighted last name"><input required maxLength={100} value={content.hero.lastName} onChange={(event) => updateHero("lastName", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Introduction"><textarea required maxLength={3000} rows={4} value={content.hero.summary} onChange={(event) => updateHero("summary", event.target.value)} className={inputClass} /></Field>
          <Field label="Profile image URL"><input required maxLength={2048} value={content.hero.imageUrl} onChange={(event) => updateHero("imageUrl", event.target.value)} className={inputClass} /></Field>
          <div className="flex flex-wrap gap-3">
            <ImageUploadButton target="profile" uploading={uploadingImage === "profile"} onUpload={uploadImage} />
            <Button type="button" variant="outline" onClick={() => void openProfileLibrary()}>
              Choose saved image
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Uploading adds a new saved image and selects it. It does not delete or replace previous uploads.</p>
        </fieldset>

        <fieldset className={fieldsetClass}>
          <legend className={legendClass}>About section</legend>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Heading"><input required maxLength={150} value={content.about.heading} onChange={(event) => updateAbout("heading", event.target.value)} className={inputClass} /></Field>
            <Field label="Highlighted heading"><input required maxLength={150} value={content.about.accentHeading} onChange={(event) => updateAbout("accentHeading", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Description"><textarea required maxLength={3000} rows={4} value={content.about.description} onChange={(event) => updateAbout("description", event.target.value)} className={inputClass} /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            {content.about.stats.map((stat, index) => (
              <div key={index} className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3">
                <Field label={`Stat ${index + 1} value`}><input required maxLength={40} value={stat.value} onChange={(event) => updateStat(index, "value", event.target.value)} className={inputClass} /></Field>
                <Field label="Label"><input required maxLength={80} value={stat.label} onChange={(event) => updateStat(index, "label", event.target.value)} className={inputClass} /></Field>
              </div>
            ))}
          </div>
        </fieldset>

        <fieldset className={fieldsetClass}>
          <legend className={legendClass}>Featured achievement</legend>
          <label className="flex items-center gap-2 text-sm text-foreground">
            <input type="checkbox" checked={content.achievement.enabled} onChange={(event) => updateAchievement("enabled", event.target.checked)} />
            Show this achievement on the homepage
          </label>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Title"><input required maxLength={150} value={content.achievement.title} onChange={(event) => updateAchievement("title", event.target.value)} className={inputClass} /></Field>
            <Field label="Highlighted title"><input required maxLength={150} value={content.achievement.highlight} onChange={(event) => updateAchievement("highlight", event.target.value)} className={inputClass} /></Field>
            <Field label="Event / issuer"><input required maxLength={200} value={content.achievement.eventName} onChange={(event) => updateAchievement("eventName", event.target.value)} className={inputClass} /></Field>
            <Field label="Date"><input required maxLength={100} value={content.achievement.date} onChange={(event) => updateAchievement("date", event.target.value)} className={inputClass} /></Field>
          </div>
          <Field label="Description"><textarea required maxLength={3000} rows={4} value={content.achievement.description} onChange={(event) => updateAchievement("description", event.target.value)} className={inputClass} /></Field>
          <Field label="Image alt text"><input required maxLength={500} value={content.achievement.imageAlt} onChange={(event) => updateAchievement("imageAlt", event.target.value)} className={inputClass} /></Field>
          <Field label="Achievement image URL"><input required maxLength={2048} value={content.achievement.imageUrl} onChange={(event) => updateAchievement("imageUrl", event.target.value)} className={inputClass} /></Field>
          <ImageUploadButton target="achievement" uploading={uploadingImage === "achievement"} onUpload={uploadImage} />
          <Field label="Certificate document URL (optional)"><input maxLength={2048} value={content.achievement.certificateUrl} onChange={(event) => updateAchievement("certificateUrl", event.target.value)} className={inputClass} /></Field>
          <Field label="Announcement / website URL (optional)"><input maxLength={2048} value={content.achievement.articleUrl} onChange={(event) => updateAchievement("articleUrl", event.target.value)} className={inputClass} /></Field>
        </fieldset>

        <fieldset className={fieldsetClass}>
          <legend className={legendClass}>Download CV button</legend>
          <p className="text-sm text-muted-foreground">Controls the “Download CV” button shown in the site navigation on every page.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Button label"><input required maxLength={60} value={content.cv.label} onChange={(event) => updateCv("label", event.target.value)} className={inputClass} /></Field>
            <Field label="CV file URL"><input required maxLength={2048} value={content.cv.url} onChange={(event) => updateCv("url", event.target.value)} className={inputClass} /></Field>
          </div>
          <div className="flex flex-wrap gap-3">
            <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
              <Upload className="mr-2 h-4 w-4" /> {isUploadingCv ? "Uploading…" : "Upload CV file"}
              <input
                type="file"
                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                disabled={isUploadingCv}
                className="sr-only"
                onChange={(event) => void uploadDocument(event.target.files?.[0])}
              />
            </label>
            {content.cv.url && (
              <a
                href={content.cv.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent"
              >
                <ExternalLink className="mr-2 h-4 w-4" /> Preview current CV
              </a>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Uploading a PDF or Word document (max 5 MB) replaces the download link with the newly uploaded file.</p>
        </fieldset>

        <div className="flex justify-end">
          <Button type="submit" disabled={isSaving || uploadingImage !== null || isUploadingCv}>
            <Save className="mr-2 h-4 w-4" /> {isSaving ? "Saving…" : "Save homepage changes"}
          </Button>
        </div>
      </form>
      {isProfileLibraryOpen && (
        <ProfileImageLibrary
          images={profileImages}
          currentImageUrl={content.hero.imageUrl}
          isLoading={isLibraryLoading}
          onClose={() => setIsProfileLibraryOpen(false)}
          onSelect={(url) => {
            updateHero("imageUrl", url);
            setIsProfileLibraryOpen(false);
          }}
        />
      )}
    </section>
  );
}

function ProfileImageLibrary({
  images,
  currentImageUrl,
  isLoading,
  onClose,
  onSelect,
}: {
  images: LibraryImage[];
  currentImageUrl: string;
  isLoading: boolean;
  onClose: () => void;
  onSelect: (url: string) => void;
}) {
  const savedUrls = new Set(images.map((image) => image.url));
  const defaultProfileUrl = "/profile.png";
  const hasDefault = currentImageUrl === defaultProfileUrl || !savedUrls.has(defaultProfileUrl);

  return (
    <div className="fixed inset-0 z-[260] overflow-y-auto bg-black/70 p-4" role="dialog" aria-modal="true" aria-labelledby="profile-library-title">
      <section className="mx-auto my-6 max-w-4xl rounded-2xl border border-border bg-background p-5 shadow-2xl sm:p-7">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 id="profile-library-title" className="text-2xl font-bold text-foreground">Profile image library</h2>
            <p className="mt-1 text-sm text-muted-foreground">Choose a saved photo. Selecting one does not delete other images.</p>
          </div>
          <Button type="button" variant="outline" onClick={onClose} aria-label="Close image library">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <p className="py-12 text-center text-muted-foreground">Loading saved images…</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {hasDefault && (
              <ImageChoice
                label="Original profile photo"
                url={defaultProfileUrl}
                selected={currentImageUrl === defaultProfileUrl}
                onSelect={onSelect}
              />
            )}
            {images.map((image) => (
              <ImageChoice
                key={image.name}
                label={image.createdAt ? new Date(image.createdAt).toLocaleDateString() : image.name}
                url={image.url}
                selected={currentImageUrl === image.url}
                onSelect={onSelect}
              />
            ))}
            {images.length === 0 && !hasDefault && (
              <p className="col-span-full py-8 text-center text-sm text-muted-foreground">No saved profile images found. Upload a photo to add it to this library.</p>
            )}
          </div>
        )}
      </section>
    </div>
  );
}

function ImageChoice({
  label,
  url,
  selected,
  onSelect,
}: {
  label: string;
  url: string;
  selected: boolean;
  onSelect: (url: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(url)}
      className={`overflow-hidden rounded-xl border text-left transition-colors ${selected ? "border-sky-500 ring-2 ring-sky-500" : "border-border hover:border-sky-500/60"}`}
      aria-pressed={selected}
    >
      <div className="relative aspect-square w-full bg-muted">
        <Image src={url} alt="" fill unoptimized sizes="(max-width: 640px) 50vw, 25vw" className="object-cover" />
      </div>
      <span className="block truncate px-3 py-2 text-xs text-foreground">{selected ? `Selected · ${label}` : label}</span>
    </button>
  );
}

function ImageUploadButton({
  target,
  uploading,
  onUpload,
}: {
  target: "profile" | "achievement";
  uploading: boolean;
  onUpload: (file: File | undefined, target: "profile" | "achievement") => Promise<void>;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center rounded-xl border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-accent">
      <ImagePlus className="mr-2 h-4 w-4" /> {uploading ? "Uploading…" : "Upload image"}
      <input type="file" accept="image/jpeg,image/png,image/webp" disabled={uploading} className="sr-only" onChange={(event) => void onUpload(event.target.files?.[0], target)} />
    </label>
  );
}

const fieldsetClass = "space-y-4 rounded-2xl border border-border bg-card p-5 sm:p-7";
const legendClass = "px-2 text-xl font-bold text-foreground";
const inputClass = "w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-sky-500";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block space-y-1.5 text-sm font-medium text-foreground"><span>{label}</span>{children}</label>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isLibraryImage(value: unknown): value is LibraryImage {
  return (
    isRecord(value) &&
    typeof value.name === "string" &&
    typeof value.url === "string" &&
    (typeof value.createdAt === "string" || value.createdAt === null)
  );
}

function isHomepageContent(value: unknown): value is HomepageContent {
  if (!isRecord(value) || !isRecord(value.hero) || !isRecord(value.about) || !isRecord(value.achievement) || !isRecord(value.cv)) return false;
  return (
    typeof value.hero.firstName === "string" &&
    typeof value.hero.imageUrl === "string" &&
    typeof value.about.heading === "string" &&
    Array.isArray(value.about.stats) &&
    typeof value.achievement.enabled === "boolean" &&
    typeof value.achievement.imageUrl === "string" &&
    typeof value.cv.label === "string" &&
    typeof value.cv.url === "string"
  );
}

function readError(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}
