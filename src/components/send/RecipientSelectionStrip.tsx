import React, { useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import Colors from '../../common/Colors';
import CardStyles from '../../common/Styles/Cards';
import useAccountsState from '../../utils/hooks/state-selectors/accounts/UseAccountsState';
import { TouchableOpacity } from '@gorhom/bottom-sheet';
import SendableContactCarouselItem from './SendableContactCarouselItem';
import RecipientKind from '../../common/data/enums/RecipientKind';
import { ContactRecipientDescribing, RecipientDescribing, AccountRecipientDescribing } from '../../common/data/models/interfaces/RecipientDescribing';
import SubAccountOptionCard from '../accounts/SubAccountOptionCard';
import useActiveAccountShells from '../../utils/hooks/state-selectors/accounts/UseActiveAccountShells';
import { widthPercentageToDP } from 'react-native-responsive-screen';

export type Props = {
  accountKind: string;
  recipients: RecipientDescribing[];
  selectedRecipients: RecipientDescribing[];
  onRecipientSelected: Function;
};

const RecipientSelectionStrip: React.FC<Props> = ({
  accountKind,
  recipients,
  selectedRecipients,
  onRecipientSelected,
}: Props) => {
  const accountShells = useActiveAccountShells();

  const selectedRecipientIDs = useMemo(() => {
    return selectedRecipients.map(recipient => recipient.id);
  }, [selectedRecipients]);

  const isSelected = useCallback((recipient: RecipientDescribing) => {
    return selectedRecipientIDs.includes(recipient.id);
  }, [selectedRecipientIDs]);

  const getSubAccountForRecipient = useCallback((recipient: AccountRecipientDescribing) => {
    return accountShells
      .find(shell => shell.id === recipient.id)
      .primarySubAccount;
  }, [accountShells]);


  return (
    <View style={styles.rootContainer}>
      <FlatList
        horizontal
        data={recipients}
        keyExtractor={(item) => item.id}
        showsHorizontalScrollIndicator={false}
        contentOffset={{ x: -14, y: 0 }}
        renderItem={({ item: recipient }: { item: RecipientDescribing }) => (
          <TouchableOpacity
            style={styles.listItemTouchableWrapper}
            onPress={() => onRecipientSelected(recipient)}
          >
            {recipient.kind == RecipientKind.CONTACT && (
              <SendableContactCarouselItem
                containerStyle={styles.listItemContainer}
                contact={(recipient as ContactRecipientDescribing)}
                isSelected={isSelected(recipient)}
              />
            ) || (recipient.kind == RecipientKind.ACCOUNT_SHELL && (
              <SubAccountOptionCard
                subAccount={getSubAccountForRecipient((recipient as AccountRecipientDescribing))}
                isSelected={isSelected(recipient)}
                containerStyle={styles.listItemContainer}
              />
            ))}
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  rootContainer: {
    borderRadius: 10,
    backgroundColor: Colors.backgroundColor,
  },

  // cardRootContainer: {
  //   ...CardStyles.horizontalScrollViewCardContainer,
  //   flex: 1,
  //   width: widthPercentageToDP(34),
  //   minWidth: 120,
  //   marginLeft: 6,
  // },

  listItemTouchableWrapper: {
    flex: 1,
    width: widthPercentageToDP(34),
    minWidth: 140,
    marginLeft: 6,
    borderRadius: CardStyles.horizontalScrollViewCardContainer.borderRadius,
    backgroundColor: 'transparent',
    overflow: 'hidden',
    paddingVertical: 16,
  },

  listItemContainer: {
    marginHorizontal: 14,
  },
});

export default RecipientSelectionStrip;
