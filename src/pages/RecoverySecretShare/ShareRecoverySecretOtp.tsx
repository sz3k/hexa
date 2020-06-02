import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Platform,
  Image,
  TextInput,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import Fonts from '../../common/Fonts';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import BottomInfoBox from '../../components/BottomInfoBox';
import { useDispatch, useSelector } from 'react-redux';
import {
  SECURE_ACCOUNT,
  TEST_ACCOUNT,
  REGULAR_ACCOUNT,
} from '../../common/constants/serviceTypes';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Colors from '../../common/Colors';
import { RFValue } from 'react-native-responsive-fontsize';

const ShareRecoverySecretOtp = props => {
  const [passcode, setPasscode] = useState([]);
  const correctPasscode = 'AAAAAA';

  function onPressNumber(text, i) {
    let tempPasscode = passcode;
    tempPasscode[i] = text;
    setPasscode(tempPasscode);

    if (passcode.join('').length == 6 && passcode.join('') == correctPasscode) {
        props.navigation.navigate("ShareSuccessPage");
    }
  }
 
  useEffect(() => {}, []);

  const getQrCodeData = data => {
    console.log('Qrcodedata', data);
  };

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 0 }} />
      <StatusBar backgroundColor={Colors.white} barStyle="dark-content" />
      <View style={styles.modalHeaderTitleView}>
        <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity
            onPress={() => {
              props.navigation.goBack();
            }}
            style={{ height: 30, width: 30, justifyContent: 'center' }}
          >
            <FontAwesome name="long-arrow-left" color={Colors.blue} size={17} />
          </TouchableOpacity>
          <Text style={styles.modalHeaderTitleText}>{''}</Text>
        </View>
      </View>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS == 'ios' ? 'padding' : ''}
        enabled
      >
        <ScrollView style={{ flex: 1 }}>
          <View style={{ ...styles.modalContentContainer, height: '100%' }}>
            <View style={{ height: '100%' }}>
              <View style={{ marginTop: hp('3.5%'), marginBottom: hp('2%') }}>
                <Text style={styles.commModeModalHeaderText}>
                  {'Share Recovery Key\nto trusted contact'}
                </Text>
                <Text style={styles.commModeModalInfoText}>
                  {
                    'Share Recovery Key to Trusted Contact, this will enable\nthem to restore their Hexa Wallet'
                  }
                </Text>
              </View>
              <View style={styles.contactProfileView}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flex: 1,
                      backgroundColor: Colors.backgroundColor,
                      height: 80,
                      marginLeft: 60,
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: 10,
                    }}
                  >
                    <View style={{ marginLeft: 10 }}>
                      <Text style={styles.contactNameText}>
                        {'Pamela Aalto'}
                      </Text>
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontFamily: Fonts.FiraSansRegular,
                          fontSize: RFValue(13),
                          marginLeft: 25,
                        }}
                      >
                        {'+44 0000 000000'}
                      </Text>
                    </View>
                    <View style={{ marginRight: 10 }}>
                      <Image
                        source={require('../../assets/images/icons/phone-book.png')}
                        style={styles.contactIconImage}
                      />
                    </View>
                  </View>
                  <View
                    style={{
                      backgroundColor: Colors.white,
                      width: 80,
                      height: 80,
                      borderRadius: 80 / 2,
                      position: 'absolute',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Image
                      source={require('../../assets/images/icons/pexels-photo.png')}
                      style={styles.contactProfileImage}
                    />
                  </View>
                </View>
              </View>
              <Text
                style={{
                  ...styles.commModeModalInfoText,
                  marginBottom: hp('3.5%'),
                }}
              >
                {
                  'Lorem ipsum dolor sit amet, consectetur adipiscing elit,\nsed do eiusmod tempor incididunt'
                }
              </Text>
              <View
                style={{
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginBottom: hp('5%'),
                  paddingLeft: 20,
                  paddingRight: 20,
                  paddingBottom: 20,
                }}
              >
                {props.navigation.state.params.shareByType == 'qr' ? (
                  <TouchableOpacity
                    onPress={() => {
                      props.navigation.navigate('QrScanner', {
                        scanedCode: getQrCodeData,
                      });
                    }}
                    style={{
                      backgroundColor: Colors.blue,
                      height: wp('13%'),
                      borderRadius: 10,
                      width: wp('50%'),
                      justifyContent: 'center',
                      alignItems: 'center',
                      elevation: 10,
                      shadowColor: Colors.shadowBlue,
                      shadowOpacity: 1,
                      shadowOffset: { width: 15, height: 15 },
                    }}
                  >
                    <Text style={styles.buttonText}>{'Share via QR'}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={{}}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Text
                        style={{
                          color: Colors.textColorGrey,
                          fontSize: RFValue(11),
                          fontFamily: Fonts.FiraSansRegular,
                        }}
                      >
                        Enter OTP
                      </Text>
                      {passcode.join('').length == 6 && passcode.join('') != correctPasscode ? (
                        <Text
                          style={{
                            color: Colors.red,
                            fontSize: RFValue(10),
                            fontFamily: Fonts.FiraSansMediumItalic,
                          }}
                        >
                          Incorrect OTP, Try Again
                        </Text>
                      ) : null}
                    </View>
                    <View style={styles.passcodeTextInputView}>
                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoFocus={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput = input;
                        }}
                        style={[
                          this.textInput && this.textInput.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 0);
                          if (value.length >= 1) {
                            this.textInput2.focus();
                          }
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput.focus();
                            onPressNumber('', 0);
                          }
                        }}
                      />

                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput2 = input;
                        }}
                        style={[
                          this.textInput2 && this.textInput2.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 1);
                          if (value.length >= 1) this.textInput3.focus();
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput.focus();
                            onPressNumber('', 1);
                          }
                        }}
                      />

                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput3 = input;
                        }}
                        style={[
                          this.textInput3 && this.textInput3.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 2);
                          if (value.length >= 1) this.textInput4.focus();
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput2.focus();
                            onPressNumber('', 2);
                          }
                        }}
                      />

                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput4 = input;
                        }}
                        style={[
                          this.textInput4 && this.textInput4.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 3);
                          if (value.length >= 1) this.textInput5.focus();
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput3.focus();
                            onPressNumber('', 3);
                          }
                        }}
                      />

                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput5 = input;
                        }}
                        style={[
                          this.textInput5 && this.textInput5.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 4);
                          if (value.length >= 1) this.textInput6.focus();
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput4.focus();
                            onPressNumber('', 4);
                          }
                        }}
                      />
                      <TextInput
                        maxLength={1}
                        keyboardType={Platform.OS == 'ios' ? 'ascii-capable' : 'visible-password'}
                        selectTextOnFocus={true}
                        contextMenuHidden={true}
                        autoCorrect={false}
                        ref={input => {
                          this.textInput6 = input;
                        }}
                        style={[
                          this.textInput6 && this.textInput6.isFocused()
                            ? styles.textBoxActive
                            : styles.textBoxStyles,
                        ]}
                        onChangeText={value => {
                          onPressNumber(value, 5);
                          if (value.length >= 1) this.textInput6.focus();
                        }}
                        onKeyPress={e => {
                          if (e.nativeEvent.key === 'Backspace') {
                            this.textInput5.focus();
                            onPressNumber('', 5);
                          }
                        }}
                      />
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

export default ShareRecoverySecretOtp;

const styles = StyleSheet.create({
  modalHeaderTitleText: {
    color: Colors.blue,
    fontSize: RFValue(18),
    fontFamily: Fonts.FiraSansRegular,
  },
  modalHeaderTitleView: {
    borderBottomWidth: 1,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    flexDirection: 'row',
    paddingRight: 10,
    paddingBottom: hp('1.5%'),
    paddingTop: hp('1%'),
    marginLeft: 10,
    marginRight: 10,
    marginBottom: hp('1.5%'),
  },
  modalContentContainer: {
    height: '100%',
    backgroundColor: Colors.white,
  },
  commModeModalHeaderText: {
    color: Colors.blue,
    fontFamily: Fonts.FiraSansMedium,
    fontSize: RFValue(18),
    marginLeft: 25,
    marginRight: 25,
  },
  commModeModalInfoText: {
    color: Colors.textColorGrey,
    fontFamily: Fonts.FiraSansRegular,
    fontSize: RFValue(11),
    marginLeft: 25,
    marginRight: 25,
    // marginTop: hp('0.7%')
  },
  contactProfileView: {
    flexDirection: 'row',
    marginLeft: 25,
    marginRight: 25,
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: hp('3.5%'),
    marginTop: hp('1.7%'),
  },
  contactProfileImage: {
    width: 70,
    height: 70,
    resizeMode: 'cover',
    borderRadius: 70 / 2,
  },
  contactNameText: {
    color: Colors.black,
    fontSize: RFValue(25),
    fontFamily: Fonts.FiraSansRegular,
    marginLeft: 25,
  },
  contactIconImage: {
    width: 20,
    height: 20,
    resizeMode: 'cover',
  },
  buttonInnerView: {
    flexDirection: 'row',
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    width: wp('30%'),
  },
  buttonImage: {
    width: 20,
    height: 20,
    resizeMode: 'contain',
  },
  buttonText: {
    color: Colors.white,
    fontSize: RFValue(13),
    fontFamily: Fonts.FiraSansMedium,
  },
  passcodeTextInputView: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: hp('2.5%'),
    marginBottom: hp('2.5%'),
  },
  textBoxStyles: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
  textBoxActive: {
    borderWidth: 0.5,
    height: wp('12%'),
    width: wp('12%'),
    borderRadius: 7,
    elevation: 10,
    shadowColor: Colors.borderColor,
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 3 },
    borderColor: Colors.borderColor,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.white,
    marginLeft: 8,
    color: Colors.black,
    fontSize: RFValue(13),
    textAlign: 'center',
    lineHeight: 18,
  },
});
