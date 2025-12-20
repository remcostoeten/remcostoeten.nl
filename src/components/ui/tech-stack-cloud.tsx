import { PlusIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type TechLogo = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

type TechStackCloudProps = React.ComponentProps<"div">;

export function TechStackCloud({ className, ...props }: TechStackCloudProps) {
  return (
    <div
      className={cn(
        "relative grid grid-cols-2 border-x md:grid-cols-4",
        className
      )}
      {...props}
    >
      <div className="-translate-x-1/2 -top-px pointer-events-none absolute left-1/2 w-screen border-t" />

      <TechCard
        className="relative border-r border-b bg-secondary dark:bg-secondary/30"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg",
          alt: "React Logo",
        }}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6"
          strokeWidth={1}
        />
      </TechCard>

      <TechCard
        className="border-b md:border-r"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg",
          alt: "TypeScript Logo",
        }}
      />

      <TechCard
        className="relative border-r border-b md:bg-secondary dark:md:bg-secondary/30"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg",
          alt: "Next.js Logo",
        }}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] absolute z-10 size-6"
          strokeWidth={1}
        />
        <PlusIcon
          className="-bottom-[12.5px] -left-[12.5px] absolute z-10 hidden size-6 md:block"
          strokeWidth={1}
        />
      </TechCard>

      <TechCard
        className="relative border-b bg-secondary md:bg-background dark:bg-secondary/30 md:dark:bg-background"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg",
          alt: "Tailwind CSS Logo",
        }}
      />

      <TechCard
        className="relative border-r border-b bg-secondary md:border-b-0 md:bg-background dark:bg-secondary/30 md:dark:bg-background"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg",
          alt: "Node.js Logo",
        }}
      >
        <PlusIcon
          className="-right-[12.5px] -bottom-[12.5px] md:-left-[12.5px] absolute z-10 size-6 md:hidden"
          strokeWidth={1}
        />
      </TechCard>

      <TechCard
        className="border-b bg-background md:border-r md:border-b-0 md:bg-secondary dark:md:bg-secondary/30"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg",
          alt: "PostgreSQL Logo",
        }}
      />

      <TechCard
        className="border-r"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg",
          alt: "Git Logo",
        }}
      />

      <TechCard
        className="bg-secondary dark:bg-secondary/30"
        tech={{
          src: "https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vercel/vercel-original.svg",
          alt: "Vercel Logo",
        }}
      />

      <div className="-translate-x-1/2 -bottom-px pointer-events-none absolute left-1/2 w-screen border-b" />
    </div>
  );
}

type TechCardProps = React.ComponentProps<"div"> & {
  tech: TechLogo;
};

function TechCard({ tech, className, children, ...props }: TechCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-center bg-background px-4 py-8 md:p-8",
        className
      )}
      {...props}
    >
      <img
        alt={tech.alt}
        className="pointer-events-none h-4 select-none md:h-5 dark:brightness-0 dark:invert"
        height={tech.height || "auto"}
        src={tech.src}
        width={tech.width || "auto"}
      />
      {children}
    </div>
  );
}
