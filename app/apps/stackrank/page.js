"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "stackrank-state-v1";

const createId = () => {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export default function StackRank() {
  const [items, setItems] = useState([]);
  const [stacks, setStacks] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [newStackName, setNewStackName] = useState("");
  const [dragData, setDragData] = useState(null); // { itemId, sourceStackId: string | null }
  const [hoverPosition, setHoverPosition] = useState(null); // { stackId: string, index: number } | null
  const [editingStackId, setEditingStackId] = useState(null); // stackId being edited
  const [editingStackName, setEditingStackName] = useState(""); // temporary name while editing

  // Load from localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        // Initialize with one empty stack
        setStacks([
          {
            id: createId(),
            name: "Stack 1",
            itemIds: [],
          },
        ]);
        return;
      }
      const parsed = JSON.parse(raw);
      if (
        parsed &&
        Array.isArray(parsed.items) &&
        Array.isArray(parsed.stacks)
      ) {
        setItems(parsed.items);
        setStacks(
          parsed.stacks.length
            ? parsed.stacks
            : [
                {
                  id: createId(),
                  name: "Stack 1",
                  itemIds: [],
                },
              ]
        );
      }
    } catch (e) {
      console.error("Failed to load stackrank state", e);
    }
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      if (typeof window === "undefined") return;
      const payload = JSON.stringify({ items, stacks });
      window.localStorage.setItem(STORAGE_KEY, payload);
    } catch (e) {
      console.error("Failed to save stackrank state", e);
    }
  }, [items, stacks]);

  const handleAddItem = () => {
    const name = newItemName.trim();
    if (!name) return;

    // Prevent duplicate names (case-insensitive)
    const exists = items.some(
      (it) => it.name.toLowerCase() === name.toLowerCase()
    );
    if (exists) {
      setNewItemName("");
      return;
    }

    const newItem = { id: createId(), name };
    setItems((prev) => [...prev, newItem]);
    setNewItemName("");
  };

  const handleDeleteItem = (itemId) => {
    setItems((prev) => prev.filter((it) => it.id !== itemId));
    setStacks((prev) =>
      prev.map((stack) => ({
        ...stack,
        itemIds: stack.itemIds.filter((id) => id !== itemId),
      }))
    );
  };

  const handleCreateStack = () => {
    const baseName = newStackName.trim() || "Stack";
    const existingNames = new Set(stacks.map((s) => s.name));
    
    // If the name is unique, use it as-is
    if (!existingNames.has(baseName)) {
      const stack = {
        id: createId(),
        name: baseName,
        itemIds: [],
      };
      setStacks((prev) => [...prev, stack]);
      setNewStackName("");
      return;
    }
    
    // If the name is a duplicate, add a number suffix
    let suffix = 1;
    let candidate = `${baseName} ${suffix}`;
    while (existingNames.has(candidate)) {
      suffix += 1;
      candidate = `${baseName} ${suffix}`;
    }

    const stack = {
      id: createId(),
      name: candidate,
      itemIds: [],
    };
    setStacks((prev) => [...prev, stack]);
    setNewStackName("");
  };

  const handleDeleteStack = (stackId) => {
    setStacks((prev) => prev.filter((s) => s.id !== stackId));
  };

  const handleStartRenameStack = (stackId, currentName) => {
    setEditingStackId(stackId);
    setEditingStackName(currentName);
  };

  const handleSaveRenameStack = (stackId) => {
    const newName = editingStackName.trim();
    if (!newName) {
      setEditingStackId(null);
      return;
    }

    // Check if name is unique (excluding the current stack)
    const existingNames = new Set(
      stacks.filter((s) => s.id !== stackId).map((s) => s.name)
    );

    if (existingNames.has(newName)) {
      // Name is duplicate, don't save
      setEditingStackId(null);
      return;
    }

    setStacks((prev) =>
      prev.map((stack) =>
        stack.id === stackId ? { ...stack, name: newName } : stack
      )
    );
    setEditingStackId(null);
    setEditingStackName("");
  };

  const handleCancelRenameStack = () => {
    setEditingStackId(null);
    setEditingStackName("");
  };

  const handleRemoveItemFromStack = (stackId, itemId) => {
    setStacks((prev) =>
      prev.map((stack) =>
        stack.id === stackId
          ? { ...stack, itemIds: stack.itemIds.filter((id) => id !== itemId) }
          : stack
      )
    );
  };

  const startDragFromPool = (itemId) => {
    setDragData({ itemId, sourceStackId: null });
  };

  const startDragFromStack = (itemId, stackId) => {
    setDragData({ itemId, sourceStackId: stackId });
  };

  const clearDrag = () => {
    setDragData(null);
    setHoverPosition(null);
  };

  const insertItemIntoStack = (targetStackId, targetIndex) => {
    if (!dragData) return;
    const { itemId, sourceStackId } = dragData;

    setStacks((prevStacks) => {
      const next = prevStacks.map((s) => ({ ...s, itemIds: [...s.itemIds] }));
      const targetStack = next.find((s) => s.id === targetStackId);
      if (!targetStack) return prevStacks;

      // If dragging from a stack, remove from that stack first
      if (sourceStackId) {
        const source = next.find((s) => s.id === sourceStackId);
        if (source) {
          const fromIndex = source.itemIds.indexOf(itemId);
          if (fromIndex !== -1) {
            source.itemIds.splice(fromIndex, 1);
            // Adjust target index if we're moving within same stack and past original position
            if (source.id === targetStack.id && fromIndex < targetIndex) {
              targetIndex -= 1;
            }
          }
        }
      }

      // Prevent duplicate item in the same stack
      if (targetStack.itemIds.includes(itemId)) {
        return next;
      }

      if (targetIndex < 0 || targetIndex > targetStack.itemIds.length) {
        targetIndex = targetStack.itemIds.length;
      }
      targetStack.itemIds.splice(targetIndex, 0, itemId);
      return next;
    });

    clearDrag();
  };

  const handleDropOnStack = (e, stackId) => {
    e.preventDefault();
    // Drop to end of stack
    const stack = stacks.find((s) => s.id === stackId);
    const index = stack ? stack.itemIds.length : 0;
    insertItemIntoStack(stackId, index);
    setHoverPosition(null);
  };

  const handleDropOnItem = (e, stackId, targetIndex) => {
    e.preventDefault();
    insertItemIntoStack(stackId, targetIndex);
    setHoverPosition(null);
  };

  const handleDragOverStack = (e, stackId) => {
    e.preventDefault();
    if (!dragData) return;
    
    const stack = stacks.find((s) => s.id === stackId);
    if (!stack) return;
    
    // If stack is empty, show indicator at position 0
    if (stack.itemIds.length === 0) {
      setHoverPosition({ stackId, index: 0 });
      return;
    }
    
    // If dragging over empty space at bottom of stack, show at end
    const rect = e.currentTarget.getBoundingClientRect();
    const stackItemsContainer = e.currentTarget.querySelector('[data-stack-items]');
    if (stackItemsContainer) {
      const containerRect = stackItemsContainer.getBoundingClientRect();
      const y = e.clientY;
      // If we're below all items, show at end
      if (y > containerRect.bottom - 20) {
        setHoverPosition({ stackId, index: stack.itemIds.length });
      }
    }
  };

  const handleDragOverItem = (e, stackId, itemIndex) => {
    e.preventDefault();
    if (!dragData) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const itemCenter = rect.height / 2;
    
    // Determine if we're in the top or bottom half
    if (y < itemCenter) {
      setHoverPosition({ stackId, index: itemIndex });
    } else {
      setHoverPosition({ stackId, index: itemIndex + 1 });
    }
  };

  const handleDragLeaveStack = (e, stackId) => {
    // Only clear if we're actually leaving the stack area
    const relatedTarget = e.relatedTarget;
    if (!relatedTarget || !e.currentTarget.contains(relatedTarget)) {
      setHoverPosition(null);
    }
  };

  const getItemById = (id) => items.find((it) => it.id === id);

  return (
    <div className="min-h-screen px-4 py-10 text-gray-900">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold">Stack Ranking Tool</h1>
          <p className="text-sm text-gray-600 mt-2">
            Add items once, then create one or more stacks to rank them by
            dragging and dropping.
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full lg:w-80 space-y-4">
            {/* Item input section */}
            <div className="bg-gray-200 border border-gray-300 rounded-xl p-3 shadow-sm">
              <h2 className="text-base font-semibold mb-2">Items</h2>
              <div className="flex flex-col gap-2 mb-3">
                <input
                  type="text"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddItem();
                    }
                  }}
                  placeholder="Enter item name"
                  className="w-full rounded-md px-3 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddItem}
                  className="w-full px-3 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
                  disabled={!newItemName.trim()}
                >
                  Add Item
                </button>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-gray-700 mb-2">
                  Item Pool (drag into stacks)
                </h3>
                {items.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    No items yet.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        draggable
                        onDragStart={() => startDragFromPool(item.id)}
                        onDragEnd={clearDrag}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-md bg-white border border-gray-300 cursor-grab hover:border-blue-400 hover:bg-blue-50 text-sm"
                      >
                        <span className="break-words">
                          {item.name}
                        </span>
                        <button
                          onClick={() => handleDeleteItem(item.id)}
                          className="opacity-60 group-hover:opacity-100 text-xs text-red-600 hover:text-red-500"
                          aria-label={`Delete ${item.name}`}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stack management */}
            <div className="bg-gray-200 border border-gray-300 rounded-xl p-3 shadow-sm">
              <h2 className="text-base font-semibold mb-2">Stacks</h2>
              <div className="flex flex-col gap-2 mb-2">
                <input
                  type="text"
                  value={newStackName}
                  onChange={(e) => setNewStackName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleCreateStack();
                    }
                  }}
                  placeholder='Optional name (defaults to "Stack")'
                  className="w-full rounded-md px-3 py-2 bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleCreateStack}
                  className="w-full px-3 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-500 transition"
                >
                  Create Stack
                </button>
              </div>
              <p className="text-xs text-gray-600">
                Drag from the pool, reorder within a stack, or move between
                stacks.
              </p>
            </div>
          </aside>

          {/* Main area */}
          <section className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-4">
              {stacks.map((stack) => {
                // Calculate max width based on number of stacks
                let maxWidth;
                if (stacks.length === 1) {
                  maxWidth = '100%';
                } else if (stacks.length === 2) {
                  maxWidth = 'calc(50% - 8px)';
                } else if (stacks.length === 3) {
                  maxWidth = 'calc(50% - 8px)'; // Allow 2 per row, so they can be wider
                } else {
                  maxWidth = 'calc(25% - 12px)'; // Max 4 per row
                }
                
                return (
                  <div
                    key={stack.id}
                    className="flex flex-col bg-gray-200 border border-gray-300 rounded-xl p-3 shadow-sm flex-1 min-w-[200px]"
                    style={{ maxWidth }}
                    onDrop={(e) => handleDropOnStack(e, stack.id)}
                  >
                  <div className="flex items-center mb-2 gap-2">
                    {editingStackId === stack.id ? (
                      <>
                        <input
                          type="text"
                          value={editingStackName}
                          onChange={(e) => setEditingStackName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveRenameStack(stack.id);
                            } else if (e.key === "Escape") {
                              handleCancelRenameStack();
                            }
                          }}
                          onBlur={() => handleSaveRenameStack(stack.id)}
                          autoFocus
                          className="flex-1 px-2 py-1 text-sm font-semibold rounded bg-white border border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </>
                    ) : (
                      <>
                        <div className="font-semibold flex-1 truncate">
                          {stack.name}
                        </div>
                        <button
                          onClick={() =>
                            handleStartRenameStack(stack.id, stack.name)
                          }
                          className="text-xs text-blue-600 hover:text-blue-500"
                          title="Rename stack"
                        >
                          ✎
                        </button>
                        <button
                          onClick={() => handleDeleteStack(stack.id)}
                          className="text-xs text-red-600 hover:text-red-500"
                          title="Delete stack"
                        >
                          ✕
                        </button>
                      </>
                    )}
                  </div>
                  <div
                    className="flex-1 min-h-[3rem] rounded-md bg-white border border-dashed border-gray-300 px-2 py-2 relative"
                    data-stack-items
                    onDragOver={(e) => handleDragOverStack(e, stack.id)}
                    onDragLeave={(e) => handleDragLeaveStack(e, stack.id)}
                  >
                    {stack.itemIds.length === 0 ? (
                      <>
                        {hoverPosition?.stackId === stack.id &&
                          hoverPosition?.index === 0 && (
                            <div className="absolute top-2 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10 shadow-lg shadow-blue-500/30" />
                          )}
                        <div className="text-xs text-gray-500 italic">
                          Drop items here to build this stack.
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 relative">
                        {stack.itemIds.map((itemId, index) => {
                          const item = getItemById(itemId);
                          if (!item) return null;
                          const showIndicatorAbove =
                            hoverPosition?.stackId === stack.id &&
                            hoverPosition?.index === index;
                          const showIndicatorBelow =
                            hoverPosition?.stackId === stack.id &&
                            hoverPosition?.index === index + 1;

                          return (
                            <div key={itemId + index} className="relative">
                              {showIndicatorAbove && (
                                <div className="absolute -top-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10 shadow-lg shadow-blue-500/30" />
                              )}
                              <div
                                data-item-index={index}
                                draggable
                                onDragStart={() =>
                                  startDragFromStack(itemId, stack.id)
                                }
                                onDragEnd={clearDrag}
                                onDragOver={(e) =>
                                  handleDragOverItem(e, stack.id, index)
                                }
                                onDrop={(e) =>
                                  handleDropOnItem(e, stack.id, index)
                                }
                                className="group/item flex items-center justify-between px-3 py-1.5 rounded bg-white border border-gray-300 cursor-grab hover:border-blue-400 hover:bg-blue-50 text-sm relative z-0"
                              >
                                <span className="break-words mr-2 flex-1">
                                  {item.name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500">
                                    #{index + 1}
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleRemoveItemFromStack(stack.id, itemId);
                                    }}
                                    className="opacity-0 group-hover/item:opacity-100 text-xs text-red-600 hover:text-red-500 transition-opacity"
                                    title="Remove from stack"
                                  >
                                    ✕
                                  </button>
                                </div>
                              </div>
                              {showIndicatorBelow && (
                                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-blue-500 rounded-full z-10 shadow-lg shadow-blue-500/30" />
                              )}
                            </div>
                          );
                        })}
                        {hoverPosition?.stackId === stack.id &&
                          hoverPosition?.index === stack.itemIds.length && (
                            <div className="h-0.5 bg-blue-500 rounded-full z-10 shadow-lg shadow-blue-500/30 mt-2" />
                          )}
                      </div>
                    )}
                  </div>
                  </div>
                );
              })}
            </div>

            {stacks.length === 0 && (
              <div className="mt-6 text-center text-sm text-gray-600">
                No stacks yet. Create one in the sidebar to start ranking your
                items.
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

