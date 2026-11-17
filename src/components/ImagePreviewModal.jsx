import React from 'react';
import { X, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function ImagePreviewModal() {
  const { previewImageModal, setPreviewImageModal } = useApp();

  if (!previewImageModal) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/75 flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl max-w-3xl w-full overflow-hidden shadow-2xl border border-stone-200">
        <div className="flex items-center justify-between px-6 py-4 bg-[#FAF5EC] border-b border-stone-200">
          <h3 className="font-semibold text-stone-800 text-lg">
            {previewImageModal.title || 'ดูเอกสาร / รูปภาพ'}
          </h3>
          <div className="flex items-center gap-2">
            <a
              href={previewImageModal.url}
              download={`${previewImageModal.title || 'document'}.png`}
              className="px-3 py-1.5 text-xs font-medium bg-stone-800 text-white rounded-lg hover:bg-stone-700 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              ดาวน์โหลด
            </a>
            <button
              onClick={() => setPreviewImageModal(null)}
              className="p-1.5 rounded-lg text-stone-500 hover:bg-stone-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        <div className="p-6 bg-stone-100 flex items-center justify-center max-h-[75vh] overflow-auto">
          <img
            src={previewImageModal.url}
            alt={previewImageModal.title}
            className="max-h-[65vh] w-auto object-contain rounded-lg shadow"
          />
        </div>
      </div>
    </div>
  );
}
