/**
 * SortableSections Component
 * Wrapper for draggable resume sections with reordering
 */

'use client';

import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ResumeSectionEditor } from './ResumeSectionEditor';

export interface ResumeSection {
  id: string;
  name: string;
  content: string;
}

interface SortableSectionsProps {
  sections: ResumeSection[];
  onSectionsChange: (sections: ResumeSection[]) => void;
  onSectionContentChange: (id: string, content: string) => void;
  onDeleteSection?: (id: string) => void;
}

// Sortable Item Wrapper
function SortableSection({
  section,
  onContentChange,
  onDelete,
}: {
  section: ResumeSection;
  onContentChange: (content: string) => void;
  onDelete?: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ResumeSectionEditor
        sectionName={section.name}
        content={section.content}
        onChange={onContentChange}
        onDelete={onDelete}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </div>
  );
}

// Main Component
export function SortableSections({
  sections,
  onSectionsChange,
  onSectionContentChange,
  onDeleteSection,
}: SortableSectionsProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);

      const reorderedSections = arrayMove(sections, oldIndex, newIndex);
      onSectionsChange(reorderedSections);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={sections.map((s) => s.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-4">
          {sections.map((section) => (
            <SortableSection
              key={section.id}
              section={section}
              onContentChange={(content) => onSectionContentChange(section.id, content)}
              onDelete={
                onDeleteSection ? () => onDeleteSection(section.id) : undefined
              }
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}
