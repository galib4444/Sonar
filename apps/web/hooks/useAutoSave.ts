/**
 * useAutoSave Hook
 * Auto-saves data every 30 seconds
 */

'use client';

import { useEffect, useRef, useState } from 'react';

interface UseAutoSaveOptions {
  data: any;
  onSave: (data: any) => Promise<void> | void;
  interval?: number; // in milliseconds
  enabled?: boolean;
}

export function useAutoSave({
  data,
  onSave,
  interval = 30000, // 30 seconds default
  enabled = true,
}: UseAutoSaveOptions) {
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string>(JSON.stringify(data));

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    const currentData = JSON.stringify(data);

    // Only save if data has changed
    if (currentData === previousDataRef.current) {
      return;
    }

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout
    saveTimeoutRef.current = setTimeout(async () => {
      setIsSaving(true);
      try {
        await onSave(data);
        setLastSaved(new Date());
        previousDataRef.current = currentData;
      } catch (error) {
        console.error('Auto-save failed:', error);
      } finally {
        setIsSaving(false);
      }
    }, interval);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [data, onSave, interval, enabled]);

  // Manual save function
  const saveNow = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSave(data);
      setLastSaved(new Date());
      previousDataRef.current = JSON.stringify(data);
    } catch (error) {
      console.error('Manual save failed:', error);
      throw error;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    lastSaved,
    isSaving,
    saveNow,
  };
}
