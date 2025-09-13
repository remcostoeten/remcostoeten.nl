import React, { memo, useMemo } from 'react';
import Link from 'next/link';

const featuredPosts = [
  {
    id: '1',
    title: 'Demystifying Continuous Integration',
    description: 'How CI improves development workflows',
    href: '/posts/building-scalable-systems',
    isClickable: false
  },
  {
    id: '2',
    title: 'The Philosophy of AI Ethics',
    description: 'Can machines make moral decisions?',
    href: '/posts/the-philosophy-of-ai-ethics',
    isClickable: true
  },
  {
    id: '3',
    title: 'The Role of Empathy in Design',
    description: 'Why empathy is the key to great design.',
    href: '/posts/modern-design-principles',
    isClickable: false
  }
];

const FeaturedPosts = memo(function FeaturedPosts() {
  // Memoize the featured posts to prevent unnecessary re-renders
  const memoizedFeaturedPosts = useMemo(() => featuredPosts, []);
  return (
    <section className="py-12">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-white">Featured posts</h2>
      </div>
      
      <div className="flex flex-col gap-[3px] w-full">
        {memoizedFeaturedPosts.map((post, index) => {
          const Component = post.isClickable ? Link : 'div';
          const isFirst = index === 0;
          const isLast = index === memoizedFeaturedPosts.length - 1;
          
          let borderRadius = '0px';
          if (isFirst) {
            borderRadius = '16px 16px 0px 0px';
          } else if (isLast) {
            borderRadius = '0px 0px 16px 16px';
          }
          
          return (
            <Component
              key={post.id}
              href={post.isClickable ? post.href : ""}
              className={`
                flex items-center justify-between px-4 py-[14px] group transition-all duration-200 w-full
                ${post.isClickable ? 'hover:bg-stone-600/20 cursor-pointer' : 'cursor-default'}
              `}
              style={{
                backgroundColor: 'rgb(31, 31, 31)',
                borderRadius: borderRadius
              }}
            >
              <div className="flex-1 min-w-0">
                <div className="mb-0">
                  <p className={`
                    text-white transition-colors duration-200 text-base leading-relaxed m-0 font-normal
                    ${post.isClickable ? 'group-hover:text-orange-400' : ''}
                    ${isFirst ? 'font-medium' : ''}
                  `}>
                    {post.title}
                  </p>
                </div>
                <div>
                  <p className="text-[#aba9a7] text-base leading-relaxed m-0 font-normal group-hover:text-stone-300 transition-colors duration-200">
                    {post.description}
                  </p>
                </div>
              </div>
              
              <div className="ml-6 flex-shrink-0">
                <div className="w-[22px] h-[22px]">
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 256 256" 
                    className={`
                      w-full h-full transition-all duration-200
                      ${post.isClickable 
                        ? 'text-white group-hover:text-orange-400' 
                        : 'text-white'
                      }
                    `}
                    fill="currentColor"
                  >
                    <path d="M128,24A104,104,0,1,0,232,128,104.11,104.11,0,0,0,128,24Zm0,192a88,88,0,1,1,88-88A88.1,88.1,0,0,1,128,216Zm45.66-93.66a8,8,0,0,1,0,11.32l-32,32a8,8,0,0,1-11.32-11.32L148.69,136H88a8,8,0,0,1,0-16h60.69l-18.35-18.34a8,8,0,0,1,11.32-11.32Z"/>
                  </svg>
                </div>
              </div>
            </Component>
          );
        })}
      </div>
    </section>
  );
});

export { FeaturedPosts };