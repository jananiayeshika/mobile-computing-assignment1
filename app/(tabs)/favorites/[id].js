/** /favorites/[id] – destination detail inside the Favourites tab's stack. */
import { useLocalSearchParams } from 'expo-router';

import DestinationDetail from '../../../components/DestinationDetail';

export default function FavoriteDetailScreen() {
  const { id } = useLocalSearchParams();
  return <DestinationDetail id={id} />;
}
