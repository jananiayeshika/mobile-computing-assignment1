/** /explore/[id] – destination detail inside the Explore tab's stack. */
import { useLocalSearchParams } from 'expo-router';

import DestinationDetail from '../../../components/DestinationDetail';

export default function ExploreDetailScreen() {
  const { id } = useLocalSearchParams();
  return <DestinationDetail id={id} />;
}
