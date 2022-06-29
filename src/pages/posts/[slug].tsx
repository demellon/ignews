import Head from "next/head"
import { Session } from "next-auth";
import { RichText } from "prismic-dom"
import styles from './post.module.scss';
import { GetServerSideProps } from "next"
import { getSession } from "next-auth/react"
import { getPrismicClient } from "../../services/prismic"

interface PostProps {
    post: {
        slug: string;
        title: string;
        content: string;
        updateAt: string;
    }
}

export default function Post({ post }: PostProps) {
    return (
        <>
            <Head>
                <title>{post.title} | Ignews</title>
            </Head>
            <main className={styles.container}>
                <article className={styles.post}>
                    <h1>{post.title}</h1>
                    <time>{post.updateAt}</time>
                    <div
                        className={styles.postContent}
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </article>
            </main>
        </>
    )
}

interface UserSubscriptionSession extends Session {
    activeSubscription?: any;
}

export const getServerSideProps: GetServerSideProps = async ({ req, params }) => {
    const session: UserSubscriptionSession = await getSession({ req })
    const { slug } = params;

    if (!session?.activeSubscription) {
        return {
            redirect: {
                destination: '/',
                permanent: false
            }
        }
    }

    const prismic = getPrismicClient(req)
    const response = await prismic.getByUID('post', String(slug), {})

    const post = {
        slug,
        title: RichText.asText(response.data.title),
        content: RichText.asHtml(response.data.content),
        updateAt: new Date(response.last_publication_date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        })
    };

    return {
        props: {
            post,
        }
    }
}