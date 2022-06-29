import Head from 'next/head';
import Link from 'next/link';
import { Session } from "next-auth"
import { GetStaticProps } from 'next';
import { RichText } from 'prismic-dom';
import Prismic from '@prismicio/client';
import styles from './styles.module.scss';
import { useSession } from 'next-auth/react';
import { getPrismicClient } from '../../services/prismic';

type Post = {
    slug: string;
    title: string;
    excerpt: string;
    updateAt: string;
};

interface PostsProps {
    posts: Post[];
}

interface UserSubscriptionSession extends Session {
    activeSubscription?: any;
}

type SessionProps = [UserSubscriptionSession, boolean]

export default function Posts({ posts }: PostsProps) {
    const { data: session } = useSession()
    return (
        <>
            <Head>
                <title>Posts | Ignews</title>
            </Head>

            <main className={styles.container}>
                <div className={styles.posts}>
                    {posts.map(post => (
                        <Link
                            key={post.slug}
                            href={
                                session?.activeSubscription
                                    ? `/posts/${post.slug}`
                                    : `/posts/preview/${post.slug}`
                            }
                        >
                            <a>
                                <time>{post.updateAt}</time>
                                <strong>{post.title}</strong>
                                <p> {post.excerpt}</p>
                            </a>
                        </Link>
                    ))}
                </div>
            </main>

        </>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const prismic = getPrismicClient()

    const response = await prismic.query([
        Prismic.predicates.at('document.type', 'post')
    ], {
        fetch: ['post.title', 'post.content'],
        pageSize: 100,
    })

    const posts = response.results.map(post => {
        return {
            slug: post.uid,
            title: RichText.asText(post.data.title),
            excerpt: post.data.content.find(content => content.type === 'paragraph')?.text ?? '',
            updateAt: new Date(post.last_publication_date).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric'
            })
        }
    })

    return {
        props: {
            posts
        },
        revalidate: 60 * 60 // 1 Hour;
    }

}