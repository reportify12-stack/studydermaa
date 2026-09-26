import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';

interface NoteHtmlRendererProps {
  content: string;
  className?: string;
}

/**
 * Safely renders rich HTML content on the student view using DOMPurify and dangerouslySetInnerHTML.
 * Utilizes the @tailwindcss/typography plugin ('prose' classes) for responsive,
 * accessible, and beautiful typography.
 */
export const NoteHtmlRenderer: React.FC<NoteHtmlRendererProps> = ({
  content,
  className = '',
}) => {
  // Check if content actually contains HTML tags
  const isHtml = useMemo(() => {
    return /<[a-z][\s\S]*>/i.test(content);
  }, [content]);

  // Sanitize the HTML string to prevent XSS attacks while preserving rich formatting
  const sanitizedHtml = useMemo(() => {
    if (!content) return '';
    if (!isHtml) {
      // Plain text fallback: convert newlines to <p> tags
      return DOMPurify.sanitize(
        content
          .split('\n\n')
          .map((para) => `<p>${para.replace(/\n/g, '<br/>')}</p>`)
          .join('')
      );
    }

    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'p',
        'br',
        'strong',
        'em',
        'u',
        's',
        'strike',
        'blockquote',
        'ul',
        'ol',
        'li',
        'a',
        'img',
        'pre',
        'code',
        'span',
        'sub',
        'sup',
        'table',
        'thead',
        'tbody',
        'tr',
        'th',
        'td',
      ],
      ALLOWED_ATTR: [
        'href',
        'src',
        'alt',
        'title',
        'class',
        'target',
        'rel',
        'width',
        'height',
        'loading',
      ],
      ADD_ATTR: ['target', 'rel'],
    });
  }, [content, isHtml]);

  if (!content || !content.trim()) {
    return (
      <div className="text-stone-400 italic text-sm py-4">
        Tiada kandungan teks untuk nota ini.
      </div>
    );
  }

  return (
    <div
      id="note-student-html-content"
      className={`prose dark:prose-invert max-w-none prose-stone
        prose-headings:font-display prose-headings:font-extrabold prose-headings:tracking-tight
        prose-h1:text-2xl sm:prose-h1:text-3xl prose-h1:mb-4
        prose-h2:text-xl sm:prose-h2:text-2xl prose-h2:mt-6 prose-h2:mb-3
        prose-h3:text-lg sm:prose-h3:text-xl prose-h3:mt-4
        prose-p:leading-relaxed prose-p:text-stone-800 dark:prose-p:text-stone-200
        prose-li:text-stone-800 dark:prose-li:text-stone-200
        prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-stone-200 dark:prose-img:border-stone-800
        prose-img:max-h-[500px] prose-img:object-contain prose-img:mx-auto prose-img:my-6
        prose-a:text-emerald-600 dark:prose-a:text-emerald-400 prose-a:font-semibold prose-a:no-underline hover:prose-a:underline
        prose-blockquote:border-l-emerald-500 prose-blockquote:bg-stone-50/80 dark:prose-blockquote:bg-stone-800/40
        prose-blockquote:p-4 prose-blockquote:rounded-r-2xl prose-blockquote:italic
        prose-code:bg-stone-100 dark:prose-code:bg-stone-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md
        ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};
