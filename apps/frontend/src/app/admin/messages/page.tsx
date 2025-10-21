import { ContactMessagesView } from '@/views/contact-messages-view';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Messages | Remco Stoeten',
  description: 'View and manage contact form submissions',
  robots: {
    index: false,
    follow: false,
  },
};

export default function ContactMessagesPage() {
  return <ContactMessagesView />;
}
