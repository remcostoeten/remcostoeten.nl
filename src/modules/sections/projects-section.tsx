  import { Text } from "~/components/primitives/text";
  import { ArrowLink } from "~/components/ui/arrow-link";

  export function ProjectsSection() {
    return (
      <div> // this will be a  `block` element in the CMS which is required if you want to add any widget (e.g. text) to the page.

  // Text would be the widget that we add inside a `block` element.
  // Text consists of base styling and multiple variants which can be selected in the CMS on individual characters or words. 
  // We define via SolidJS code the styling and/or functionality of the variant.
        <Text as="span" variant="highlight">
          TypeScript and React & Next.js
        </Text>
        <Text as="p" variant="body">
          Recently I've been building{" "}
          <ArrowLink href="https://github.com/remcostoeten/nextjs-15-roll-your-own-authentication">
            Roll Your Own Authentication
          </ArrowLink>
          and{" "}
          <ArrowLink href="https://github.com/remcostoeten/Turso-db-creator-auto-retrieve-env-credentials">
            Turso DB Creator CLI
          </ArrowLink>
          and various{" "}
          <Text as="span" variant="highlight">
            CLI tools & automation scripts
          </Text>
          . More projects and experiments can be found on{" "}
          <ArrowLink href="https://github.com/remcostoeten">
            GitHub
          </ArrowLink>
          .
        </Text>
      </div>
    );
  }
