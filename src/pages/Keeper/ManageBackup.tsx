import React, { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Image,
  ScrollView,
  RefreshControl,
  ImageBackground,
  Platform,
  AsyncStorage,
} from 'react-native';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Colors from '../../common/Colors';
import Fonts from '../../common/Fonts';
import { RFValue } from 'react-native-responsive-fontsize';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AntDesign from 'react-native-vector-icons/AntDesign';
import AddContactAddressBook from '../Contacts/AddContactAddressBook';
import BottomSheet from 'reanimated-bottom-sheet';
import DeviceInfo from 'react-native-device-info';
import SmallHeaderModal from '../../components/SmallHeaderModal';
import AddressBookHelpContents from '../../components/Helper/AddressBookHelpContents';
import { withNavigationFocus } from 'react-navigation';
import { connect } from 'react-redux';
import {
  approveTrustedContact,
  fetchEphemeralChannel,
  clearPaymentDetails,
} from '../../store/actions/trustedContacts';
import { setCloudBackupStatus } from '../../store/actions/preferences';
import idx from 'idx';
import KeeperTypeModalContents from './KeeperTypeModalContent';
import { timeFormatter } from '../../common/CommonFunctions/timeFormatter';
import moment from 'moment';
import SetupPrimaryKeeper from './SetupPrimaryKeeper';
import { REGULAR_ACCOUNT } from '../../common/constants/serviceTypes';
import RegularAccount from '../../bitcoin/services/accounts/RegularAccount';
import { CloudData } from '../../common/CommonFunctions';
import { GoogleDriveLogin } from '../../common/CommonFunctions/GoogleDriveBackup';

interface ManageBackupStateTypes {
  levelData: any;
  selectedId: any;
  isLevel2: boolean;
  securityAtLevel: any;
  health: any;
}

interface ManageBackupPropsTypes {
  navigation: any;
  setCloudBackupStatus: any;
  cloudBackupStatus: any;
  walletName: string;
  regularAccount: RegularAccount;
  database: any;
  overallHealth: any;
}

class ManageBackup extends Component<
  ManageBackupPropsTypes,
  ManageBackupStateTypes
> {
  focusListener: any;
  appStateListener: any;
  firebaseNotificationListener: any;
  notificationOpenedListener: any;
  NoInternetBottomSheet: any;
  unsubscribe: any;

  constructor(props) {
    super(props);
    this.focusListener = null;
    this.appStateListener = null;
    this.NoInternetBottomSheet = React.createRef();
    this.unsubscribe = null;
    this.state = {
      securityAtLevel: 0,
      selectedId: 0,
      health: [
        {
          level: 1,
          levelInfo: [
            {
              keeperType: null,
              type: 'cloud',
              lastUpdated: '1599807936',
              created: '1599807936',
              status: 'accessible',
              shareId: 'abcd',
            },
            {
              keeperType: null,
              type: 'securityQuestion',
              lastUpdated: '1599807936',
              created: '1599807936',
              status: 'accessible',
              shareId: 'xyz',
            },
          ],
          levelStatus: 'good',
        },
        {
          level: 2,
          levelInfo: [
            {
              keeperType: 'primaryKeeper',
              type: 'device',
              lastUpdated: null,
              created: null,
              status: 'notAccessible',
              shareId: 'pqr',
            },
            {
              keeperType: 'otherKeeper',
              type: 'contact',
              lastUpdated: null,
              created: null,
              status: 'notAccessible',
              shareId: 'qwe',
            },
          ],
          levelStatus: 'notSetup',
        },
        {
          level: 3,
          levelInfo: [
            {
              keeperType: 'otherKeeper',
              type: 'contact',
              lastUpdated: null,
              created: null,
              status: 'notAccessible',
              shareId: 'dsfsd',
            },
            {
              keeperType: 'otherKeeper',
              type: 'pdf',
              lastUpdated: null,
              created: null,
              status: 'notAccessible',
              shareId: 'dsfs',
            },
          ],
          levelStatus: 'notSetup',
        },
      ],
      levelData: [
        {
          type: 'icloud',
          status: 'good',
          level: 1,
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          keeper1: {
            name: '',
            keeper1Done: false,
            type: '',
          },
          keeper2: {
            name: '',
            keeper2Done: false,
            type: '',
          },
          id: 1,
        },
        {
          type: 'keeper',
          status: 'notSetup',
          level: 2,
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          keeper1: {
            name: 'iPad Pro',
            keeper1Done: true,
            type: 'device',
          },
          keeper2: {
            name: 'mac Pro',
            keeper2Done: true,
            type: 'friends',
          },
          id: 2,
        },
        {
          type: 'keeper',
          status: 'notSetup',
          level: 3,
          infoGray: 'Improve security by adding Keepers',
          infoRed: 'Keepers need your attention',
          infoGreen: 'All Keepers are accessible',
          manageText: 'Setup',
          keeper1: {
            name: '',
            keeper1Done: false,
            type: '',
          },
          keeper2: {
            name: '',
            keeper2Done: false,
            type: '',
          },
          id: 3,
        },
      ],
      isLevel2: false,
    };
  }

  setSelectedCards = () => {
    const { levelData } = this.state;
    for (let a = 0; a < levelData.length; a++) {
      if (levelData[a].status == 'notSetup'){
        this.setState({ selectedId: levelData[a].id });
        break;
      }
    }
    this.modifyLevelStatus();
    let level = 1;
    if (
      levelData.findIndex(
        (value) => value.status == 'bad' || value.status == 'notSetup',
      )
    )
      level =
        levelData[
          levelData.findIndex(
            (value) => value.status == 'bad' || value.status == 'notSetup',
          ) - 1
        ].id;
    this.setState({ securityAtLevel: level });
  };

  componentDidMount = () => {
    this.setSelectedCards();
  };

  modifyLevelStatus = () =>{
    let { levelData, health } = this.state;
    for (let i = 0; i < levelData.length; i++) {
      const element = levelData[i];
      if(health[i].levelInfo[1].status == 'accessible'){
        levelData[i].keeper2.keeper2Done = true;
      }
      if(health[i].levelInfo[0].status == 'accessible'){
        levelData[i].keeper2.keeper2Done = true;
      }
    }
    this.setState({levelData: levelData});
  }

  selectId = (value) => {
    if (value != this.state.selectedId) this.setState({ selectedId: value });
    else this.setState({ selectedId: 0 });
    if (value === 2) {
      this.setState({ isLevel2: true });
    } else {
      this.setState({ isLevel2: false });
    }
  };

  getTime = (item) => {
    return (item.toString() && item.toString() == '0') ||
      item.toString() == 'never'
      ? 'never'
      : timeFormatter(moment(new Date()), item);
  };

  GoogleDriveLogin = async () => {
    const { walletName, regularAccount } = this.props;
    let encryptedCloudDataJson;
    // var ICloudBackup = NativeModules.ICloudBackup;
    // ICloudBackup.initBackup();
    // console.log('CalendarManager', ICloudBackup)
    encryptedCloudDataJson = await CloudData(this.props.database);
    console.log('encryptedDatabase', encryptedCloudDataJson);
    if (Platform.OS == 'ios') {
      /**TODO iOS Login check and checkIfFileExist()*/
      console.log('call for icloud upload');
    } else {
      let data = {
        encryptedCloudDataJson: encryptedCloudDataJson,
        walletName: walletName,
        regularAccount: regularAccount,
      };
      GoogleDriveLogin(data, this.setCloudBackupStatus);
      console.log('call for google drive upload', this.props.cloudBackupStatus);
    }
  };

  setCloudBackupStatus = () => {
    this.props.setCloudBackupStatus({ status: true });
    console.log('setCloudBackupStatus', this.props.cloudBackupStatus);
  };

  componentDidUpdate = (prevProps, prevState) => {
    console.log('this.props.overallHealth', this.props.overallHealth);
    if (prevProps.overallHealth != this.props.overallHealth)
      this.setState({ health: this.props.overallHealth });
    else {
      (async () => {
        const storedHealth = await AsyncStorage.getItem('overallHealth');
        if (storedHealth) {
          this.setState({ health: JSON.parse(storedHealth) });
        }
      })();
    }
  };

  render() {
    const {
      levelData,
      selectedId,
      isLevel2,
      securityAtLevel,
      health,
    } = this.state;
    const { navigation, overallHealth } = this.props;
    // console.log('selectedId', selectedId)
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        <SafeAreaView style={{ flex: 0 }} />
        <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
        <View style={styles.modalHeaderTitleView}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.headerBackArrowView}
            >
              <FontAwesome
                name="long-arrow-left"
                color={Colors.blue}
                size={17}
              />
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerSettingImageView}
          >
            <Image
              source={require('../../assets/images/icons/setting.png')}
              style={styles.headerSettingImage}
            />
          </TouchableOpacity>
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.topHealthView}>
            <ImageBackground
              source={require('../../assets/images/icons/keeper_sheild.png')}
              style={{ ...styles.healthShieldImage, position: 'relative' }}
              resizeMode={'contain'}
            >
              <View
                style={{
                  backgroundColor: Colors.red,
                  height: wp('3%'),
                  width: wp('3%'),
                  borderRadius: wp('3%') / 2,
                  position: 'absolute',
                  top: wp('5%'),
                  right: 0,
                  borderWidth: 2,
                  borderColor: Colors.white,
                }}
              />
            </ImageBackground>
            <View style={styles.headerSeparator} />
            <View>
              <Text style={styles.backupText}>Backup</Text>
              <Text style={styles.backupInfoText}>Security is</Text>
              <Text style={styles.backupInfoText}>
                at level {securityAtLevel ? securityAtLevel : 1}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', position: 'relative' }}>
            {levelData.map((value) => {
              return (
                <View
                  style={{
                    borderRadius: 10,
                    marginTop: wp('7%'),
                    backgroundColor: value.status == 'good' || value.status == 'bad'
                      ? Colors.blue
                      : Colors.backgroundColor,
                    shadowRadius: selectedId && selectedId == value.id ? 10 : 0,
                    shadowColor: Colors.borderColor,
                    shadowOpacity:
                      selectedId && selectedId == value.id ? 10 : 0,
                    shadowOffset: { width: 5, height: 5 },
                    elevation:
                      selectedId == value.id || selectedId == 0 ? 10 : 0,
                    opacity:
                      selectedId == value.id || selectedId == 0 ? 1 : 0.3,
                  }}
                >
                  <View style={styles.cardView}>
                    <View style={{ flexDirection: 'row' }}>
                      {value.status == 'good' || value.status == 'bad' ? (
                        <View
                          style={{
                            ...styles.cardHealthImageView,
                            elevation: selectedId == value.id || selectedId == 0 ? 10 : 0,
                            backgroundColor: value.status == 'good' ? Colors.green : Colors.red,
                          }}
                        >
                          {value.status == 'good' ? (
                            <Image
                              source={require('../../assets/images/icons/check_white.png')}
                              style={{
                                ...styles.cardHealthImage,
                                width: wp('4%'),
                              }}
                            />
                          ) : (
                            <Image
                              source={require('../../assets/images/icons/icon_error_white.png')}
                              style={styles.cardHealthImage}
                            />
                          )}
                        </View>
                      ) : (
                        <Image
                          source={require('../../assets/images/icons/icon_setup.png')}
                          style={{
                            borderRadius: wp('7%') / 2,
                            width: wp('7%'),
                            height: wp('7%'),
                          }}
                        />
                      )}
                      <TouchableOpacity
                        style={{
                          ...styles.cardButtonView,
                          backgroundColor: value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
                        }}
                      >
                        <Text
                          style={{
                            ...styles.cardButtonText,
                            color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                          }}
                        >
                          Know More
                        </Text>
                      </TouchableOpacity>
                    </View>

                    <View style={{ flexDirection: 'row', marginTop: 'auto' }}>
                      <View style={{ justifyContent: 'center' }}>
                        <Text
                          style={{
                            ...styles.levelText,
                            color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                          }}
                        >
                          Level {value.level}
                        </Text>
                        <Text
                          style={{
                            ...styles.levelInfoText,
                            color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                          }}
                        >
                          {value.status == 'notSetup'
                            ? value.status == 'good'
                              ? value.infoGreen
                              : value.infoRed
                            : value.infoGray}
                        </Text>
                      </View>
                      <TouchableOpacity
                        activeOpacity={10}
                        onPress={() => this.selectId(value.id)}
                        style={styles.manageButton}
                      >
                        <Text
                          style={{
                            ...styles.manageButtonText,
                            padding: 10,
                            color: value.status == 'notSetup' ? Colors.black : Colors.white,
                          }}
                          onPress={() => this.selectId(value.id)}
                        >
                          {value.status == 'notSetup' ? 'Setup' : 'Manage'}
                        </Text>
                        <AntDesign
                          name={
                            selectedId && selectedId == value.id
                              ? 'arrowup'
                              : 'arrowright'
                          }
                          color={value.status == 'notSetup' ? Colors.black : Colors.white}
                          size={12}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                  {selectedId == value.id ? (
                    <View>
                      <View
                        style={{ backgroundColor: Colors.white, height: 0.5 }}
                      />
                      <View style={styles.cardView}>
                        <View style={{ width: wp('40%') }}>
                          <Text
                            numberOfLines={2}
                            style={{
                              color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                              fontFamily: Fonts.FiraSansRegular,
                              fontSize: RFValue(10),
                            }}
                          >
                            Lorem ipsum dolor sit amet, consetetur
                          </Text>
                        </View>
                        {value.id == 1 ? (
                          <View
                            style={{ flexDirection: 'row', marginTop: 'auto' }}
                          >
                            <TouchableOpacity
                              style={styles.appBackupButton}
                              onPress={() => {
                                if (!this.props.cloudBackupStatus) {
                                  this.GoogleDriveLogin();
                                }
                              }}
                            >
                              <Image
                                source={require('../../assets/images/icons/reset.png')}
                                style={styles.resetImage}
                              />
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  fontSize: RFValue(11),
                                }}
                              >
                                Add Backup
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                width: wp('41%'),
                                borderColor: value.keeper2.keeper2Done
                                ? value.status == 'notSetup' ? Colors.white : Colors.deepBlue
                                : Colors.red,
                                borderWidth: value.keeper2.keeper2Done
                                ? 0
                                : 0.5,
                                marginLeft: 'auto',
                              }}
                              onPress={() =>
                                navigation.navigate(
                                  'SecurityQuestionHistoryKeeper',
                                  {
                                    selectedTime: this.getTime(new Date()),
                                    selectedStatus: 'Ugly',
                                  },
                                )
                              }
                            >
                              <ImageBackground
                                source={require('../../assets/images/icons/questionMark.png')}
                                style={{
                                  ...styles.resetImage,
                                  position: 'relative',
                                }}
                              >
                                {!value.keeper2.keeper2Done
                                ? <View
                                  style={{
                                    backgroundColor: Colors.red,
                                    width: wp('1%'),
                                    height: wp('1%'),
                                    position: 'absolute',
                                    top: 0,
                                    right: 0,
                                    borderRadius: wp('1%') / 2,
                                  }}
                                /> : null}
                              </ImageBackground>
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  fontSize: RFValue(11),
                                }}
                              >
                                Security Question
                              </Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <View
                            style={{ flexDirection: 'row', marginTop: 'auto' }}
                          >
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                backgroundColor: value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: Colors.red,
                                borderWidth: value.keeper1.keeper1Done
                                  ? 0
                                  : 0.5,
                              }}
                              onPress={() => {
                                if (value.id === 2) {
                                  (this.refs
                                    .SetupPrimaryKeeperBottomSheet as any).snapTo(
                                    1,
                                  );
                                } else {
                                  (this.refs
                                    .keeperTypeBottomSheet as any).snapTo(1);
                                }
                              }}
                            >
                              {value.keeper1.keeper1Done &&
                              (value.keeper1.type == 'device' ||
                                value.keeper1.type == 'friends') ? (
                                <Image
                                  source={
                                    value.keeper1.type == 'device'
                                      ? require('../../assets/images/icons/icon_ipad_blue.png')
                                      : require('../../assets/images/icons/pexels-photo.png')
                                  }
                                  style={{
                                    width: wp('6%'),
                                    height: wp('6%'),
                                    resizeMode: 'contain',
                                    borderRadius: wp('6%') / 2,
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    backgroundColor: Colors.red,
                                    width: wp('2%'),
                                    height: wp('2%'),
                                    borderRadius: wp('2%') / 2,
                                  }}
                                />
                              )}
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                                  fontSize: RFValue(11),
                                  marginLeft: wp('3%'),
                                }}
                              >
                                {value.status == 'good' || value.status == 'bad'
                                  ? value.keeper1.name
                                  : value.id == 2
                                  ? 'Add Primary Keeper'
                                  : 'Add Keeper'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={{
                                ...styles.appBackupButton,
                                backgroundColor: value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
                                width: 'auto',
                                paddingLeft: wp('3%'),
                                paddingRight: wp('3%'),
                                borderColor: value.keeper2.keeper2Done ? Colors.red : value.status == 'notSetup' ? Colors.white : Colors.deepBlue,
                                borderWidth: value.keeper2.keeper2Done
                                  ? 0
                                  : 0.5,
                                marginLeft: wp('4%'),
                              }}
                              onPress={() => {
                                if (value.id === 2) {
                                  this.setState({ isLevel2: true });
                                } else {
                                  this.setState({ isLevel2: false });
                                }
                                setTimeout(() => {
                                  (this.refs
                                    .keeperTypeBottomSheet as any).snapTo(1);
                                }, 2);
                              }}
                            >
                              {value.keeper2.keeper2Done &&
                              (value.keeper2.type == 'device' ||
                                value.keeper2.type == 'friends') ? (
                                <Image
                                  source={
                                    value.keeper2.type == 'device'
                                      ? require('../../assets/images/icons/icon_ipad_blue.png')
                                      : require('../../assets/images/icons/pexels-photo.png')
                                  }
                                  style={{
                                    width: wp('6%'),
                                    height: wp('6%'),
                                    resizeMode: 'contain',
                                    borderRadius: wp('6%') / 2,
                                  }}
                                />
                              ) : (
                                <View
                                  style={{
                                    backgroundColor: Colors.red,
                                    width: wp('2%'),
                                    height: wp('2%'),
                                    borderRadius: wp('2%') / 2,
                                  }}
                                />
                              )}
                              <Text
                                style={{
                                  ...styles.cardButtonText,
                                  fontSize: RFValue(11),
                                  color: value.status == 'notSetup' ? Colors.textColorGrey : Colors.white,
                                  marginLeft: wp('3%'),
                                }}
                              >
                                {(value.status == 'bad' || value.status == 'good') && value.keeper2.keeper2Done
                                  ? value.keeper2.name
                                  : 'Add Keeper'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        )}
                      </View>
                    </View>
                  ) : null}
                </View>
              );
            })}
          </View>
        </ScrollView>
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'keeperTypeBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('75%')
              : hp('75%'),
          ]}
          renderContent={() => (
            <KeeperTypeModalContents
              onPressSetup={(type, name) => {
                if (type === 'contact') {
                  navigation.navigate('TrustedContactHistoryKeeper', {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2,
                  });
                }
                if (type === 'device') {
                  navigation.navigate('KeeperDeviceHistory', {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2,
                  });
                }
                if (type === 'pdf') {
                  navigation.navigate('PersonalCopyHistoryKeeper', {
                    selectedTime: this.getTime(new Date()),
                    selectedStatus: 'Ugly',
                    selectedTitle: name,
                    isLevel2: isLevel2,
                  });
                }
                (this.refs.keeperTypeBottomSheet as any).snapTo(0);
              }}
              onPressBack={() =>
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
              isLevel2={isLevel2}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                (this.refs.keeperTypeBottomSheet as any).snapTo(0)
              }
            />
          )}
        />
        <BottomSheet
          enabledInnerScrolling={true}
          ref={'SetupPrimaryKeeperBottomSheet'}
          snapPoints={[
            -50,
            Platform.OS == 'ios' && DeviceInfo.hasNotch()
              ? hp('60%')
              : hp('70'),
          ]}
          renderContent={() => (
            <SetupPrimaryKeeper
              title={'Setup Primary Keeper\non a Personal Device'}
              subText={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              textToCopy={'http://hexawallet.io/keeperapp'}
              info={
                'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doeiusmod tempor incididunt ut labore et dolore.'
              }
              proceedButtonText={'Proceed'}
              backButtonText={'Back'}
              onPressBack={() => {
                navigation.navigate('KeeperFeatures');
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
              }}
              onPressContinue={() => {
                navigation.navigate('KeeperFeatures');
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0);
              }}
            />
          )}
          renderHeader={() => (
            <SmallHeaderModal
              onPressHeader={() =>
                (this.refs.SetupPrimaryKeeperBottomSheet as any).snapTo(0)
              }
            />
          )}
        />
      </View>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    accounts: state.accounts || [],
    walletName:
      idx(state, (_) => _.storage.database.WALLET_SETUP.walletName) || '',
    s3Service: idx(state, (_) => _.sss.service),
    overallHealth: idx(state, (_) => _.sss.overallHealth),
    trustedContacts: idx(state, (_) => _.trustedContacts.service),
    cloudBackupStatus:
      idx(state, (_) => _.preferences.cloudBackupStatus) || false,
    regularAccount: idx(state, (_) => _.accounts[REGULAR_ACCOUNT].service),
    database: idx(state, (_) => _.storage.database) || {},
  };
};

export default withNavigationFocus(
  connect(mapStateToProps, {
    fetchEphemeralChannel,
    setCloudBackupStatus,
  })(ManageBackup),
);

const styles = StyleSheet.create({
  modalHeaderTitleView: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 5,
    paddingBottom: 5,
    paddingTop: 10,
    marginLeft: 20,
    marginRight: 20,
  },
  headerBackArrowView: {
    height: 30,
    width: 30,
    justifyContent: 'center',
  },
  headerSettingImageView: {
    height: wp('10%'),
    width: wp('10&'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSettingImage: {
    height: wp('6%'),
    width: wp('6%'),
  },
  topHealthView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  healthShieldImage: {
    width: wp('17%'),
    height: wp('25%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerSeparator: {
    backgroundColor: Colors.seaBlue,
    width: 4,
    borderRadius: 5,
    height: wp('17%'),
    marginLeft: wp('5%'),
    marginRight: wp('5%'),
  },
  backupText: {
    color: Colors.black,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(15),
  },
  backupInfoText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(18),
  },
  cardView: {
    height: wp('35%'),
    width: wp('85%'),
    padding: 20,
  },
  cardHealthImageView: {
    backgroundColor: Colors.red,
    shadowColor: Colors.deepBlue,
    shadowOpacity: 1,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 10,
    borderRadius: wp('7%') / 2,
    width: wp('7%'),
    height: wp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardHealthImage: {
    width: wp('2%'),
    height: wp('4%'),
    resizeMode: 'contain',
  },
  cardButtonView: {
    width: wp('21%'),
    height: wp('8'),
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 'auto',
    borderRadius: 8,
  },
  cardButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelText: {
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  levelInfoText: {
    fontSize: RFValue(11),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
  },
  manageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 'auto',
    marginTop: 'auto',
  },
  manageButtonText: {
    fontSize: RFValue(10),
    fontFamily: Fonts.FiraSansRegular,
    color: Colors.white,
    marginRight: 3,
  },
  appBackupButton: {
    flexDirection: 'row',
    backgroundColor: Colors.deepBlue,
    justifyContent: 'space-evenly',
    alignItems: 'center',
    borderRadius: 8,
    width: wp('31%'),
    height: wp('11%'),
  },
  resetImage: {
    width: wp('4%'),
    height: wp('4%'),
    resizeMode: 'contain',
  },
});
