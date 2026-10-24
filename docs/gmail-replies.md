# Gmail replies

The admin can answer a contact submission from `/admin/messages`. The reply is sent through the Gmail API from the admin's own Gmail account, so it lands in that account's Sent folder, and it is stored in the `contact_replies` table.

No new environment variables are needed. The feature uses `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `BETTER_AUTH_URL` and `BETTER_AUTH_SECRET`. Without the Google credentials the composer shows a message instead of a form and the public contact form is unaffected.

## Google Cloud setup

1. Create or pick a project in the [Google Cloud console](https://console.cloud.google.com/).
2. Under APIs & Services, Library, enable the **Gmail API**.
3. Under Google Auth Platform, configure the consent screen. Add `https://www.googleapis.com/auth/gmail.send` under Data Access. This is the only Gmail permission requested; it cannot read the mailbox.
4. Create an OAuth client of type Web application. Add these authorized redirect URIs:
    - `http://localhost:3000/api/auth/callback/google` for development
    - `https://remcostoeten.nl/api/auth/callback/google` for production
5. Put the client ID and secret in `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.

### Testing mode versus production

An app in Testing status needs your Gmail address listed as a test user, and Google expires its refresh tokens after 7 days. After that the Settings page shows "Needs reauthorization" and you connect again. Switch the publishing status to In production to stop the expiry.

`gmail.send` is a sensitive scope. An unverified production app shows Google's "unverified app" warning when you connect (Advanced, then continue) and is capped at 100 users, which is enough for a personal site. Full verification is only needed to remove the warning.

## Connecting

1. Sign in to `/admin` with any admin login (GitHub or Google).
2. Open Settings and choose **Connect Gmail**, or use the same button in the reply composer.
3. Pick the Gmail account to send from and keep the "Send email on your behalf" permission checked.

The Google account may have a different address than the one you signed in with. The sender is always the address of the linked Google account, read from its verified ID token. The client never supplies a sender or recipient: the recipient is the address stored on the submission.

Tokens are stored by Better Auth in the `account` table, encrypted with `BETTER_AUTH_SECRET`, and refreshed on the server. Changing `BETTER_AUTH_SECRET` makes stored tokens unreadable and requires connecting again.

## Sender name, signature and templates

The From header uses your Google account name, for example `Remco Stoeten <you@gmail.com>`. In Settings you can save one signature, which is prefilled below the cursor in every new reply, and up to 20 templates, which appear as buttons in the reply form. `{name}` in a template becomes the visitor's first name. They live in the `reply_snippets` table.

Each sent reply has an Open in Gmail link to its conversation.

## Disconnecting

Settings has a Disconnect button. It revokes the permission at Google on a best-effort basis, clears the stored tokens and drops the send scope. The Google account row stays, so signing in with Google still works.

## Bulk actions

Tick messages in the list to mark them read or unread, archive or unarchive them, or delete them, up to 100 at a time. Delete asks for a second click.

## Delivery states

| Status      | Meaning                                                                                                |
| ----------- | ------------------------------------------------------------------------------------------------------ |
| `pending`   | A send is in flight. After 2 minutes it is shown as unconfirmed.                                       |
| `sent`      | Gmail accepted the message and returned its IDs.                                                       |
| `failed`    | Gmail rejected the request, or the credentials were refused. Nothing was sent.                         |
| `uncertain` | A timeout, a Gmail 5xx, or a database failure after Gmail accepted the message. It may have been sent. |

An unconfirmed reply is never retried automatically. Check the Gmail Sent folder, then choose "It was sent" or "It was not sent" on the reply. A new reply gets a new idempotency key, so repeating the same request (double click, replayed action) returns the first attempt instead of sending again.

Replies are limited to 20 per hour overall and 5 per hour per message. `DEV_OPEN_ADMIN=true` never authorizes a send; it needs a real admin session.

## Threading

The first reply starts a new Gmail conversation with the subject `Re: <visitor subject>` (or `Re: Your message to Remco`). Later replies to the same submission reuse that subject and the stored Gmail thread ID, and set `In-Reply-To` and `References` from the stored `Message-ID` values.

Visitor responses are not read back into the database. The `contact_replies` table keeps `gmail_message_id`, `gmail_thread_id` and `rfc_message_id`, so inbound sync could be added later with a read scope.

## Migration

`0017_contact_inbox_and_replies.sql` only adds columns and a table, and `0018_reply_snippets.sql` adds the signature and template table. It does not touch existing submissions, and every existing message starts as unread. Apply it before deploying:

```bash
bun run db:push
```

## Manual end-to-end test

Use a Gmail account you can sign in to and a second inbox that is not that account.

1. Apply the migration and set the Google credentials.
2. Submit the public contact form with the second inbox's address.
3. Sign in to `/admin`, open Settings and connect Gmail. The card should show Connected with your Gmail address.
4. Open `/admin/messages`, select the submission and choose Reply. The To field is the second inbox, and the Subject is `Re: <subject>`.
5. Send a reply. Confirm the success toast, the reply in the conversation, and the "Replied" mark in the list.
6. In the second inbox, confirm the email arrived from your Gmail address with your text.
7. In your Gmail Sent folder, confirm the same message is there.
8. Reply to the second inbox's message from the admin again. In Gmail, confirm both messages sit in one conversation.
9. Revoke access at [myaccount.google.com/permissions](https://myaccount.google.com/permissions), reload Settings, and confirm it shows Needs reauthorization and the composer offers Reauthorize Gmail.
