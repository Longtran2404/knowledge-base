import React, { useEffect, useMemo, useState } from "react";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";
import { Progress } from "../ui/progress";
import { Link } from "react-router-dom";
import { safeParseJson } from "../../lib/safe-json";

export interface GuideItem {
  id: string;
  title: string;
  description?: string;
  to?: string; // optional internal route to navigate
}

export interface GuideSection {
  id: string;
  title: string;
  items: GuideItem[];
}

type GuideMode = "all" | "pending" | "nextOnly";

interface InstructionGuideProps {
  sections: GuideSection[];
  initiallyOpenIds?: string[];
  onComplete?: () => void;
  storageKey?: string; // persist checklist progress per key
  mode?: GuideMode; // control visibility of steps
}

const InstructionGuide: React.FC<InstructionGuideProps> = ({
  sections,
  initiallyOpenIds = [],
  onComplete,
  storageKey = "nlc_guide_items_done",
  mode = "all",
}) => {
  const [openIds, setOpenIds] = useState<Set<string>>(
    new Set(initiallyOpenIds)
  );
  const [doneSet, setDoneSet] = useState<Set<string>>(() => {
    const raw = localStorage.getItem(storageKey);
    const arr = safeParseJson<string[]>(raw, []);
    return new Set(Array.isArray(arr) ? arr : []);
  });

  const toggle = (id: string) => {
    const next = new Set(openIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setOpenIds(next);
  };

  const toggleItem = (itemId: string) => {
    const next = new Set(doneSet);
    if (next.has(itemId)) next.delete(itemId);
    else next.add(itemId);
    setDoneSet(next);
  };

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(Array.from(doneSet)));
    } catch {}
  }, [doneSet, storageKey]);

  const flatItems = useMemo(() => sections.flatMap((s) => s.items), [sections]);
  const totalItems = flatItems.length;
  const completedItems = flatItems.filter((i) => doneSet.has(i.id)).length;
  const nextPendingId = useMemo(() => {
    const next = flatItems.find((i) => !doneSet.has(i.id));
    return next?.id;
  }, [flatItems, doneSet]);

  useEffect(() => {
    if (totalItems > 0 && completedItems === totalItems) {
      onComplete?.();
    }
  }, [completedItems, totalItems, onComplete]);

  return (
    <div className="w-full max-w-md border rounded-lg shadow-sm bg-white">
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Instruction guide</h2>
            <p className="text-sm text-muted-foreground">
              Giới thiệu các tính năng theo từng bước.
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            {completedItems}/{totalItems}
          </div>
        </div>
        <div className="mt-3">
          <Progress
            value={totalItems ? (completedItems / totalItems) * 100 : 0}
          />
        </div>
      </div>
      <Separator />
      <div className="divide-y">
        {sections.map((s) => {
          const open = openIds.has(s.id);
          return (
            <div key={s.id} className="p-4">
              <button
                type="button"
                className="w-full flex items-center justify-between text-left"
                onClick={() => toggle(s.id)}
              >
                <span className="font-medium">{s.title}</span>
                <span className="text-sm text-muted-foreground">
                  {open ? "Thu gọn" : "Mở rộng"}
                </span>
              </button>
              {open ? (
                <div className="mt-3 space-y-2">
                  {s.items
                    .filter((it) => {
                      if (mode === "all") return true;
                      if (mode === "pending") return !doneSet.has(it.id);
                      if (mode === "nextOnly") return it.id === nextPendingId;
                      return true;
                    })
                    .map((it) => {
                      const checked = doneSet.has(it.id);
                      return (
                        <div key={it.id} className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            className="mt-1"
                            checked={checked}
                            onChange={() => toggleItem(it.id)}
                            aria-label={`Đánh dấu hoàn thành ${it.title}`}
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              {it.to ? (
                                <Link
                                  to={it.to}
                                  onClick={() => toggleItem(it.id)}
                                  className="hover:underline text-blue-600"
                                >
                                  {it.title}
                                </Link>
                              ) : (
                                it.title
                              )}
                            </div>
                            {it.description ? (
                              <div className="text-xs text-muted-foreground">
                                {it.description}
                              </div>
                            ) : null}
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
      <Separator />
      <div className="p-4 flex gap-2 justify-between">
        <Button
          variant="default"
          onClick={() => {
            if (onComplete) onComplete();
          }}
        >
          Đánh dấu đã hoàn thành
        </Button>
        <Button variant="secondary" onClick={() => setOpenIds(new Set())}>
          Thu gọn tất cả
        </Button>
        <Button onClick={() => setOpenIds(new Set(sections.map((s) => s.id)))}>
          Mở rộng tất cả
        </Button>
      </div>
    </div>
  );
};

export default InstructionGuide;
