"use client"
import { cn } from "@/lib/utils"
import type { TableOfContentsProps } from "@/lib/blog/types"
import { useTOC } from "./toc-context"
import { ChevronRight, BookOpen } from "lucide-react"
import type { TOCItem } from "@/lib/blog/toc-utils"

type Props = {
  item: TOCItem
  activeId: string | null
  onItemClick: (id: string) => void
  level?: number
}

function TOCItemComponent({ item, activeId, onItemClick, level = 0 }: Props) {
  const isActive = activeId === item.id
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="list-none">
      <button
        onClick={() => onItemClick(item.id)}
        className={cn(
          "group relative w-full text-left py-2 px-5 transition-all duration-300 ease-out",
          "hover:text-foreground focus:outline-none",
          "before:absolute before:left-0 before:top-1/2 before:-translate-y-1/2 before:h-0 before:w-0.5 before:rounded-full",
          "before:bg-gradient-to-b before:from-primary/40 before:via-primary before:to-primary/40",
          "before:transition-all before:duration-500 before:ease-out",
          level === 0 && "pl-5",
          level === 1 && "pl-10",
          level >= 2 && "pl-14",
          isActive && [
            "text-foreground font-medium",
            "before:h-[70%] before:shadow-[0_0_12px_rgba(var(--primary),0.4)]",
          ],
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "w-1 h-1 rounded-full transition-all duration-500 ease-out",
              level === 0 && "w-1.5 h-1.5",
              isActive
                ? "bg-primary scale-100 shadow-[0_0_8px_rgba(var(--primary),0.5)]"
                : "bg-muted-foreground/30 scale-75 group-hover:scale-100 group-hover:bg-muted-foreground/60",
            )}
          />

          <span
            className={cn(
              "text-sm leading-relaxed transition-all duration-300",
              "group-hover:translate-x-0.5",
              level === 0 && "font-semibold text-[15px] tracking-tight",
              level === 1 && "text-muted-foreground font-medium",
              level >= 2 && "text-muted-foreground/80 text-[13px]",
              isActive && "text-foreground",
            )}
          >
            {item.text}
          </span>
        </div>
      </button>

      {hasChildren && (
        <ul className="mt-1 mb-2 space-y-0.5">
          {item.children!.map((child) => (
            <TOCItemComponent
              key={child.id}
              item={child}
              activeId={activeId}
              onItemClick={onItemClick}
              level={level + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function TableOfContentsRedesign({ className, ...props }: TableOfContentsProps) {
  const { items, activeId, scrollToHeading } = useTOC()

  if (!items || items.length === 0) {
    return null
  }

  return (
    <nav className={cn("sticky top-24 p-6", className)} aria-label="Table of contents" {...props}>
      <div className="flex items-center gap-2.5 pb-3 mb-4 border-b border-border/30">
        <div className="p-1.5 rounded-md bg-primary/10">
          <BookOpen className="w-3.5 h-3.5 text-primary" />
        </div>
        <h3 className="text-sm font-semibold text-foreground tracking-tight">Table of Contents</h3>
      </div>

      <div className="max-h-[calc(100vh-16rem)] overflow-y-auto pr-3 -mr-3 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
        <ul className="space-y-0">
          {items.map((item) => (
            <TOCItemComponent key={item.id} item={item} activeId={activeId} onItemClick={scrollToHeading} />
          ))}
        </ul>
      </div>

      <div className="mt-4 pt-3 border-t border-border/30">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Quick Navigation</span>
          <ChevronRight className="w-3 h-3 opacity-50" />
        </div>
      </div>
    </nav>
  )
}

interface MobileTOCRedesignProps extends TableOfContentsProps {
  isOpen: boolean
  onToggle: () => void
}

export function MobileTOCRedesign({ isOpen, onToggle, className, ...props }: MobileTOCRedesignProps) {
  const { items, activeId, scrollToHeading } = useTOC()

  if (!items || items.length === 0) {
    return null
  }

  const handleItemClick = (id: string) => {
    scrollToHeading(id)
    onToggle()
  }

  return (
    <div className={cn("lg:hidden", className)}>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center justify-between p-4 rounded-xl",
          "bg-gradient-to-r from-muted/50 to-muted/30 hover:from-muted/70 hover:to-muted/50",
          "border border-border/50 transition-all duration-300",
          "text-sm font-semibold text-foreground",
          "shadow-sm hover:shadow-md",
          isOpen && "bg-muted/70 shadow-md",
        )}
        aria-expanded={isOpen}
        aria-controls="mobile-toc"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-md bg-primary/10">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
          </div>
          <span>Table of Contents</span>
        </div>
        <ChevronRight
          className={cn("w-4 h-4 transition-transform duration-300 text-muted-foreground", isOpen && "rotate-90")}
        />
      </button>

      <div
        id="mobile-toc"
        className={cn(
          "grid transition-all duration-300 ease-out",
          isOpen ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-lg">
            <div className="max-h-[60vh] overflow-y-auto pr-2 -mr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
              <ul className="space-y-0">
                {items.map((item) => (
                  <TOCItemComponent key={item.id} item={item} activeId={activeId} onItemClick={handleItemClick} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
