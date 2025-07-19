import { useEffect, useState } from 'react';
import LoadingOverlay from '../components/LoadingOverlay';
import React from 'react';

// Helper: Recursively collect all text nodes in the body
function getTextNodes(node: Node, nodes: Text[] = []) {
  if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
    nodes.push(node as Text);
  } else if (node.nodeType === Node.ELEMENT_NODE) {
    // Exclude script, style, input, textarea, button, select
    const tag = (node as Element).tagName?.toLowerCase();
    if (["script", "style", "input", "textarea", "button", "select"].includes(tag)) return nodes;
    for (const child of Array.from(node.childNodes)) {
      getTextNodes(child, nodes);
    }
  }
  return nodes;
}

// Helper: Batch translation API call
async function fetchCachedTranslations(texts: string[], source_lang: string, target_lang: string) {
  const items = texts.map(text => ({ text, source_lang, target_lang }));
  const res = await fetch('/api/translation-cache/batch-get', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(items),
  });
  return await res.json(); // { [originalText]: translatedText }
}

// Helper: Save translation to server
async function saveTranslation(text: string, source_lang: string, target_lang: string, translated: string) {
  await fetch('/api/translation-cache/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text, source_lang, target_lang, translated_text: translated }),
  });
}

// Helper: Translate using MyMemory API
async function translateText(text: string, source_lang: string, target_lang: string) {
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${source_lang}|${target_lang}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.responseData?.translatedText || text;
}

export function useAutoTranslate(language: 'tr' | 'en') {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (language !== 'en') return;
    setLoading(true);
    const nodes = getTextNodes(document.body);
    const originalTexts = Array.from(new Set(nodes.map(n => n.textContent!.trim())));
    fetchCachedTranslations(originalTexts, 'tr', 'en').then(async (cache) => {
      const missing = originalTexts.filter(t => !cache[t]);
      for (const text of missing) {
        const translated = await translateText(text, 'tr', 'en');
        cache[text] = translated;
        await saveTranslation(text, 'tr', 'en', translated);
      }
      for (const node of nodes) {
        const orig = node.textContent!.trim();
        if (cache[orig]) node.textContent = node.textContent!.replace(orig, cache[orig]);
      }
      setLoading(false);
    });
  }, [language]);

  return loading;
} 