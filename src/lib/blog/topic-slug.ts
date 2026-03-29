import { BLOG_TOPICS, type BlogTopic } from './types'

export function slugifyTopic(topic: string) {
	return topic.trim().toLowerCase()
}

export function getTopicBySlug(topicSlug: string): BlogTopic | undefined {
	return BLOG_TOPICS.find(topic => slugifyTopic(topic) === slugifyTopic(topicSlug))
}
