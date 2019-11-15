import RegularAccount from "../../bitcoin/services/accounts/RegularAccount";
import TestAccount from "../../bitcoin/services/accounts/TestAccount";
import SecureAccount from "../../bitcoin/services/accounts/SecureAccount";
import S3Service from "../../bitcoin/services/sss/S3Service";

export interface Database {
  walletName?: String;
  securityAns?: String;
  accounts?: {
    REGULAR_ACCOUNT: string;
    TEST_ACCOUNT: string;
    SECURE_ACCOUNT: string;
    S3_SERVICE: string;
  };
  secureAccSetupData?:{
    bhXpub:string;
    qrData: string;
    secret: string;
  };
  secureAccIsActive?:boolean;
  
}

export interface Services {
  REGULAR_ACCOUNT?: RegularAccount;
  TEST_ACCOUNT?: TestAccount;
  SECURE_ACCOUNT?: SecureAccount;
  S3_SERVICE?: S3Service;
}
