import config from '../../HexaConfig'
import SecureHDWallet from '../../utilities/accounts/SecureHDWallet'
import { ErrMap } from '../../utilities/ErrMap'
import {
  Transactions,
  DerivativeAccounts,
  TransactionDetails,
  TransactionPrerequisite,
  InputUTXOs,
  AverageTxFees,
} from '../../utilities/Interface'

export default class SecureAccount {
  public static fromJSON = ( json: string ) => {
    const { secureHDWallet } = JSON.parse( json )
    const {
      primaryMnemonic,
      secondaryMnemonic,
      accountName,
      accountDescription,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      primaryXpriv,
      secondaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      txIdMap,
      confirmedUTXOs,
      unconfirmedUTXOs,
      addressQueryList,
      twoFASetup,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      feeRates,
    }: {
      primaryMnemonic: string;
      secondaryMnemonic: string;
      accountName: string;
      accountDescription: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      primaryXpriv: string;
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      txIdMap: {[txid: string]: string[]};
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      unconfirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      feeRates: any;
    } = secureHDWallet

    return new SecureAccount( primaryMnemonic, {
      secondaryMnemonic,
      accountName,
      accountDescription,
      usedAddresses,
      nextFreeAddressIndex,
      nextFreeChangeAddressIndex,
      primaryXpriv,
      secondaryXpriv,
      xpubs,
      gapLimit,
      balances,
      receivingAddress,
      transactions,
      txIdMap,
      confirmedUTXOs,
      unconfirmedUTXOs,
      addressQueryList,
      twoFASetup,
      derivativeAccounts,
      lastBalTxSync,
      newTransactions,
      feeRates,
    } )
  };

  public secureHDWallet: SecureHDWallet;

  constructor(
    primaryMnemonic: string,
    stateVars?: {
      accountName: string;
      accountDescription: string;
      secondaryMnemonic: string;
      usedAddresses: string[];
      nextFreeAddressIndex: number;
      nextFreeChangeAddressIndex: number;
      primaryXpriv: string;
      secondaryXpriv?: string;
      xpubs: {
        primary: string;
        secondary: string;
        bh: string;
      };
      gapLimit: number;
      balances: { balance: number; unconfirmedBalance: number };
      receivingAddress: string;
      transactions: Transactions;
      txIdMap: {[txid: string]: string[]};
      confirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      unconfirmedUTXOs: Array<{
        txId: string;
        vout: number;
        value: number;
        address: string;
        status?: any;
      }>;
      addressQueryList: {external: {[address: string]: boolean}, internal: {[address: string]: boolean} };
      twoFASetup: {
        qrData: string;
        secret: string;
      };
      derivativeAccounts: DerivativeAccounts;
      lastBalTxSync: number;
      newTransactions: TransactionDetails[];
      feeRates: any;
    },
  ) {
    this.secureHDWallet = new SecureHDWallet( primaryMnemonic, stateVars )
  }

  public setupSecureAccount = async (): Promise<
    | {
        status: number;
        data: {
          setupData: {
            qrData: string;
            secret: string;
            bhXpub: string;
          };
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.setupSecureAccount(),
      }
    } catch ( err ) {
      return {
        status: 301, err: err.message, message: ErrMap[ 301 ]
      }
    }
  };


  public validate2FASetup = async ( token: number ): Promise<{
      status: number;
      data: {
          valid: Boolean;
      };
      err?: undefined;
      message?: undefined;
  } | {
      status: number;
      err: any;
      message: string;
      data?: undefined;
  }> => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.validate2FASetup( token ),
      }
    } catch ( err ) {
      return {
        status: 301, err: err.message, message: ErrMap[ 301 ]
      }
    }
  };


  public importSecureAccount = async (
    secondaryXpub: string,
    bhXpub?: string,
    token?: number,
  ): Promise<
    | {
        status: number;
        data: {
          imported: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      if ( !bhXpub ) {
        if ( !token ) {
          throw new Error( 'Neither a bhXpub nor a token is provided' )
        }
        const res = await this.secureHDWallet.importBHXpub( token )
        bhXpub = res.bhXpub
      }
      const { prepared } = this.secureHDWallet.prepareSecureAccount(
        bhXpub,
        secondaryXpub,
      )

      if ( !prepared ) {
        throw new Error( 'Import failed: unable to prepare secure account.' )
      }
      return {
        status: config.STATUS.SUCCESS, data: {
          imported: true
        }
      }
    } catch ( err ) {
      return {
        status: 302, err: err.message, message: ErrMap[ 302 ]
      }
    }
  };

  public decryptSecondaryXpub = (
    encryptedSecXpub: string,
  ):
    | {
        status: number;
        data: {
          secondaryXpub: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.decryptSecondaryXpub( encryptedSecXpub ),
      }
    } catch ( err ) {
      return {
        status: 303, err: err.message, message: ErrMap[ 303 ]
      }
    }
  };

  public checkHealth = async (
    chunk: string,
    pos: number,
  ): Promise<
    | {
        status: number;
        data: {
          isValid: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.checkHealth( chunk, pos ),
      }
    } catch ( err ) {
      return {
        status: 304, err: err.message, message: ErrMap[ 304 ]
      }
    }
  };

  public isActive = async (): Promise<
    | {
        status: number;
        data: {
          isActive: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.isActive(),
      }
    } catch ( err ) {
      return {
        status: 305, err: err.message, message: ErrMap[ 305 ]
      }
    }
  };

  public resetTwoFA = async (
    secondaryMnemonic: string,
  ): Promise<
    | {
        status: number;
        data: {
          qrData: any;
          secret: any;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.resetTwoFA( secondaryMnemonic ),
      }
    } catch ( err ) {
      return {
        status: 306, err: err.message, message: ErrMap[ 306 ]
      }
    }
  };

  public removeSecondaryMnemonic = (): { removed: boolean } =>
    this.secureHDWallet.removeSecondaryMnemonic();

  public removeTwoFADetails = (): { removed: boolean } =>
    this.secureHDWallet.removeTwoFADetails();

  public isSecondaryMnemonic = ( secondaryMnemonic: string ) =>
    this.secureHDWallet.isSecondaryMnemonic( secondaryMnemonic );

  public restoreSecondaryMnemonic = (
    secondaryMnemonic: string,
  ): {
    restored: boolean;
  } => this.secureHDWallet.restoreSecondaryMnemonic( secondaryMnemonic );

  public getSecondaryXpub = ():
    | {
        status: number;
        data: {
          secondaryXpub: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.getSecondaryXpub(),
      }
    } catch ( err ) {
      return {
        status: 308, err: err.message, message: ErrMap[ 308 ]
      }
    }
  };

  public getAccountId = (): string => this.secureHDWallet.getAccountId();

  public getPaymentURI = (
    address: string,
    options?: {
      amount: number;
      label?: string;
      message?: string;
    },
  ): {
    paymentURI: string;
  } => this.secureHDWallet.generatePaymentURI( address, options );

  public addressDiff = (
    scannedStr: string,
  ): {
    type: string;
  } => this.secureHDWallet.addressDiff( scannedStr );

  public decodePaymentURI = (
    paymentURI: string,
  ): {
    address: string;
    options: {
      amount?: number;
      label?: string;
      message?: string;
    };
  } => this.secureHDWallet.decodePaymentURI( paymentURI );

  public isValidAddress = ( recipientAddress: string ): boolean =>
    this.secureHDWallet.isValidAddress( recipientAddress );

  public getReceivingAddress = (
    derivativeAccountType?: string,
    accountNumber?: number,
  ) =>
    this.secureHDWallet.getReceivingAddress(
      derivativeAccountType,
      accountNumber,
    );

  public getBalanceTransactions = async ( hardRefresh?: boolean, blindRefresh?: boolean ): Promise<
    | {
        status: number;
        data: {
          balances: {
            balance: number;
            unconfirmedBalance: number;
          };
          transactions: {
            totalTransactions: number;
            confirmedTransactions: number;
            unconfirmedTransactions: number;
            transactionDetails: TransactionDetails[]
          };
          txsFound: TransactionDetails[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.fetchBalanceTransaction( hardRefresh, blindRefresh ),
      }
    } catch ( err ) {
      return {
        status: 0o3, err: err.message, message: ErrMap[ 0o3 ]
      }
    }
  };

  public syncDerivativeAccountsBalanceTxs = async (
    accountTypes: string[],
    hardRefresh?: boolean,
    blindRefresh?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
          txsFound: TransactionDetails[];
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.syncDerivativeAccountsBalanceTxs(
          accountTypes,
          hardRefresh,
          blindRefresh
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to sync derivative account\'s balance and transactions',
      }
    }
  };

  public syncViaXpubAgent = async (
    accountType: string,
    accountNumber: number,
  ): Promise<
    | {
        status: number;
        data: {
          synched: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.syncViaXpubAgent(
          accountType,
          accountNumber,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to sync xpub via xpub agent',
      }
    }
  };

  public setupDerivativeAccount = (
    accountType: string,
    accountDetails: { accountName?: string; accountDescription?: string },
  ):
    | {
        status: number;
        data: {
          accountId: string;
          accountNumber: number;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      } => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.setupDerivativeAccount(
          accountType,
          accountDetails,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to setup derivative acccount',
      }
    }
  };

  public updateAccountDetails =  (
    account: {
      kind: string,
      instanceNumber: number,
      customDescription: string,
      customDisplayName: string
    }
  ): {
    status: number;
    data: {
        updateSuccessful: boolean;
    };
    err?: undefined;
    message?: undefined;
  } | {
    status: number;
    err: any;
    message: string;
    data?: undefined;
  }  => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: this.secureHDWallet.updateAccountDetails(
          account
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to update account',
      }
    }
  };

  public setupDonationAccount = async (
    donee: string,
    subject: string,
    description: string,
    configuration: {
      displayBalance: boolean;
      displayTransactions: boolean;
      displayTxDetails: boolean;
    },
    disableAccount?: boolean,
  ): Promise<
    | {
        status: number;
        data: {
          setupSuccessful: boolean;
          accountId: string;
          accountNumber: number;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.setupDonationAccount(
          donee,
          subject,
          description,
          configuration,
          disableAccount,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to setup donation account',
      }
    }
  };

  public updateDonationPreferences = async (
    accountNumber: number,
    preferences: {
      disableAccount?: boolean;
      configuration?: {
        displayBalance: boolean;
        displayTransactions: boolean;
        displayTxDetails: boolean;
      };
      accountDetails?: {
        donee: string;
        subject: string;
        description: string;
      };
    },
  ): Promise<
    | {
        status: number;
        data: {
          updated: boolean;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.updateDonationPreferences(
          accountNumber,
          preferences,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message: 'Failed to update donation account preferences',
      }
    }
  };

  public generateSecondaryXpriv = (
    secondaryMnemonic: string,
  ): { generated: boolean } => {
    try {
      const generated = this.secureHDWallet.generateSecondaryXpriv(
        secondaryMnemonic,
      )
      return {
        generated
      }
    } catch ( err ) {
      // console.log({ err });
      return {
        generated: false
      }
    }
  };

  public calculateSendMaxFee = (
    numberOfRecipients: number,
    feePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.secureHDWallet.calculateSendMaxFee(
      numberOfRecipients,
      feePerByte,
      derivativeAccountDetails,
    );

  public calculateCustomFee = (
    outputUTXOs: {
      address: string;
      value: number;
    }[],
    customTxFeePerByte: number,
    derivativeAccountDetails?: { type: string; number: number },
  ) =>
    this.secureHDWallet.calculateCustomFee(
      outputUTXOs,
      customTxFeePerByte,
      derivativeAccountDetails,
    );

  public transferST1 = async (
    recipients: {
      address: string;
      amount: number;
    }[],
    averageTxFees: AverageTxFees,
    derivativeAccountDetails?: { type: string; number: number },
  ): Promise<
    | {
        status: number;
        data: {
          txPrerequisites: TransactionPrerequisite;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        fee?: number;
        netAmount?: number;
        data?: undefined;
      }
  > => {
    try {
      recipients = recipients.map( ( recipient ) => {
        recipient.amount = Math.round( recipient.amount )
        return recipient
      } )

      let {
        fee,
        balance,
        txPrerequisites,
      } = await this.secureHDWallet.transactionPrerequisites(
        recipients,
        averageTxFees,
        derivativeAccountDetails,
      )

      let netAmount = 0
      recipients.forEach( ( recipient ) => {
        netAmount += recipient.amount
      } )

      if ( balance < netAmount + fee ) {
        // check w/ the lowest fee possible for this transaction
        const minTxFeePerByte = 1 // default minimum relay fee
        const minAvgTxFee = {
          ...averageTxFees
        }
        minAvgTxFee[ 'low' ].feePerByte = minTxFeePerByte

        const minTxPrerequisites  = this.secureHDWallet.transactionPrerequisites(
          recipients,
          minAvgTxFee,
          derivativeAccountDetails,
        )

        if( minTxPrerequisites.balance < netAmount + minTxPrerequisites.fee )
          return {
            status: 0o6,
            err: 'Insufficient balance',
            fee,
            netAmount,
            message: ErrMap[ 0o6 ],
          }
        else txPrerequisites = minTxPrerequisites.txPrerequisites
      }

      if ( Object.keys( txPrerequisites ).length ) {
        return {
          status: config.STATUS.SUCCESS,
          data: {
            txPrerequisites
          },
        }
      } else {
        throw new Error(
          'Unable to create transaction: inputs failed at coinselect',
        )
      }

      // } else {
      //   throw new Error('Recipient address is wrong');
      // }
    } catch ( err ) {
      return {
        status: 106, err: err.message, message: ErrMap[ 106 ]
      }
    }
  };

  public transferST2 = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    derivativeAccountDetails?: { type: string; number: number },
    nSequence?: number,
  ): Promise<
    | {
        status: number;
        data: {
          txHex: string;
          childIndexArray: Array<{
            childIndex: number;
            inputIdentifier: {
              txId: string;
              vout: number;
            };
          }>;
          inputs: InputUTXOs[],
          derivativeAccountDetails?: { type: string; number: number },
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      const { txb } = await this.secureHDWallet.createHDTransaction(
        txPrerequisites,
        txnPriority.toLowerCase(),
        customTxPrerequisites,
        derivativeAccountDetails,
        nSequence,
      )

      let inputs: InputUTXOs[]
      if ( txnPriority === 'custom' && customTxPrerequisites ) {
        inputs = customTxPrerequisites.inputs
      } else {
        inputs = txPrerequisites[ txnPriority.toLowerCase() ].inputs
      }

      const {
        signedTxb,
        childIndexArray,
      } = await this.secureHDWallet.signHDTransaction( inputs, txb )

      const txHex = signedTxb.buildIncomplete().toHex()

      // console.log(
      //   '---- Transaction signed by the user (1st sig for 2/3 MultiSig)----',
      // );

      return {
        status: config.STATUS.SUCCESS,
        data: {
          txHex, childIndexArray, inputs, derivativeAccountDetails
        },
      }
    } catch ( err ) {
      return {
        status: 310, err: err.message, message: ErrMap[ 310 ]
      }
    }
  };

  public transferST3 = async (
    token: number,
    txHex: string,
    childIndexArray: Array<{
      childIndex: number;
      inputIdentifier: {
        txId: string;
        vout: number;
      };
    }>,
    inputs: InputUTXOs[],
    derivativeAccountDetails?: { type: string; number: number },
  ): Promise<
    | {
        status: number;
        data: {
          txid: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      const { txid } =  await this.secureHDWallet.serverSigningAndBroadcast(
        token,
        txHex,
        childIndexArray,
      )
      if( txid ){
        // chip consumed utxos
        this.secureHDWallet.removeConsumedUTXOs( inputs, derivativeAccountDetails )
      }

      return {
        status: config.STATUS.SUCCESS,
        data: {
          txid
        }
      }
    } catch ( err ) {
      return {
        status: 311, err: err.message, message: ErrMap[ 311 ]
      }
    }
  };

  public alternateTransferST2 = async (
    txPrerequisites: TransactionPrerequisite,
    txnPriority: string,
    customTxPrerequisites?: any,
    derivativeAccountDetails?: { type: string; number: number },
    nSequence?: number,
  ): Promise<
    | {
        status: number;
        data: {
          txid: string;
        };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: string;
        message: string;
        data?: undefined;
      }
  > => {
    let executed = 'tx-init'
    try {
      const { txb } = await this.secureHDWallet.createHDTransaction(
        txPrerequisites,
        txnPriority.toLowerCase(),
        customTxPrerequisites,
        derivativeAccountDetails,
        nSequence,
      )
      executed = 'tx-creation'

      const { inputs } = txPrerequisites[ txnPriority.toLowerCase() ]

      const { signedTxb } = this.secureHDWallet.dualSignHDTransaction(
        inputs,
        txb,
      )
      // console.log('---- Transaction Signed ----');
      executed = 'tx-signing'

      const txHex = signedTxb.build().toHex()
      // console.log({ txHex });
      const { txid } = await this.secureHDWallet.broadcastTransaction( txHex )
      if( txid ){
        // chip consumed utxos
        this.secureHDWallet.removeConsumedUTXOs( inputs, derivativeAccountDetails )
      }
      executed = 'tx-broadcast'
      // console.log('---- Transaction Broadcasted ----');
      // console.log({ txid });

      this.secureHDWallet.removeSecondaryXpriv()

      return {
        status: config.STATUS.SUCCESS, data: {
          txid
        }
      }
    } catch ( err ) {
      return {
        status: 107,
        err: err.message + `(failed post: ${executed})`,
        message: ErrMap[ 107 ],
      }
    }
  };

  public getDerivativeAccAddress = async (
    accountType: string,
    accountNumber?: number,
    contactName?: string,
    accountName?: string,
  ): Promise<
    | {
        status: number;
        data: { address: string };
        err?: undefined;
        message?: undefined;
      }
    | {
        status: number;
        err: any;
        message: string;
        data?: undefined;
      }
  > => {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.getDerivativeAccReceivingAddress(
          accountType,
          accountNumber,
          contactName,
          accountName,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o1,
        err: err.message,
        message: 'Failed to generate derivative account\'s address',
      }
    }
  };

  public getDerivativeAccBalanceTransactions = async (
    accountInfo: {
      accountType: string,
      accountNumber: number,
      contactName?: string,
    }[],
    hardRefresh?: boolean,
    blindRefresh?: boolean,
  ):  Promise<
  | {
      status: number;
      data: {
        synched: boolean;
        txsFound: TransactionDetails[];
      };
      err?: undefined;
      message?: undefined;
    }
  | {
      status: number;
      err: string;
      message: string;
      data?: undefined;
    }
  >=> {
    try {
      return {
        status: config.STATUS.SUCCESS,
        data: await this.secureHDWallet.fetchDerivativeAccBalanceTxs(
          accountInfo,
          hardRefresh,
          blindRefresh,
        ),
      }
    } catch ( err ) {
      return {
        status: 0o3,
        err: err.message,
        message:
          'Failed to generate derivative account\'s balance and transactions',
      }
    }
  };
}
