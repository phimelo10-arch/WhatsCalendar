import { useRef, useEffect } from 'react';

export default function RichTextEditor({ initialContent, onChange }) {
  const editorRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && initialContent !== undefined && editorRef.current.innerHTML === '') {
      editorRef.current.innerHTML = initialContent;
    }
  }, []); 

  const handleInput = () => {
    if (editorRef.current) {
      onChange(editorRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key.toLowerCase()) {
        case 'b': e.preventDefault(); document.execCommand('bold'); break;
        case 'i': e.preventDefault(); document.execCommand('italic'); break;
        case 'u': e.preventDefault(); document.execCommand('underline'); break;
        case 's': e.preventDefault(); document.execCommand('strikeThrough'); break; 
        case '1': e.preventDefault(); document.execCommand('formatBlock', false, 'H2'); break; 
        case '2': e.preventDefault(); document.execCommand('formatBlock', false, 'H3'); break; 
        case '0': e.preventDefault(); document.execCommand('formatBlock', false, 'P'); break; 
        default: break;
      }
    }
  };

  return (
    <div
      ref={editorRef}
      contentEditable
      onBlur={handleInput}
      onKeyDown={handleKeyDown}
      className="w-full min-h-[140px] focus:outline-none p-4 text-sm text-black leading-relaxed empty:before:content-['Digite_o_conteúdo_do_slide...'] empty:before:text-apple-gray empty:before:pointer-events-none overflow-y-auto cursor-text"
      style={{ wordBreak: 'break-word' }}
    />
  );
}
