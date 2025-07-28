import { A } from "@solidjs/router";
import { Motion } from "@motionone/solid";
import { CMSContainer } from "~/cms/container";

type TProps = {
  readonly url?: string;
};

function NotFound(props: TProps) {
  return (
    <div class="min-h-screen bg-background text-foreground flex items-center">
      <div class={CMSContainer()}>
        <div class="text-center space-y-8">
          <Motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, easing: [0.4, 0.0, 0.2, 1] }}
          >
            <div class="space-y-6">
              <h1 class="text-8xl md:text-9xl font-bold text-muted-foreground/30 select-none">
                404
              </h1>
              <div class="h-px bg-border w-24 mx-auto"></div>
            </div>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, easing: [0.4, 0.0, 0.2, 1] }}
            class="space-y-4"
          >
            <h2 class="text-2xl font-semibold text-foreground">
              Page Not Found
            </h2>
            <p class="text-muted-foreground max-w-md mx-auto leading-relaxed">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, easing: [0.4, 0.0, 0.2, 1] }}
            class="space-y-4"
          >
            <A 
              href="/" 
              class="theme-link inline-block px-6 py-3 border border-border rounded-md hover:bg-muted transition-all duration-300 ease-in-out hover:border-accent/50 hover:shadow-sm"
            >
              ← Back to Home
            </A>
          </Motion.div>

          <Motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            class="pt-8 space-y-2"
          >
            <p class="text-sm text-muted-foreground">
              <A href="/projects" class="theme-link">View Projects</A>
              {" • "}
              <A href="/contact" class="theme-link">Contact</A>
            </p>
          </Motion.div>
        </div>
      </div>
    </div>
  );
}

export default NotFound;
