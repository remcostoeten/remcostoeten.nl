import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { mdxComponents } from '../mdx-components';

// Mock Next.js Image component
vi.mock('next/image', () => ({
  default: ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} data-testid="next-image" />
  )
}));

describe('MDX Components Integration', () => {
  it('renders Callout component through MDX', () => {
    const CalloutComponent = mdxComponents.Callout!;
    
    render(
      <CalloutComponent type="note" title="Test Note">
        This is a test callout
      </CalloutComponent>
    );

    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByText('Test Note')).toBeInTheDocument();
    expect(screen.getByText('This is a test callout')).toBeInTheDocument();
  });

  it('renders ImageWithCaption component through MDX', () => {
    const ImageComponent = mdxComponents.ImageWithCaption!;
    
    render(
      <ImageComponent 
        src="/test.jpg" 
        alt="Test image" 
        caption="Test caption"
        width={400}
        height={300}
      />
    );

    expect(screen.getByAltText('Test image')).toBeInTheDocument();
    expect(screen.getByText('Test caption')).toBeInTheDocument();
  });

  it('renders EnhancedTable component through MDX', () => {
    const TableComponent = mdxComponents.EnhancedTable!;
    
    const columns = [
      { key: 'name', label: 'Name' },
      { key: 'value', label: 'Value' }
    ];
    
    const data = [
      { name: 'Item 1', value: 'Value 1' },
      { name: 'Item 2', value: 'Value 2' }
    ];

    render(
      <TableComponent columns={columns} data={data} />
    );

    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Value')).toBeInTheDocument();
    expect(screen.getByText('Item 1')).toBeInTheDocument();
    expect(screen.getByText('Value 1')).toBeInTheDocument();
  });

  it('renders standard MDX components with proper styling', () => {
    const H1Component = mdxComponents.h1!;
    const PComponent = mdxComponents.p!;
    const AComponent = mdxComponents.a!;

    render(
      <div>
        <H1Component>Test Heading</H1Component>
        <PComponent>Test paragraph</PComponent>
        <AComponent href="https://example.com">Test link</AComponent>
      </div>
    );

    const heading = screen.getByText('Test Heading');
    expect(heading.tagName).toBe('H1');
    expect(heading).toHaveClass('text-4xl');

    const paragraph = screen.getByText('Test paragraph');
    expect(paragraph.tagName).toBe('P');
    expect(paragraph).toHaveClass('leading-7');

    const link = screen.getByText('Test link');
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('generates proper heading IDs for TOC', () => {
    const H2Component = mdxComponents.h2!;
    const H3Component = mdxComponents.h3!;

    render(
      <div>
        <H2Component>Getting Started</H2Component>
        <H3Component>Installation Guide</H3Component>
      </div>
    );

    const h2 = screen.getByText('Getting Started');
    const h3 = screen.getByText('Installation Guide');

    expect(h2).toHaveAttribute('id', 'getting-started');
    expect(h3).toHaveAttribute('id', 'installation-guide');
  });

  it('handles table components with proper styling', () => {
    const TableComponent = mdxComponents.table!;
    const TheadComponent = mdxComponents.thead!;
    const TbodyComponent = mdxComponents.tbody!;
    const TrComponent = mdxComponents.tr!;
    const ThComponent = mdxComponents.th!;
    const TdComponent = mdxComponents.td!;

    render(
      <TableComponent>
        <TheadComponent>
          <TrComponent>
            <ThComponent>Header 1</ThComponent>
            <ThComponent>Header 2</ThComponent>
          </TrComponent>
        </TheadComponent>
        <TbodyComponent>
          <TrComponent>
            <TdComponent>Cell 1</TdComponent>
            <TdComponent>Cell 2</TdComponent>
          </TrComponent>
        </TbodyComponent>
      </TableComponent>
    );

    expect(screen.getByText('Header 1')).toBeInTheDocument();
    expect(screen.getByText('Header 2')).toBeInTheDocument();
    expect(screen.getByText('Cell 1')).toBeInTheDocument();
    expect(screen.getByText('Cell 2')).toBeInTheDocument();

    const table = screen.getByRole('table');
    expect(table).toHaveClass('border-collapse');
  });

  it('handles code blocks with proper syntax highlighting setup', () => {
    const PreComponent = mdxComponents.pre!;
    const CodeComponent = mdxComponents.code!;

    // Test inline code
    render(<CodeComponent>inline code</CodeComponent>);
    expect(screen.getByText('inline code')).toBeInTheDocument();

    // Test code block (this would normally be wrapped by pre)
    const { rerender } = render(
      <PreComponent>
        <CodeComponent className="language-javascript">
          console.log('hello');
        </CodeComponent>
      </PreComponent>
    );

    expect(screen.getByText('console')).toBeInTheDocument();
    expect(screen.getByText('log')).toBeInTheDocument();
    expect(screen.getByText("'hello'")).toBeInTheDocument();
  });

  it('handles blockquotes with proper styling', () => {
    const BlockquoteComponent = mdxComponents.blockquote!;

    render(
      <BlockquoteComponent>
        This is a quote
      </BlockquoteComponent>
    );

    const blockquote = screen.getByText('This is a quote');
    expect(blockquote.tagName).toBe('BLOCKQUOTE');
    expect(blockquote).toHaveClass('border-l-2');
  });

  it('handles lists with proper styling', () => {
    const UlComponent = mdxComponents.ul!;
    const OlComponent = mdxComponents.ol!;
    const LiComponent = mdxComponents.li!;

    render(
      <div>
        <UlComponent>
          <LiComponent>Unordered item</LiComponent>
        </UlComponent>
        <OlComponent>
          <LiComponent>Ordered item</LiComponent>
        </OlComponent>
      </div>
    );

    const ul = screen.getByText('Unordered item').closest('ul');
    const ol = screen.getByText('Ordered item').closest('ol');

    expect(ul).toHaveClass('list-disc');
    expect(ol).toHaveClass('list-decimal');
  });
});