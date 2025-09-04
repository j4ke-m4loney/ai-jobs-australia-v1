import React, { useRef, useCallback, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bold, Italic, List, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor = React.forwardRef<
  HTMLDivElement,
  RichTextEditorProps
// eslint-disable-next-line @typescript-eslint/no-unused-vars
>(({ value, onChange, placeholder, className, minHeight = "150px" }, _ref) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [activeStates, setActiveStates] = useState({
    bold: false,
    italic: false,
    list: false,
  });
  const [isInternalUpdate, setIsInternalUpdate] = useState(false);
  const [lastExternalValue, setLastExternalValue] = useState(value);

  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (
      selection &&
      selection.rangeCount > 0 &&
      editorRef.current?.contains(selection.anchorNode)
    ) {
      return {
        startContainer: selection.anchorNode,
        startOffset: selection.anchorOffset,
        endContainer: selection.focusNode,
        endOffset: selection.focusOffset,
      };
    }
    return null;
  }, []);

  // Modern DOM manipulation utilities
  const getCurrentSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    return selection.getRangeAt(0);
  }, []);

  const isInListItem = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return null;
    
    let node = selection.getRangeAt(0).commonAncestorContainer;
    while (node && node !== editorRef.current) {
      if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'LI') {
        return node as HTMLLIElement;
      }
      node = node.parentNode;
    }
    return null;
  }, []);

  const getCurrentList = useCallback(() => {
    const listItem = isInListItem();
    if (!listItem) return null;
    return listItem.parentElement as HTMLUListElement | null;
  }, [isInListItem]);

  const createListItem = useCallback((content = '') => {
    const li = document.createElement('li');
    li.innerHTML = content || '<br>';
    return li;
  }, []);

  const insertList = useCallback(() => {
    if (!editorRef.current) return;
    
    const range = getCurrentSelection();
    if (!range) return;

    // Check if we're already in a list
    const existingList = getCurrentList();
    if (existingList) {
      // Remove the list
      const listItems = Array.from(existingList.children);
      const fragment = document.createDocumentFragment();
      
      listItems.forEach((li) => {
        const p = document.createElement('p');
        p.innerHTML = li.innerHTML || '<br>';
        fragment.appendChild(p);
      });
      
      existingList.parentNode?.replaceChild(fragment, existingList);
    } else {
      // Create new list
      const ul = document.createElement('ul');
      const li = createListItem();
      ul.appendChild(li);
      
      // Insert the list at the current position
      range.deleteContents();
      range.insertNode(ul);
      
      // Move cursor into the list item
      const newRange = document.createRange();
      newRange.setStart(li, 0);
      newRange.collapse(true);
      const selection = window.getSelection();
      selection?.removeAllRanges();
      selection?.addRange(newRange);
    }
    
    // Trigger change event
    if (editorRef.current) {
      setIsInternalUpdate(true);
      onChange(editorRef.current.innerHTML);
      setLastExternalValue(editorRef.current.innerHTML);
      setIsInternalUpdate(false);
    }
    
    updateActiveStates();
  }, [getCurrentSelection, getCurrentList, createListItem, onChange, updateActiveStates]);

  const restoreSelection = useCallback((selectionData: {
    startContainer: Node;
    startOffset: number;
    endContainer: Node;
    endOffset: number;
  } | null) => {
    if (!selectionData || !editorRef.current) return;

    try {
      const selection = window.getSelection();
      const range = document.createRange();

      range.setStart(selectionData.startContainer, selectionData.startOffset);
      range.setEnd(selectionData.endContainer, selectionData.endOffset);

      selection?.removeAllRanges();
      selection?.addRange(range);
    } catch {
      // Fallback: set cursor to end
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      range.collapse(false);
      selection?.removeAllRanges();
      selection?.addRange(range);
    }
  }, []);

  const updateActiveStates = useCallback(() => {
    if (!editorRef.current) return;

    const listItem = isInListItem();
    const isInList = !!listItem;

    setActiveStates({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      list: isInList,
    });
  }, [isInListItem]);


  const executeCommand = useCallback(
    (command: string, value?: string) => {
      if (!editorRef.current) return;

      // Ensure editor is focused
      editorRef.current.focus();

      // Handle list command with modern implementation
      if (command === 'insertUnorderedList') {
        insertList();
        return;
      }

      // Use browser's native functionality for other commands
      try {
        const success = document.execCommand(command, false, value);
        console.log(`✅ ${command} executed:`, success);
      } catch (err) {
        console.warn(`Command ${command} failed:`, err);
      }

      // Update content and states
      if (editorRef.current) {
        setIsInternalUpdate(true);
        onChange(editorRef.current.innerHTML);
        setLastExternalValue(editorRef.current.innerHTML);
        setIsInternalUpdate(false);
      }

      // Update button states
      setTimeout(updateActiveStates, 10);
    },
    [onChange, updateActiveStates, insertList]
  );

  const handleInput = useCallback(() => {
    if (editorRef.current) {
      setIsInternalUpdate(true);
      onChange(editorRef.current.innerHTML);
      setLastExternalValue(editorRef.current.innerHTML);
      setIsInternalUpdate(false);
    }
    updateActiveStates();
  }, [onChange, updateActiveStates]);

  const handleEnterInList = useCallback(() => {
    const listItem = isInListItem();
    if (!listItem) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    // Check if the current list item is empty
    const isEmpty = listItem.textContent?.trim() === '';
    
    if (isEmpty) {
      // Exit the list by converting to paragraph
      const p = document.createElement('p');
      p.innerHTML = '<br>';
      listItem.parentNode?.parentNode?.insertBefore(p, listItem.parentNode?.nextSibling || null);
      
      // Remove the empty list item
      listItem.remove();
      
      // If the list is now empty, remove it entirely
      const list = getCurrentList();
      if (list && list.children.length === 0) {
        list.remove();
      }
      
      // Move cursor to the new paragraph
      const range = document.createRange();
      range.setStart(p, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      return true;
    } else {
      // Create a new list item
      const newListItem = createListItem();
      listItem.parentNode?.insertBefore(newListItem, listItem.nextSibling);
      
      // Move cursor to the new list item
      const range = document.createRange();
      range.setStart(newListItem, 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      
      return true;
    }
  }, [isInListItem, getCurrentList, createListItem]);

  const handleBackspaceInList = useCallback(() => {
    const listItem = isInListItem();
    if (!listItem) return false;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return false;

    const range = selection.getRangeAt(0);
    
    // Only handle if cursor is at the very beginning of the list item
    if (range.startOffset === 0 && range.endOffset === 0) {
      const isEmpty = listItem.textContent?.trim() === '';
      
      if (isEmpty) {
        // Remove empty list item and convert to paragraph
        const p = document.createElement('p');
        p.innerHTML = '<br>';
        listItem.parentNode?.parentNode?.insertBefore(p, listItem.parentNode?.nextSibling || null);
        listItem.remove();
        
        // Clean up empty list
        const list = getCurrentList();
        if (list && list.children.length === 0) {
          list.remove();
        }
        
        // Move cursor to paragraph
        const newRange = document.createRange();
        newRange.setStart(p, 0);
        newRange.collapse(true);
        selection.removeAllRanges();
        selection.addRange(newRange);
        
        return true;
      }
    }
    
    return false;
  }, [isInListItem, getCurrentList]);

  const handleTabInList = useCallback((shiftKey: boolean) => {
    const listItem = isInListItem();
    if (!listItem) return false;

    if (shiftKey) {
      // Outdent - move list item up one level
      const parentList = listItem.parentNode as HTMLUListElement;
      const grandparentListItem = parentList.parentNode as HTMLLIElement;
      
      if (grandparentListItem && grandparentListItem.tagName === 'LI') {
        // Move after the parent list item
        grandparentListItem.parentNode?.insertBefore(listItem, grandparentListItem.nextSibling);
        
        // Clean up empty nested list
        if (parentList.children.length === 0) {
          parentList.remove();
        }
        
        return true;
      }
    } else {
      // Indent - create nested list
      const prevListItem = listItem.previousElementSibling as HTMLLIElement;
      if (prevListItem && prevListItem.tagName === 'LI') {
        let nestedList = prevListItem.querySelector('ul');
        if (!nestedList) {
          nestedList = document.createElement('ul');
          prevListItem.appendChild(nestedList);
        }
        nestedList.appendChild(listItem);
        return true;
      }
    }
    
    return false;
  }, [isInListItem]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "b":
            e.preventDefault();
            executeCommand("bold");
            break;
          case "i":
            e.preventDefault();
            executeCommand("italic");
            break;
        }
        return;
      }

      // Handle special keys in lists
      switch (e.key) {
        case 'Enter':
          if (handleEnterInList()) {
            e.preventDefault();
            handleInput();
            updateActiveStates();
          }
          break;
          
        case 'Backspace':
          if (handleBackspaceInList()) {
            e.preventDefault();
            handleInput();
            updateActiveStates();
          }
          break;
          
        case 'Tab':
          if (handleTabInList(e.shiftKey)) {
            e.preventDefault();
            handleInput();
            updateActiveStates();
          }
          break;
      }
    },
    [executeCommand, handleEnterInList, handleBackspaceInList, handleTabInList, handleInput, updateActiveStates]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const text = e.clipboardData.getData("text/plain");
      document.execCommand("insertText", false, text);
      handleInput();
    },
    [handleInput]
  );

  const handleSelectionChange = useCallback(() => {
    if (document.activeElement === editorRef.current) {
      updateActiveStates();
    }
  }, [updateActiveStates]);

  // Handle external value changes (preserve cursor position)
  useEffect(() => {
    if (!isInternalUpdate && editorRef.current && value !== lastExternalValue) {
      const savedSelection = saveSelection();
      editorRef.current.innerHTML = value;
      setLastExternalValue(value);

      // Restore cursor position after a brief delay
      setTimeout(() => {
        if (savedSelection && editorRef.current) {
          editorRef.current.focus();
          restoreSelection(savedSelection);
        }
      }, 0);
    }
  }, [
    value,
    isInternalUpdate,
    lastExternalValue,
    saveSelection,
    restoreSelection,
  ]);

  useEffect(() => {
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange);
    };
  }, [handleSelectionChange]);

  // Initialize content on first render
  useEffect(() => {
    if (editorRef.current && !editorRef.current.innerHTML) {
      editorRef.current.innerHTML = value || "";
      setLastExternalValue(value);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={cn("border border-input rounded-md", className)}>
      {/* Toolbar */}
      <div className="flex items-center gap-1 p-2 border-b border-border bg-muted/30">
        <Button
          type="button"
          variant={activeStates.bold ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            console.log("🖱️ Bold button clicked!");
            e.preventDefault();
            e.stopPropagation();
            executeCommand("bold");
          }}
          onMouseDown={(e) => {
            // Prevent button from stealing focus from editor
            e.preventDefault();
          }}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeStates.italic ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            console.log("🖱️ Italic button clicked!");
            e.preventDefault();
            e.stopPropagation();
            executeCommand("italic");
          }}
          onMouseDown={(e) => {
            // Prevent button from stealing focus from editor
            e.preventDefault();
          }}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={activeStates.list ? "default" : "ghost"}
          size="sm"
          className="h-8 w-8 p-0"
          onClick={(e) => {
            console.log("🖱️ List button clicked!", {
              activeStates,
              editorFocused: document.activeElement === editorRef.current,
            });
            e.preventDefault();
            e.stopPropagation();
            executeCommand("insertUnorderedList");
          }}
          onMouseDown={(e) => {
            // Prevent button from stealing focus from editor
            e.preventDefault();
          }}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <div className="ml-auto">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                title="Keyboard Shortcuts"
              >
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Keyboard Shortcuts</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span>Bold</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">
                      Ctrl + B
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Italic</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">
                      Ctrl + I
                    </kbd>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>List</span>
                    <kbd className="px-2 py-1 bg-muted rounded text-xs">
                      ⌘ + Shift + 8
                    </kbd>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Editor */}
      <div
        ref={editorRef}
        contentEditable
        className={cn(
          "w-full px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          `min-h-[${minHeight}]`
        )}
        style={{ minHeight }}
        onInput={handleInput}
        onPaste={handlePaste}
        onKeyDown={handleKeyDown}
        data-placeholder={placeholder}
        suppressContentEditableWarning={true}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            [contenteditable]:empty:before {
              content: attr(data-placeholder);
              color: hsl(var(--muted-foreground));
              pointer-events: none;
            }
            [contenteditable] ul {
              list-style-type: disc;
              margin-left: 1.5rem;
              padding-left: 0;
            }
            [contenteditable] ul ul {
              list-style-type: circle;
              margin-left: 1.5rem;
            }
            [contenteditable] ul ul ul {
              list-style-type: square;
            }
            [contenteditable] li {
              margin-bottom: 0.25rem;
              line-height: 1.5;
            }
            [contenteditable] li:last-child {
              margin-bottom: 0;
            }
          `,
        }}
      />
    </div>
  );
});

RichTextEditor.displayName = "RichTextEditor";
