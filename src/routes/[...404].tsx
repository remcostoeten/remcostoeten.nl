import { ButtonLink } from "~/components/ui/ButtonLink";

type TProps = {
  readonly url?: string;
};

function NotFound(props: TProps) {
  return (
    <div class="min-h-screen bg-background text-foreground flex items-center">
      <div class="container-centered">
        <div class="text-center space-y-8">
          <div class="space-y-6">
            <h1 class="text-8xl md:text-9xl font-bold text-muted-foreground/30 select-none">
              404
            </h1>
            <div class="h-px bg-border w-24 mx-auto"></div>
          </div>

          <div class="space-y-4">
            <h2 class="text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p class="text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div class="space-y-4">
            <ButtonLink
              href="/"
              variant="admin"
            >
              ← Back to Home
            </ButtonLink>
          </div>

          <div class="pt-8 space-y-2">
            <p class="text-sm text-muted-foreground">
              <ButtonLink href="/projects" variant="link">View Projects</ButtonLink>
              {" • "}
              <ButtonLink href="/contact" variant="link">Contact</ButtonLink>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
