import React, { useRef, useMemo, useCallback, useState } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { Loader2, AlertCircle, ImageIcon, CheckCircle2 } from 'lucide-react';

// Compatibility wrapper for React 19 ref on ReactQuill component
const QuillEditor = ReactQuill as unknown as React.ComponentType<any>;

/**
 * Converts a File into an optimized Base64 Data URL.
 * Automatically downscales images > 1000px on canvas to keep document size light (~80-150KB).
 */
async function fileToOptimizedDataUrl(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        resolve('');
        return;
      }
      if (file.size < 80 * 1024) {
        resolve(result);
        return;
      }

      const img = new Image();
      img.onload = () => {
        const maxDim = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL(file.type || 'image/jpeg', 0.82));
        } else {
          resolve(result);
        }
      };
      img.onerror = () => resolve(result);
      img.src = result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

interface NoteRichTextEditorProps {
  value: string;
  onChange: (htmlContent: string) => void;
  placeholder?: string;
  noteId?: string;
}

export const NoteRichTextEditor: React.FC<NoteRichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Tuliskan nota lengkap mengikut silibus KSSM (Gunakan Bold, Italic, Senarai, atau Masukkan Imej)...',
  noteId,
}) => {
  const quillRef = useRef<ReactQuill>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Custom Image Handler
   * Opens native file selector, attempts to upload to Firebase Storage,
   * with automatic fallback to optimized embedded image if Storage permissions are restricted.
   */
  const handleImageUpload = useCallback(() => {
    // 1. Create a hidden <input type="file" accept="image/*"> dynamically and trigger click
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      // Validate size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setUploadError('Saiz gambar tidak boleh melebihi 10MB.');
        return;
      }

      setUploadingImage(true);
      setUploadError(null);
      setUploadSuccess(false);

      try {
        const cleanFileName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const storagePath = `notes_images/${Date.now()}_${cleanFileName}`;
        const fileRef = ref(storage, storagePath);

        let finalImageUrl: string = '';

        // Attempt upload to Firebase Storage
        try {
          const snapshot = await uploadBytes(fileRef, file, {
            contentType: file.type,
          });
          finalImageUrl = await getDownloadURL(snapshot.ref);
        } catch (storageErr: any) {
          console.warn(
            'Firebase Storage upload restricted or unauthorized; embedding optimized image locally:',
            storageErr?.message || storageErr
          );
          // Seamless fallback: convert to optimized data URL so user workflow is uninterrupted
          finalImageUrl = await fileToOptimizedDataUrl(file);
        }

        if (!finalImageUrl) {
          throw new Error('Gagal memproses fail imej.');
        }

        // Access Quill editor instance and insert image at cursor position
        const quill = quillRef.current?.getEditor();
        if (quill) {
          const selection = quill.getSelection(true);
          const index = selection ? selection.index : quill.getLength();
          quill.insertEmbed(index, 'image', finalImageUrl);
          quill.setSelection(index + 1, 0);
        }

        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3000);
      } catch (err: unknown) {
        console.error('Error inserting image into note editor:', err);
        setUploadError('Gagal menyisipkan imej. Sila pastikan format imej adalah sah.');
      } finally {
        setUploadingImage(false);
      }
    };
  }, []);

  // Configure Quill Toolbar & Handlers
  const modules = useMemo(() => {
    return {
      toolbar: {
        container: [
          [{ header: [1, 2, 3, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          ['blockquote', 'code-block'],
          ['link', 'image'],
          ['clean'],
        ],
        handlers: {
          image: handleImageUpload,
        },
      },
      clipboard: {
        matchVisual: false,
      },
    };
  }, [handleImageUpload]);

  // Allowed Formats: Quill uses 'list' for both ordered and bulleted lists.
  // Note: 'bullet' should NOT be included in formats config as Quill registers both under 'list'.
  const formats = useMemo(
    () => [
      'header',
      'bold',
      'italic',
      'underline',
      'strike',
      'list',
      'blockquote',
      'code-block',
      'link',
      'image',
    ],
    []
  );

  return (
    <div id="note-rich-text-editor-container" className="space-y-2">
      {/* Upload Status Banner */}
      {uploadingImage && (
        <div
          id="editor-image-uploading-banner"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 text-xs font-semibold animate-pulse"
        >
          <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
          <span>Memuat naik gambar ke Firebase Storage & menyisipkan ke dalam nota...</span>
        </div>
      )}

      {uploadSuccess && (
        <div
          id="editor-image-success-banner"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs font-semibold"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Gambar berjaya dimuat naik dan dimasukkan ke dalam nota!</span>
        </div>
      )}

      {uploadError && (
        <div
          id="editor-image-error-banner"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium"
        >
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* ReactQuill Editor Wrapper */}
      <div className="quill-editor-wrapper border border-stone-200 dark:border-stone-700 rounded-xl shadow-2xs">
        <QuillEditor
          ref={quillRef}
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
        />
      </div>

      <div className="flex items-center justify-between text-[11px] text-stone-400 dark:text-stone-500 px-1">
        <span className="flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-purple-500" />
          Klik butang gambar pada bar alatan untuk memuat naik fail imej terus ke Firebase Storage.
        </span>
        <span>HTML Rich Text</span>
      </div>
    </div>
  );
};
