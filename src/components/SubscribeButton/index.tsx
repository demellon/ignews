import { Session } from "next-auth"
import { useRouter } from "next/router";
import { api } from '../../services/api';
import styles from './styles.module.scss';
import { useSession, signIn } from 'next-auth/react'
import { getStripeJS } from '../../services/stripe-js';

interface SubscribeButtonProps {
  priceId: string;
}

interface UserSubscriptionSession extends Session {
  activeSubscription?: any;
}

type SessionProps = [UserSubscriptionSession, boolean]

export function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const { data: session } = useSession()
  const router = useRouter()

  async function handleSubscribe() {
    if (!session) {
      signIn('github');
      return;
    }
    if (session?.activeSubscription) {
      router.push("/posts")
      return
    }
    try {
      const response = await api.post('/subscribe')
      const { sessionId } = response.data;
      const stripe = await getStripeJS()
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={handleSubscribe}
    >
      Subscribe Now
    </button>
  )
}