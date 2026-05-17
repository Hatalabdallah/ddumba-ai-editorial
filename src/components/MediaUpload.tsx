import { useRef, useState } from "react";
import { Upload, X, Image as ImageIcon, Video as VideoIcon } from "lucide-react";

export interface UploadedFile { name: string; type: "image" | "video"; dataUrl: string; size: number; }

export function MediaUpload({
  value, onChange, accept = "image/*,video/*", label = "Drag & drop or click to upload",
}: {
  value?: UploadedFile | null;
  onChange: (f: UploadedFile | null) => void;
  accept?: string;
  label?: string;
}) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [progress, setProgress] = useState(0);

  const handle = async (file: File) => {
    // For the admin panel MediaUpload — uses the API
    // For RichEditor inline uploads — falls back to base64
    setProgress(10);
    try {
      // Try API upload first (requires auth)
      const { api } = await import("@/lib/api");
      const result = await api.uploadMedia(file);
      setProgress(100);
      onChange({ name: result.name, type: result.type, dataUrl: result.dataUrl, size: result.size });
      setTimeout(() => setProgress(0), 600);
    } catch {
      // Fallback to base64 if API fails (e.g., not authenticated)
      const isVideo = file.type.startsWith("video/");
      const reader = new FileReader();
      reader.onprogress = (e) => { if (e.lengthComputable) setProgress(10 + (e.loaded / e.total) * 80); };
      reader.onload = () => {
        setProgress(100);
        onChange({ name: file.name, type: isVideo ? "video" : "image", dataUrl: String(reader.result), size: file.size });
        setTimeout(() => setProgress(0), 600);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {value ? (
        <div className="relative overflow-hidden rounded-2xl border bg-card">
          {value.type === "image"
            ? <img src={value.dataUrl} alt="" className="aspect-video w-full object-cover" />
            : <video src={value.dataUrl} controls className="aspect-video w-full object-cover" />}
          <div className="flex items-center justify-between gap-2 border-t p-3 text-xs">
            <span className="flex items-center gap-2 truncate">
              {value.type === "image" ? <ImageIcon className="h-3.5 w-3.5" /> : <VideoIcon className="h-3.5 w-3.5" />}
              <span className="truncate">{value.name}</span>
              <span className="text-muted-foreground">({(value.size / 1024).toFixed(0)} KB)</span>
            </span>
            <button onClick={() => onChange(null)} className="grid h-7 w-7 place-items-center rounded-lg border hover:bg-destructive/10 hover:text-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <label
          onDragOver={e => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handle(f); }}
          className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed p-10 text-center transition ${drag ? "border-brand bg-brand/5" : "border-border hover:border-brand/50 hover:bg-muted/30"}`}>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-brand">
            <Upload className="h-5 w-5 text-brand-foreground" />
          </div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-muted-foreground">Images & videos · stored locally</p>
          {progress > 0 && (
            <div className="mt-2 h-1 w-40 overflow-hidden rounded-full bg-muted">
              <div className="h-full bg-gradient-brand transition-all" style={{ width: `${progress}%` }} />
            </div>
          )}
          <input ref={ref} type="file" accept={accept} className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handle(f); }} />
        </label>
      )}
    </div>
  );
}
