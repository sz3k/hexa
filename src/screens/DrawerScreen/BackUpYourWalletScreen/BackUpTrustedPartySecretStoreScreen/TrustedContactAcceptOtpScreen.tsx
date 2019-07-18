import React, { Component } from "react";
import {
    StyleSheet,
    View,
    AsyncStorage,
    Platform,
    Dimensions,
    Image,
    Keyboard,
    StatusBar,
    Linking,
    ImageBackground,
    Alert
} from "react-native";
import {
    Container,
    Header,
    Title,
    Content,
    Item,
    Input,
    Button,
    Left,
    Right,
    Body,
    Text
} from "native-base";
import { StackActions, NavigationActions } from "react-navigation";
import CodeInput from "react-native-confirmation-code-input";
import * as Keychain from "react-native-keychain";
import { SvgIcon } from "@up-shared/components";

import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";

//TODO: Custome Pages
import Loader from "HexaWallet/src/app/custcompontes/Loader/ModelLoader";
import CustomeStatusBar from "HexaWallet/src/app/custcompontes/CustomeStatusBar/CustomeStatusBar";
import FullLinearGradientButton from "HexaWallet/src/app/custcompontes/LinearGradient/Buttons/FullLinearGradientButton";

//TODO: Custome Object   
import {
    colors,
    images,
    localDB
} from "HexaWallet/src/app/constants/Constants";
import utils from "HexaWallet/src/app/constants/Utils";
import Singleton from "HexaWallet/src/app/constants/Singleton";
var dbOpration = require( "HexaWallet/src/app/manager/database/DBOpration" );
import renderIf from "HexaWallet/src/app/constants/validation/renderIf";




//TODO: Custome Alert 
import AlertSimple from "HexaWallet/src/app/custcompontes/Alert/AlertSimple";
let alert = new AlertSimple();

//localization
import { localization } from "HexaWallet/src/app/manager/Localization/i18n";

//TODO: Bitcoin Class
var bitcoinClassState = require( "HexaWallet/src/app/manager/ClassState/BitcoinClassState" );
import S3Service from "HexaWallet/src/bitcoin/services/sss/S3Service";



//TODO: Common Funciton
var comFunDBRead = require( "HexaWallet/src/app/manager/CommonFunction/CommonDBReadData" );

export default class TrustedContactAcceptOtpScreen extends Component {
    constructor ( props: any ) {
        super( props );
        this.state = {
            status: false,
            otp: "000000",
            success: "Passcode does not match!",
            passcodeStyle: [
                {
                    activeColor: colors.black,
                    inactiveColor: colors.black,
                    cellBorderWidth: 0
                }
            ],
            statusConfirmBtnDisable: true,
            flag_Loading: false,
            keeperInfo: [],
            arr_ResDownShare: []
        };
    }


    async componentDidMount() {
        let keeperInfo = this.props.navigation.getParam( "data" );
        this.setState( {
            keeperInfo
        } )
    }


    _onFinishCheckingCode = async ( code: string ) => {
        console.log( { code } );
        if ( code.length == 6 ) {
            this.setState( {
                otp: code,
                statusConfirmBtnDisable: false
            } )
        }
    }

    goBack = () => {
        utils.setDeepLinkingType( "" );
        utils.setDeepLinkingUrl( "" );
        this.props.navigation.navigate( 'WalletScreen' );
    }

    onSuccess = async () => {
        const dateTime = Date.now();
        this.setState( {
            flag_Loading: true
        } )
        let flag_Loading = true;
        let { keeperInfo } = this.state;
        let enterOtp = this.state.otp;
        let script = utils.getDeepLinkingUrl();


        var resDecryptViaOTP = await S3Service.decryptViaOTP( script.key, enterOtp );
        if ( resDecryptViaOTP.status == 200 ) {
            resDecryptViaOTP = resDecryptViaOTP.data;
        } else {
            alert.simpleOk( "Oops", resDecryptViaOTP.err );
        }
        console.log( { resDecryptViaOTP } );
        var resDownShare = await S3Service.downloadShare( resDecryptViaOTP.decryptedData );
        if ( resDownShare.status == 200 ) {
            resDownShare = resDownShare.data;
        } else {
            alert.simpleOk( "Oops", resDownShare.err );
        }
        console.log( { resDownShare } );
        let walletDetails = utils.getWalletDetails();
        const sss = await bitcoinClassState.getS3ServiceClassState();
        let regularAccount = await bitcoinClassState.getRegularClassState();
        var resGetWalletId = await regularAccount.getWalletId();
        if ( resGetWalletId.status == 200 ) {
            await bitcoinClassState.setRegularClassState( regularAccount );
            resGetWalletId = resGetWalletId.data;
        } else {
            alert.simpleOk( "Oops", resGetWalletId.err );
        }
        let resTrustedParty = await comFunDBRead.readTblTrustedPartySSSDetails();
        let arr_DecrShare = [];
        for ( let i = 0; i < resTrustedParty.length; i++ ) {
            arr_DecrShare.push( JSON.parse( resTrustedParty[ i ].decrShare ) );
        }
        let resDecryptEncMetaShare = await S3Service.decryptEncMetaShare( resDownShare.encryptedMetaShare, resDecryptViaOTP.decryptedData, resGetWalletId.walletId, arr_DecrShare );
        console.log( { resDecryptEncMetaShare } );
        if ( resDecryptEncMetaShare.status == 200 ) {
            console.log( { resDecryptEncMetaShare } );
            const resUpdateHealth = await sss.updateHealth( resDecryptEncMetaShare.data.decryptedMetaShare.meta.walletId, resDecryptEncMetaShare.data.decryptedMetaShare.encryptedShare );
            if ( resUpdateHealth.status == 200 ) {
                await bitcoinClassState.setS3ServiceClassState( sss );
                const resTrustedParty = await dbOpration.insertTrustedPartyDetails(
                    localDB.tableName.tblTrustedPartySSSDetails,
                    dateTime,
                    keeperInfo,
                    script,
                    resDecryptEncMetaShare.data.decryptedMetaShare,
                    resDecryptEncMetaShare.data.decryptedMetaShare.meta,
                    resDecryptEncMetaShare.data.decryptedMetaShare.encryptedStaticNonPMDD
                );
                if ( resTrustedParty ) {
                    flag_Loading = false;
                    setTimeout( () => {
                        alert.simpleOkAction( "Success", "Decrypted share stored.", this.goBack );
                    }, 100 );

                }
            }
        } else {
            flag_Loading = false;
            setTimeout( () => {
                alert.simpleOk( "Oops", resDecryptEncMetaShare.err );
            }, 100 );

        }
        this.setState( {
            flag_Loading
        } )
    }

    render() {
        return (
            <View style={ styles.container }>
                <ImageBackground source={ images.WalletSetupScreen.WalletScreen.backgoundImage } style={ styles.container }>
                    <CustomeStatusBar backgroundColor={ colors.white } flagShowStatusBar={ false } barStyle="dark-content" />
                    <KeyboardAwareScrollView
                        enableAutomaticScroll
                        automaticallyAdjustContentInsets={ true }
                        keyboardOpeningTime={ 0 }
                        enableOnAndroid={ true }
                        contentContainerStyle={ { flexGrow: 1 } }
                    >
                        <View style={ { marginLeft: 10, marginTop: 15 } }>
                            <Button
                                transparent
                                onPress={ () => this.props.navigation.pop() }
                            >
                                <SvgIcon name="icon_back" size={ Platform.OS == "ios" ? 25 : 20 } color="#000000" />
                                <Text style={ { color: "#000000", alignSelf: "center", fontSize: Platform.OS == "ios" ? 25 : 20, marginLeft: 0, fontFamily: "FiraSans-Medium" } }>Accept Secret via OTP</Text>
                            </Button>
                            <Text note style={ { textAlign: "center", marginTop: 10, marginRight: 10 } }>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                        </View>
                        <View style={ styles.viewPasscode }>
                            <Text
                                style={ { marginTop: 100, fontWeight: "bold", color: "#8B8B8B" } }
                            >
                                Enter OTP
                        </Text>
                            <CodeInput
                                secureTextEntry
                                keyboardType="name-phone-pad"
                                codeLength={ 6 }
                                activeColor={ this.state.passcodeStyle[ 0 ].activeColor }
                                inactiveColor={ this.state.passcodeStyle[ 0 ].inactiveColor }
                                className="border-box"
                                cellBorderWidth={ this.state.passcodeStyle[ 0 ].cellBorderWidth }
                                autoFocus={ true }
                                inputPosition="center"
                                space={ 5 }
                                size={ 50 }
                                codeInputStyle={ { borderRadius: 5, backgroundColor: "#F1F1F1" } }
                                containerStyle={ {
                                    alignItems: "center",
                                    justifyContent: "center",
                                    height: Platform.OS == "ios" ? 0 : 40,
                                } }
                                onFulfill={ ( code ) =>
                                    this._onFinishCheckingCode( code )
                                }
                                type='characters'
                            />
                            { renderIf( this.state.passcodeStyle[ 0 ].activeColor == "red" )(
                                <Text style={ { color: "red", marginTop: 44 } }>{ this.state.success }</Text>
                            ) }
                        </View>
                        <View style={ styles.viewBtnProceed }>
                            <Text note style={ { textAlign: "center", marginBottom: 30 } }>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</Text>
                            <FullLinearGradientButton
                                style={ [
                                    this.state.statusConfirmBtnDisable == true ? { opacity: 0.4 } : { opacity: 1 },
                                    { borderRadius: 5 } ] }
                                disabled={ this.state.statusConfirmBtnDisable }
                                title="Confirm & Proceed"
                                click_Done={ () => this.onSuccess() }
                            />
                        </View>
                    </KeyboardAwareScrollView>
                </ImageBackground>
                <Loader loading={ this.state.flag_Loading } color={ colors.appColor } size={ 30 } />
            </View>
        );
    }
}

let styles = StyleSheet.create( {
    container: {
        flex: 1
    },
    viewPagination: {
        flex: 2,
        alignItems: "center",
        justifyContent: "center",
        marginLeft: 30,
        marginRight: 30
    },
    viewAppLogo: {
        flex: 1,
        alignItems: "center",
        marginTop: 50
    },
    imgAppLogo: {
        height: 150,
        width: 150
    },
    viewPasscode: {
        flex: 1,
        alignItems: "center"
    },
    viewBtnProceed: {
        flex: 3,
        justifyContent: "flex-end",
        marginBottom: 20
    }
} );
