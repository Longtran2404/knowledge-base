/**
 * Custom hook for accessing CMS site content
 */

import { useState, useEffect, useCallback } from 'react';
import { siteContentApi } from '../lib/api/cms-api';
import type { PageContent, SiteContent } from '../types/cms';

/**
 * Hook to get content for a specific page
 */
export function usePageContent(pageKey: string) {
  const [content, setContent] = useState<PageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteContentApi.getPageContent(pageKey);
      setContent(data);
    } catch (err: any) {
      console.error('Error loading page content:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageKey]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  /**
   * Get content value by section and key
   */
  const getContent = (sectionKey: string, contentKey: string, defaultValue: string = ''): string => {
    return content?.sections[sectionKey]?.[contentKey]?.value || defaultValue;
  };

  /**
   * Get content metadata
   */
  const getMetadata = (sectionKey: string, contentKey: string): Record<string, any> | undefined => {
    return content?.sections[sectionKey]?.[contentKey]?.metadata;
  };

  return {
    content,
    loading,
    error,
    getContent,
    getMetadata,
    reload: loadContent,
  };
}

/**
 * Hook to get content for a specific section
 */
export function useSectionContent(pageKey: string, sectionKey: string) {
  const [contents, setContents] = useState<SiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteContentApi.getContentByPageAndSection(pageKey, sectionKey);
      setContents(data);
    } catch (err: any) {
      console.error('Error loading section content:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageKey, sectionKey]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  /**
   * Get content value by key
   */
  const getContent = (contentKey: string, defaultValue: string = ''): string => {
    const item = contents.find((c) => c.content_key === contentKey);
    return item?.content_value || defaultValue;
  };

  /**
   * Get all contents as a map
   */
  const getContentMap = (): Record<string, string> => {
    const map: Record<string, string> = {};
    contents.forEach((c) => {
      map[c.content_key] = c.content_value;
    });
    return map;
  };

  return {
    contents,
    loading,
    error,
    getContent,
    getContentMap,
    reload: loadContent,
  };
}

/**
 * Hook to get a single content item
 */
export function useContentItem(pageKey: string, sectionKey: string, contentKey: string) {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadContent = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await siteContentApi.getContentItem(pageKey, sectionKey, contentKey);
      setContent(data);
    } catch (err: any) {
      console.error('Error loading content item:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [pageKey, sectionKey, contentKey]);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  return {
    content,
    value: content?.content_value || '',
    metadata: content?.metadata,
    loading,
    error,
    reload: loadContent,
  };
}
